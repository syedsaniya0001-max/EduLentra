const { afterEach, test } = require("node:test");
const assert = require("node:assert/strict");

const Student = require("../models/Student");
const { getStudentProfile } = require("../controllers/studentProfileController");

const originalFindOne = Student.findOne;

const invoke = async (userId) => {
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
  await getStudentProfile({ user: { userId } }, response);
  return { statusCode, body };
};

afterEach(() => {
  Student.findOne = originalFindOne;
});

test("student profile returns only the signed-in active student's profile", async () => {
  let query;
  let selected;
  const profile = {
    _id: "student-id",
    name: "Maya Student",
    rollNumber: "ST-2026",
    email: "maya@example.edu",
    branch: "CSE-AI",
    section: "A",
  };
  Student.findOne = (filter) => {
    query = filter;
    return {
      select(fields) {
        selected = fields;
        return this;
      },
      lean: async () => profile,
    };
  };

  const result = await invoke("student-id");
  assert.equal(result.statusCode, 200);
  assert.deepEqual(query, { _id: "student-id", isActive: true });
  assert.match(selected, /name/);
  assert.match(selected, /rollNumber/);
  assert.equal(result.body.student, profile);
});

test("student profile returns not found when the account is inactive or missing", async () => {
  Student.findOne = () => ({
    select() {
      return this;
    },
    lean: async () => null,
  });

  const result = await invoke("student-id");
  assert.equal(result.statusCode, 404);
  assert.equal(result.body.message, "Student profile not found.");
});
