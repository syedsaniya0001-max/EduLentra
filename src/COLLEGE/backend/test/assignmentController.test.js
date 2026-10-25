const { test } = require("node:test");
const assert = require("node:assert/strict");

const Assignment = require("../models/Assignment");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const {
  getFacultyAssignments,
  createAssignment,
  gradeAssignmentSubmission,
  getStudentAssignments,
  submitAssignment,
} = require("../controllers/assignmentController");

const methods = [
  [Assignment, "find"],
  [Assignment, "findOne"],
  [Assignment, "countDocuments"],
  [Assignment, "create"],
  [Faculty, "findOne"],
  [Student, "find"],
  [Student, "findOne"],
  [Student, "countDocuments"],
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

const facultyId = "65f0c0a12345678901234567";
const studentId = "65f0c0a12345678901234568";
const assignmentId = "65f0c0a12345678901234569";
const submissionId = "65f0c0a12345678901234570";
const faculty = {
  _id: facultyId,
  name: "Faculty One",
  department: "CSE-AI",
  branch: "CSE-AI",
  subject: "Machine Learning",
};
const student = {
  _id: studentId,
  name: "Maya Student",
  rollNumber: "ST-2026",
  branch: "CSE-AI",
  section: "A",
};

test("faculty assignment list uses real branch sections and owns listed assignments", async () => {
  await withStubs([
    [Faculty, "findOne", (filter) => {
      assert.deepEqual(filter, { _id: facultyId, isActive: true });
      return { select: async () => faculty };
    }],
    [Assignment, "find", (filter) => {
      assert.deepEqual(filter, { faculty: facultyId });
      return {
        sort() { return this; },
        lean: async () => [{
          _id: assignmentId,
          faculty: facultyId,
          branch: "CSE-AI",
          section: "A",
          subject: "Machine Learning",
          title: "Trees",
          dueDate: new Date("2026-12-01T23:59:59.999Z"),
          maxMarks: 25,
          submissions: [],
        }],
      };
    }],
    [Student, "find", () => query([student])],
  ], async () => {
    const result = await invoke(getFacultyAssignments, {
      user: { userId: facultyId },
    });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.subject, "Machine Learning");
    assert.deepEqual(result.body.sections, ["A"]);
    assert.equal(result.body.assignments[0].totalCount, 1);
  });
});

test("faculty creates an assignment using their server-owned subject and active student branch", async () => {
  let created;
  await withStubs([
    [Faculty, "findOne", () => ({ select: async () => faculty })],
    [Student, "countDocuments", async (filter) => {
      assert.deepEqual(filter, { branch: "CSE-AI", isActive: true, section: "A" });
      return 1;
    }],
    [Student, "find", () => query([student])],
    [Assignment, "create", async (values) => {
      created = values;
      return { ...values, _id: assignmentId, submissions: [] };
    }],
  ], async () => {
    const result = await invoke(createAssignment, {
      user: { userId: facultyId },
      body: {
        title: "Trees",
        description: "Implement traversals",
        section: "A",
        dueDate: "2026-12-01",
        maxMarks: 25,
        subject: "untrusted",
        branch: "other",
      },
    });
    assert.equal(result.statusCode, 201);
    assert.equal(created.branch, "CSE-AI");
    assert.equal(created.subject, "Machine Learning");
    assert.equal(created.section, "A");
  });
});

test("students see only assignments matching their branch and section", async () => {
  await withStubs([
    [Student, "findOne", () => ({ select: async () => student })],
    [Assignment, "find", (filter) => {
      assert.deepEqual(filter, {
        branch: "CSE-AI",
        section: { $in: ["A", "*"] },
      });
      return {
        sort() { return this; },
        lean: async () => [{
          _id: assignmentId,
          branch: "CSE-AI",
          section: "A",
          subject: "Machine Learning",
          title: "Trees",
          description: "",
          dueDate: new Date("2026-12-01T23:59:59.999Z"),
          maxMarks: 25,
          submissions: [{
            student: studentId,
            answer: "My answer",
            submittedAt: new Date("2026-10-25T10:00:00Z"),
            isLate: false,
            marks: null,
            feedback: "",
            gradedAt: null,
          }],
        }],
      };
    }],
  ], async () => {
    const result = await invoke(getStudentAssignments, {
      user: { userId: studentId },
    });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.assignments.length, 1);
    assert.equal(result.body.assignments[0].submission.answer, "My answer");
  });
});

test("student cannot submit to an assignment outside their section", async () => {
  await withStubs([
    [Student, "findOne", () => ({ select: async () => student })],
    [Assignment, "findOne", async () => null],
  ], async () => {
    const result = await invoke(submitAssignment, {
      user: { userId: studentId },
      params: { assignmentId },
      body: { answer: "Attempted answer" },
    });
    assert.equal(result.statusCode, 404);
  });
});

test("student submission is stored and marked late when submitted after the deadline", async () => {
  let saved = false;
  const assignment = new Assignment({
    _id: assignmentId,
    faculty: facultyId,
    branch: "CSE-AI",
    section: "A",
    subject: "Machine Learning",
    title: "Trees",
    dueDate: new Date("2020-01-01T23:59:59.999Z"),
    maxMarks: 25,
    submissions: [],
  });
  assignment.save = async () => {
    saved = true;
  };

  await withStubs([
    [Student, "findOne", () => ({ select: async () => student })],
    [Assignment, "findOne", async (filter) => {
      assert.equal(filter._id, assignmentId);
      assert.equal(filter.branch, "CSE-AI");
      assert.deepEqual(filter.section, { $in: ["A", "*"] });
      return assignment;
    }],
  ], async () => {
    const result = await invoke(submitAssignment, {
      user: { userId: studentId },
      params: { assignmentId },
      body: {
        answer: "My complete response",
        fileUrl: "https://files.example.edu/assignment.pdf",
      },
    });
    assert.equal(result.statusCode, 200);
    assert.equal(saved, true);
    assert.equal(result.body.submission.isLate, true);
    assert.equal(assignment.submissions[0].answer, "My complete response");
    assert.equal(
      assignment.submissions[0].fileUrl,
      "https://files.example.edu/assignment.pdf"
    );
    assert.equal(
      result.body.submission.fileUrl,
      "https://files.example.edu/assignment.pdf"
    );
  });
});

test("student assignment submission rejects unsafe attachment URLs", async () => {
  const result = await invoke(submitAssignment, {
    user: { userId: studentId },
    params: { assignmentId },
    body: {
      answer: "My complete response",
      fileUrl: "javascript:alert(1)",
    },
  });

  assert.equal(result.statusCode, 400);
  assert.match(result.body.message, /HTTP\/HTTPS attachment link/);
});

test("assignment marks cannot exceed maximum marks", async () => {
  const existingSubmission = {
    _id: submissionId,
    marks: null,
    feedback: "",
    gradedAt: null,
  };
  const assignment = {
    maxMarks: 25,
    submissions: {
      id: () => existingSubmission,
    },
    save: async () => {},
  };
  await withStubs([
    [Faculty, "findOne", () => ({ select: async () => faculty })],
    [Assignment, "findOne", async () => assignment],
  ], async () => {
    const result = await invoke(gradeAssignmentSubmission, {
      user: { userId: facultyId },
      params: { assignmentId, submissionId },
      body: { marks: 30, feedback: "" },
    });
    assert.equal(result.statusCode, 400);
    assert.equal(existingSubmission.gradedAt, null);
  });
});
