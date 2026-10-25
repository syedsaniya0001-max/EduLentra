const { test } = require("node:test");
const assert = require("node:assert/strict");

const StudyMaterial = require("../models/StudyMaterial");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const {
  getFacultyMaterials,
  createStudyMaterial,
  deleteStudyMaterial,
  getStudentMaterials,
} = require("../controllers/studyMaterialController");

const methods = [
  [StudyMaterial, "find"],
  [StudyMaterial, "create"],
  [StudyMaterial, "findOneAndDelete"],
  [Faculty, "findOne"],
  [Student, "find"],
  [Student, "findOne"],
  [Student, "countDocuments"],
];

const query = (value) => ({
  select() { return this; },
  sort() { return this; },
  populate() { return this; },
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

const facultyId = "65f0c0a12345678901234567";
const studentId = "65f0c0a12345678901234568";
const materialId = "65f0c0a12345678901234569";
const faculty = {
  _id: facultyId,
  name: "Faculty One",
  branch: "CSE-AI",
  department: "CSE-AI",
  subject: "Machine Learning",
};
const student = {
  _id: studentId,
  branch: "CSE-AI",
  section: "A",
};

test("faculty material listing is based on owned records and real branch sections", async () => {
  await withStubs([
    [Faculty, "findOne", () => ({ select: async () => faculty })],
    [StudyMaterial, "find", (filter) => {
      assert.deepEqual(filter, { faculty: facultyId });
      return {
        sort() { return this; },
        lean: async () => [{
          _id: materialId,
          title: "Unit 1",
          createdAt: new Date("2026-10-25T00:00:00Z"),
        }],
      };
    }],
    [Student, "find", () => query([
      { section: "A" },
      { section: "B" },
      { section: "" },
    ])],
  ], async () => {
    const result = await invoke(getFacultyMaterials, {
      user: { userId: facultyId },
      query: { search: "", subject: "All" },
    });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.subject, "Machine Learning");
    assert.deepEqual(result.body.sections, ["A", "B", "__unassigned__"]);
    assert.equal(result.body.materials[0].id, materialId);
  });
});

test("faculty publishes only to active students in real sections using account subject", async () => {
  let created;
  await withStubs([
    [Faculty, "findOne", () => ({ select: async () => faculty })],
    [Student, "countDocuments", async (filter) => {
      assert.deepEqual(filter, { branch: "CSE-AI", isActive: true, section: "A" });
      return 1;
    }],
    [StudyMaterial, "create", async (value) => {
      created = value;
      return { ...value, _id: materialId, createdAt: new Date() };
    }],
  ], async () => {
    const result = await invoke(createStudyMaterial, {
      user: { userId: facultyId },
      body: {
        title: "Unit 1 Notes",
        description: "Intro",
        unit: "Unit 1",
        section: "A",
        fileName: "unit1.pdf",
        fileUrl: "https://example.edu/unit1.pdf",
        subject: "untrusted subject",
        branch: "untrusted branch",
      },
    });
    assert.equal(result.statusCode, 201);
    assert.equal(created.subject, "Machine Learning");
    assert.equal(created.branch, "CSE-AI");
    assert.equal(created.section, "A");
  });
});

test("faculty materials reject non-web URLs", async () => {
  const result = await invoke(createStudyMaterial, {
    user: { userId: facultyId },
    body: {
      title: "Unit 1",
      unit: "Unit 1",
      section: "A",
      fileName: "unit1.pdf",
      fileUrl: "javascript:alert(1)",
    },
  });
  assert.equal(result.statusCode, 400);
});

test("faculty can delete only a material they own", async () => {
  await withStubs([
    [Faculty, "findOne", () => ({ select: async () => faculty })],
    [StudyMaterial, "findOneAndDelete", async (filter) => {
      assert.deepEqual(filter, { _id: materialId, faculty: facultyId });
      return { _id: materialId };
    }],
  ], async () => {
    const result = await invoke(deleteStudyMaterial, {
      user: { userId: facultyId },
      params: { materialId },
    });
    assert.equal(result.statusCode, 200);
  });
});

test("students see materials for their branch and section or all sections", async () => {
  await withStubs([
    [Student, "findOne", () => ({ select: async () => student })],
    [StudyMaterial, "find", (filter) => {
      assert.deepEqual(filter, {
        branch: "CSE-AI",
        section: { $in: ["A", "*"] },
      });
      return {
        populate() { return this; },
        sort() { return this; },
        lean: async () => [
          { _id: "a", branch: "CSE-AI", section: "A", title: "Section A" },
          { _id: "all", branch: "CSE-AI", section: "*", title: "All sections" },
        ],
      };
    }],
  ], async () => {
    const result = await invoke(getStudentMaterials, {
      user: { userId: studentId },
    });
    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body.materials.map((material) => material.title), [
      "Section A",
      "All sections",
    ]);
  });
});
