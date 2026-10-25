const { test } = require("node:test");
const assert = require("node:assert/strict");

const Admin = require("../models/Admin");
const Placement = require("../models/Placement");
const Student = require("../models/Student");
const {
  getPlacements,
  createPlacement,
  deletePlacement,
} = require("../controllers/placementController");

const methods = [
  [Admin, "findOne"],
  [Placement, "find"],
  [Placement, "create"],
  [Placement, "findByIdAndUpdate"],
  [Student, "findOne"],
];

const query = (value) => ({
  select() { return this; },
  sort() { return this; },
  lean: async () => value,
});

const invoke = async (controller, request) => {
  let statusCode;
  let body;
  const response = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(value) {
      body = value;
      return this;
    },
  };
  await controller(request, response);
  return { statusCode, body };
};

const withStubs = async (stubs, action) => {
  const saved = methods.map(([model, method]) => [model, method, model[method]]);
  for (const [model, method, implementation] of stubs) {
    model[method] = implementation;
  }
  try {
    await action();
  } finally {
    for (const [model, method, implementation] of saved) {
      model[method] = implementation;
    }
  }
};

const adminId = "65f0c0a12345678901234567";
const studentId = "65f0c0a12345678901234568";
const placementId = "65f0c0a12345678901234569";

test("student placement lookup is limited to their branch, global listings, and open deadlines", async () => {
  await withStubs([
    [Student, "findOne", (filter) => {
      assert.deepEqual(filter, { _id: studentId, isActive: true });
      return { select: async () => ({ _id: studentId, branch: "CSE-AI" }) };
    }],
    [Placement, "find", (filter) => {
      assert.deepEqual(filter.branch, { $in: ["All", "CSE-AI"] });
      assert.ok(filter.applicationDeadline.$gte instanceof Date);
      return {
        sort() { return this; },
        lean: async () => [{ companyName: "Example", branch: "CSE-AI" }],
      };
    }],
  ], async () => {
    const result = await invoke(getPlacements, {
      user: { role: "student", userId: studentId },
    });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.placements[0].companyName, "Example");
  });
});

test("Admin publishes a database placement with validated details and owner", async () => {
  let savedPlacement;
  await withStubs([
    [Admin, "findOne", (filter) => {
      assert.deepEqual(filter, { _id: adminId, isActive: true });
      return { select: async () => ({ _id: adminId }) };
    }],
    [Placement, "create", async (values) => {
      savedPlacement = values;
      return { ...values, _id: placementId };
    }],
  ], async () => {
    const result = await invoke(createPlacement, {
      user: { userId: adminId },
      body: {
        company: "Example Corp",
        role: "Graduate Engineer",
        branch: "CSE-AI",
        location: "Hyderabad",
        package: "8 LPA",
        deadline: "2026-12-01",
        description: "Apply through the company portal.",
        eligibility: "7 CGPA",
        applyLink: "https://example.com/careers",
      },
    });
    assert.equal(result.statusCode, 201);
    assert.equal(savedPlacement.companyName, "Example Corp");
    assert.equal(savedPlacement.branch, "CSE-AI");
    assert.equal(savedPlacement.createdBy, adminId);
    assert.equal(savedPlacement.applicationDeadline.toISOString(), "2026-12-01T23:59:59.999Z");
  });
});

test("placement creation rejects invalid dates and unsafe application URLs", async () => {
  const result = await invoke(createPlacement, {
    user: { userId: adminId },
    body: {
      company: "Example Corp",
      role: "Graduate Engineer",
      branch: "CSE-AI",
      location: "Hyderabad",
      deadline: "2026-02-30",
      description: "Apply through the company portal.",
      applyLink: "javascript:alert(1)",
    },
  });
  assert.equal(result.statusCode, 400);
});

test("Admin removes a placement by marking it inactive", async () => {
  await withStubs([
    [Admin, "findOne", () => ({ select: async () => ({ _id: adminId }) })],
    [Placement, "findByIdAndUpdate", async (id, update) => {
      assert.equal(id, placementId);
      assert.deepEqual(update, { $set: { isActive: false } });
      return { _id: id, isActive: false };
    }],
  ], async () => {
    const result = await invoke(deletePlacement, {
      user: { userId: adminId },
      params: { id: placementId },
    });
    assert.equal(result.statusCode, 200);
  });
});
