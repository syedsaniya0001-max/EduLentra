const { afterEach, test } = require("node:test");
const assert = require("node:assert/strict");

const OutpassRequest = require("../models/OutpassRequest");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const {
  getFacultyOutpassRequests,
  getHODOutpassRequests,
  updateOutpassRequest,
} = require("../controllers/outpassController");

const originalMethods = {
  outpassFind: OutpassRequest.find,
  outpassFindOne: OutpassRequest.findOne,
  studentFind: Student.find,
  facultyFindOne: Faculty.findOne,
};

const invoke = async (controller, { user = {}, reviewer, params = {}, body = {} }) => {
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
  await controller({ user, reviewer, params, body }, response);
  return { statusCode, body: responseBody };
};

afterEach(() => {
  OutpassRequest.find = originalMethods.outpassFind;
  OutpassRequest.findOne = originalMethods.outpassFindOne;
  Student.find = originalMethods.studentFind;
  Faculty.findOne = originalMethods.facultyFindOne;
});

test("faculty can list outpasses only for active students in the assigned branch", async () => {
  let facultyFilter;
  let studentFilter;
  let outpassFilter;
  Faculty.findOne = (filter) => {
    facultyFilter = filter;
    return { select: async () => ({ branch: "CSE-A", department: "CSE" }) };
  };
  Student.find = (filter) => {
    studentFilter = filter;
    return { select: async () => [{ _id: "student-cse-a" }] };
  };
  OutpassRequest.find = (filter) => {
    outpassFilter = filter;
    return {
      populate() { return this; },
      sort() { return this; },
      lean: async () => [{ _id: "outpass-cse-a" }],
    };
  };

  const result = await invoke(getFacultyOutpassRequests, {
    user: { userId: "faculty-id" },
  });

  assert.equal(result.statusCode, 200);
  assert.deepEqual(facultyFilter, { _id: "faculty-id", isActive: true });
  assert.deepEqual(studentFilter, { branch: "CSE-A", isActive: true });
  assert.deepEqual(outpassFilter, { student: { $in: ["student-cse-a"] } });
  assert.equal(result.body.outpasses.length, 1);
});

test("faculty with no branch students receives an empty outpass list", async () => {
  Faculty.findOne = () => ({
    select: async () => ({ department: "CSE", branch: "" }),
  });
  Student.find = () => ({ select: async () => [] });
  OutpassRequest.find = () => {
    throw new Error("Outpasses should not be queried without assigned students.");
  };

  const result = await invoke(getFacultyOutpassRequests, {
    user: { userId: "faculty-id" },
  });

  assert.equal(result.statusCode, 200);
  assert.deepEqual(result.body.outpasses, []);
});

test("HOD can list only outpasses for active students in their department", async () => {
  let studentFilter;
  let outpassFilter;
  Student.find = (filter) => {
    studentFilter = filter;
    return {
      select: async () => [{ _id: "student-cse" }],
    };
  };
  OutpassRequest.find = (filter) => {
    outpassFilter = filter;
    return {
      populate() { return this; },
      sort() { return this; },
      lean: async () => [{ _id: "outpass-1" }],
    };
  };

  const result = await invoke(getHODOutpassRequests, {
    reviewer: { _id: "hod-id", department: "CSE" },
  });

  assert.equal(result.statusCode, 200);
  assert.deepEqual(studentFilter, { branch: "CSE", isActive: true });
  assert.deepEqual(outpassFilter, { student: { $in: ["student-cse"] } });
  assert.equal(result.body.outpasses.length, 1);
});

test("HOD can approve a department outpass and is recorded as the reviewer", async () => {
  const id = "65f0c0a12345678901234567";
  let studentFilter;
  let outpassFilter;
  const outpass = {
    _id: id,
    status: "PENDING",
    save: async () => {},
  };
  Student.find = (filter) => {
    studentFilter = filter;
    return {
      select: async () => [{ _id: "student-cse" }],
    };
  };
  OutpassRequest.findOne = async (filter) => {
    outpassFilter = filter;
    return outpass;
  };

  const result = await invoke(updateOutpassRequest, {
    user: { userId: "hod-id", role: "hod" },
    reviewer: { _id: "hod-id", department: "CSE" },
    params: { id },
    body: { status: "APPROVED", remarks: "Approved." },
  });

  assert.equal(result.statusCode, 200);
  assert.deepEqual(studentFilter, { branch: "CSE", isActive: true });
  assert.deepEqual(outpassFilter, { _id: id, student: { $in: ["student-cse"] } });
  assert.equal(outpass.status, "APPROVED");
  assert.equal(outpass.reviewedBy, "hod-id");
  assert.equal(outpass.reviewedByModel, "HOD");
  assert.equal(outpass.reviewRemarks, "Approved.");
  assert.equal(outpass.rejectionReason, "");
  assert.ok(outpass.reviewedAt instanceof Date);
});

test("faculty cannot review an outpass belonging to another branch", async () => {
  const id = "65f0c0a12345678901234567";
  let studentFilter;
  let outpassFilter;
  Faculty.findOne = () => ({
    select: async () => ({
      _id: "faculty-id",
      name: "Faculty",
      department: "CSE",
      branch: "CSE-A",
    }),
  });
  Student.find = (filter) => {
    studentFilter = filter;
    return { select: async () => [{ _id: "student-cse-a" }] };
  };
  OutpassRequest.findOne = async (filter) => {
    outpassFilter = filter;
    return null;
  };

  const result = await invoke(updateOutpassRequest, {
    user: { userId: "faculty-id", role: "faculty" },
    params: { id },
    body: { status: "APPROVED", remarks: "Approved." },
  });

  assert.equal(result.statusCode, 404);
  assert.deepEqual(studentFilter, { branch: "CSE-A", isActive: true });
  assert.deepEqual(outpassFilter, {
    _id: id,
    student: { $in: ["student-cse-a"] },
  });
});

test("HOD cannot update an outpass outside their department", async () => {
  const id = "65f0c0a12345678901234567";
  let outpassFilter;
  Student.find = () => ({
    select: async () => [{ _id: "other-department-student" }],
  });
  OutpassRequest.findOne = async (filter) => {
    outpassFilter = filter;
    return null;
  };

  const result = await invoke(updateOutpassRequest, {
    user: { userId: "hod-id", role: "hod" },
    reviewer: { _id: "hod-id", department: "CSE" },
    params: { id },
    body: { status: "REJECTED", remarks: "Out of scope" },
  });

  assert.equal(result.statusCode, 404);
  assert.deepEqual(outpassFilter, {
    _id: id,
    student: { $in: ["other-department-student"] },
  });
});
