const { test } = require("node:test");
const assert = require("node:assert/strict");

const HOD = require("../models/HOD");
const HODRequest = require("../models/HODRequest");
const { updateHODProfile } = require("../controllers/hodAccountController");

const invoke = async (body) => {
  let statusCode;
  let responseBody;
  const response = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(value) {
      responseBody = value;
      return this;
    },
  };
  await updateHODProfile({ user: { userId: "hod-1" }, body }, response);
  return { statusCode, body: responseBody };
};

test("HOD profile updates a validated name and normalized email", async () => {
  const saved = [HOD.findOne, HODRequest.findOne];
  const hod = {
    _id: "hod-1",
    hodId: "HOD-101",
    name: "Old Name",
    email: "old@example.edu",
    department: "CSE-AI",
    save: async function save() {},
  };
  HOD.findOne = (filter) => {
    if (filter._id === "hod-1") return hod;
    assert.deepEqual(filter, { email: "new@example.edu", _id: { $ne: "hod-1" } });
    return { select: async () => null };
  };
  HODRequest.findOne = (filter) => {
    assert.deepEqual(filter, { email: "new@example.edu", status: "PENDING" });
    return { select: async () => null };
  };

  try {
    const result = await invoke({ name: "  New Name ", email: " NEW@EXAMPLE.EDU " });
    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body.user, {
      name: "New Name",
      username: "HOD-101",
      email: "new@example.edu",
      department: "CSE-AI",
    });
  } finally {
    [HOD.findOne, HODRequest.findOne] = saved;
  }
});

test("HOD profile rejects invalid name or email before database access", async () => {
  const saved = [HOD.findOne, HODRequest.findOne];
  HOD.findOne = () => {
    throw new Error("Database must not be queried for invalid input.");
  };

  try {
    const result = await invoke({ name: "X", email: "invalid" });
    assert.equal(result.statusCode, 400);
    assert.match(result.body.message, /valid email address/);
  } finally {
    [HOD.findOne, HODRequest.findOne] = saved;
  }
});

test("HOD profile rejects an email used by another active HOD", async () => {
  const saved = [HOD.findOne, HODRequest.findOne];
  const hod = {
    _id: "hod-1",
    name: "Old Name",
    email: "old@example.edu",
  };
  HOD.findOne = (filter) => {
    if (filter._id === "hod-1") return hod;
    return { select: async () => ({ _id: "hod-2" }) };
  };
  HODRequest.findOne = () => ({ select: async () => null });

  try {
    const result = await invoke({ name: "New Name", email: "taken@example.edu" });
    assert.equal(result.statusCode, 409);
    assert.match(result.body.message, /already assigned/);
  } finally {
    [HOD.findOne, HODRequest.findOne] = saved;
  }
});
