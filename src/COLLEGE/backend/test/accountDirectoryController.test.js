const { afterEach, test } = require("node:test");
const assert = require("node:assert/strict");

const Student = require("../models/Student");
const {
  getStudentDirectory,
} = require("../controllers/accountDirectoryController");

const originalFind = Student.find;
const originalDistinct = Student.distinct;

const invoke = async ({ role, reviewer, query = {} }) => {
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
  await getStudentDirectory({ user: { role }, reviewer, query }, response);
  return { statusCode, body };
};

afterEach(() => {
  Student.find = originalFind;
  Student.distinct = originalDistinct;
});

test("faculty student directory is restricted to its assigned branch and real sections", async () => {
  let studentFilter;
  let sectionsFilter;
  Student.find = (filter) => {
    studentFilter = filter;
    return {
      select() { return this; },
      sort() { return this; },
      lean: async () => [{ _id: "student-1", branch: "CSE-AI", section: "A" }],
    };
  };
  Student.distinct = async (_field, filter) => {
    sectionsFilter = filter;
    return ["B", "A"];
  };

  const result = await invoke({
    role: "faculty",
    reviewer: { branch: "CSE-AI", department: "CSE" },
    query: { branch: "Other-Branch", search: "Maya", section: "A" },
  });

  assert.equal(result.statusCode, 200);
  assert.deepEqual(studentFilter, {
    isActive: true,
    branch: "CSE-AI",
    section: "A",
    $or: [
      { name: /Maya/i },
      { rollNumber: /Maya/i },
      { email: /Maya/i },
    ],
  });
  assert.deepEqual(sectionsFilter, {
    branch: "CSE-AI",
    isActive: true,
    section: { $nin: ["", null] },
  });
  assert.deepEqual(result.body.sections, ["A", "B"]);
});

test("HOD student directory remains restricted to the HOD department", async () => {
  let filter;
  Student.find = (query) => {
    filter = query;
    return {
      select() { return this; },
      sort() { return this; },
      lean: async () => [],
    };
  };
  Student.distinct = async () => ["A"];

  const result = await invoke({
    role: "hod",
    reviewer: { department: "CSE" },
    query: { branch: "Other-Branch" },
  });

  assert.equal(result.statusCode, 200);
  assert.deepEqual(filter, { isActive: true, branch: "CSE" });
});
