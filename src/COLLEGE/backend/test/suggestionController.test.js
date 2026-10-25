const { afterEach, test } = require("node:test");
const assert = require("node:assert/strict");

const Suggestion = require("../models/Suggestion");
const Student = require("../models/Student");
const {
  createSuggestion,
  getStudentSuggestions,
  getDepartmentSuggestions,
  updateSuggestion,
} = require("../controllers/suggestionController");

const originalSuggestionMethods = {
  create: Suggestion.create,
  find: Suggestion.find,
  findOne: Suggestion.findOne,
};
const originalStudentFindOne = Student.findOne;

const invoke = async (controller, { user, reviewer, body = {}, params = {} }) => {
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

  await controller({ user, reviewer, body, params }, response);
  return { statusCode, body: responseBody };
};

afterEach(() => {
  Suggestion.create = originalSuggestionMethods.create;
  Suggestion.find = originalSuggestionMethods.find;
  Suggestion.findOne = originalSuggestionMethods.findOne;
  Student.findOne = originalStudentFindOne;
});

test("students can submit validated suggestions attached to their department", async () => {
  let saved;
  Student.findOne = () => ({
    select: async () => ({ _id: "student-id", branch: "CSE-AI" }),
  });
  Suggestion.create = async (values) => {
    saved = values;
    return { ...values, _id: "suggestion-id", status: "SUBMITTED" };
  };

  const result = await invoke(createSuggestion, {
    user: { userId: "student-id", role: "student" },
    body: { message: "  Add more lab equipment.  " },
  });

  assert.equal(result.statusCode, 201);
  assert.equal(saved.student, "student-id");
  assert.equal(saved.department, "CSE-AI");
  assert.equal(saved.message, "Add more lab equipment.");
});

test("suggestion submission validates text and requires an active student", async () => {
  let createCalled = false;
  Suggestion.create = async () => { createCalled = true; };

  const invalid = await invoke(createSuggestion, {
    user: { userId: "student-id", role: "student" },
    body: { message: "   " },
  });
  assert.equal(invalid.statusCode, 400);

  Student.findOne = () => ({ select: async () => null });
  const inactive = await invoke(createSuggestion, {
    user: { userId: "student-id", role: "student" },
    body: { message: "A valid suggestion" },
  });
  assert.equal(inactive.statusCode, 403);
  assert.equal(createCalled, false);
});

test("students can only list suggestions attached to their account", async () => {
  let filter;
  Suggestion.find = (query) => {
    filter = query;
    return {
      sort() {
        return this;
      },
      lean: async () => [],
    };
  };

  const result = await invoke(getStudentSuggestions, {
    user: { userId: "student-id", role: "student" },
  });
  assert.equal(result.statusCode, 200);
  assert.deepEqual(filter, { student: "student-id" });
  assert.deepEqual(result.body.suggestions, []);
});

test("HOD suggestion list is restricted to the reviewer's department", async () => {
  let filter;
  Suggestion.find = (query) => {
    filter = query;
    return {
      populate() {
        return this;
      },
      sort() {
        return this;
      },
      lean: async () => [],
    };
  };

  const result = await invoke(getDepartmentSuggestions, {
    reviewer: { _id: "hod-id", department: "CSE-AI" },
  });
  assert.equal(result.statusCode, 200);
  assert.deepEqual(filter, { department: "CSE-AI" });
});

test("HOD can update a suggestion and student-visible response", async () => {
  const suggestionId = "65f0c0a12345678901234567";
  const existingSuggestion = {
    _id: suggestionId,
    department: "CSE-AI",
    save: async () => {},
  };
  let filter;
  Suggestion.findOne = async (query) => {
    filter = query;
    return existingSuggestion;
  };

  const result = await invoke(updateSuggestion, {
    reviewer: { _id: "hod-id", department: "CSE-AI" },
    params: { id: suggestionId },
    body: { status: "ACCEPTED", response: "  We will add this next term.  " },
  });

  assert.equal(result.statusCode, 200);
  assert.deepEqual(filter, { _id: suggestionId, department: "CSE-AI" });
  assert.equal(existingSuggestion.status, "ACCEPTED");
  assert.equal(existingSuggestion.response, "We will add this next term.");
  assert.equal(existingSuggestion.reviewedBy, "hod-id");
  assert.ok(existingSuggestion.reviewedAt instanceof Date);
});

test("HOD cannot update suggestions outside the department or use invalid statuses", async () => {
  let findCalled = false;
  Suggestion.findOne = async () => {
    findCalled = true;
    return null;
  };

  const invalidStatus = await invoke(updateSuggestion, {
    reviewer: { _id: "hod-id", department: "CSE-AI" },
    params: { id: "65f0c0a12345678901234567" },
    body: { status: "RESOLVED", response: "" },
  });
  assert.equal(invalidStatus.statusCode, 400);
  assert.equal(findCalled, false);

  const outsideDepartment = await invoke(updateSuggestion, {
    reviewer: { _id: "hod-id", department: "CSE-AI" },
    params: { id: "65f0c0a12345678901234567" },
    body: { status: "DECLINED", response: "Not supported" },
  });
  assert.equal(outsideDepartment.statusCode, 404);
});
