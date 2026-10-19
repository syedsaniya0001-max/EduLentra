const { afterEach, test } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");

const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");
const StudentRequest = require("../models/StudentRequest");
const FacultyRequest = require("../models/FacultyRequest");
const HODRequest = require("../models/HODRequest");
const { signupStudent } = require("../controllers/studentController");
const { signupFaculty } = require("../controllers/facultyController");
const { signupHOD } = require("../controllers/hodController");

const originalMethods = [
  [Student, "findOne", Student.findOne],
  [Faculty, "findOne", Faculty.findOne],
  [HOD, "findOne", HOD.findOne],
  [StudentRequest, "findOne", StudentRequest.findOne],
  [StudentRequest, "create", StudentRequest.create],
  [FacultyRequest, "findOne", FacultyRequest.findOne],
  [FacultyRequest, "create", FacultyRequest.create],
  [HODRequest, "findOne", HODRequest.findOne],
  [HODRequest, "create", HODRequest.create],
];

const invoke = async (controller, body) => {
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

  await controller({ body }, response);
  return { statusCode, body: responseBody };
};

afterEach(() => {
  for (const [Model, method, original] of originalMethods) {
    Model[method] = original;
  }
});

test("each public signup stores a pending request with a bcrypt hash and issues no token", async () => {
  const signups = [
    {
      controller: signupStudent,
      account: Student,
      request: StudentRequest,
      password: "StudentPassword!2026",
      body: {
        name: "Test Student",
        rollNumber: "TEST-STU-1",
        email: "student@example.test",
        branch: "CSE",
        section: "A",
        entryType: "Day Scholar",
      },
    },
    {
      controller: signupFaculty,
      account: Faculty,
      request: FacultyRequest,
      password: "FacultyPassword!2026",
      body: {
        name: "Test Faculty",
        facultyId: "TEST-FAC-1",
        email: "faculty@example.test",
        subject: "Math",
        department: "CSE",
        branch: "CSE-AI",
      },
    },
    {
      controller: signupHOD,
      account: HOD,
      request: HODRequest,
      password: "HodPassword!2026",
      body: {
        name: "Test HOD",
        hodId: "TEST-HOD-1",
        email: "hod@example.test",
        department: "CSE",
      },
    },
  ];

  for (const { controller, account, request, password, body } of signups) {
    let stored;
    account.findOne = async () => null;
    request.findOne = async () => null;
    request.create = async (requestData) => {
      stored = requestData;
      return { _id: "pending-request" };
    };

    const result = await invoke(controller, { ...body, password });
    assert.equal(result.statusCode, 201);
    assert.equal(stored.status, "PENDING");
    assert.notEqual(stored.password, password);
    assert.equal(await bcrypt.compare(password, stored.password), true);
    if (controller === signupFaculty) {
      assert.equal(stored.branch, "CSE-AI");
    }
    assert.equal("token" in result.body, false);
  }
});

test("signup rejects short passwords before persisting a request", async () => {
  let createCalled = false;
  Student.findOne = async () => null;
  StudentRequest.findOne = async () => null;
  StudentRequest.create = async () => {
    createCalled = true;
  };

  const result = await invoke(signupStudent, {
    name: "Test Student",
    rollNumber: "TEST-STU-2",
    email: "student2@example.test",
    branch: "CSE",
    section: "A",
    entryType: "Day Scholar",
    password: "short",
  });

  assert.equal(result.statusCode, 400);
  assert.equal(createCalled, false);
});
