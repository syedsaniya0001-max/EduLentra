const { test } = require("node:test");
const assert = require("node:assert/strict");

const Student = require("../models/Student");
const StudentTask = require("../models/StudentTask");
const {
  getStudentTasks,
  createStudentTask,
  setStudentTaskCompletion,
  deleteStudentTask,
} = require("../controllers/studentTaskController");

const methods = [
  [Student, "findOne"],
  [StudentTask, "find"],
  [StudentTask, "create"],
  [StudentTask, "findOneAndUpdate"],
  [StudentTask, "findOneAndDelete"],
];

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

const studentId = "65f0c0a12345678901234567";
const otherStudentId = "65f0c0a12345678901234568";
const taskId = "65f0c0a12345678901234569";
const studentTask = {
  _id: taskId,
  title: "Complete project",
  category: "Assignment",
  date: "2026-11-15",
  time: "09:30",
  description: "Submit the final work.",
  completed: false,
  createdAt: new Date("2026-10-25T10:00:00.000Z"),
};

const activeStudentQuery = (id = studentId) => ({
  select: async () => ({ _id: id }),
});

test("student planner lists tasks only for the authenticated student", async () => {
  await withStubs([
    [Student, "findOne", (filter) => {
      assert.deepEqual(filter, { _id: studentId, isActive: true });
      return activeStudentQuery();
    }],
    [StudentTask, "find", (filter) => {
      assert.deepEqual(filter, { student: studentId });
      return {
        sort() { return this; },
        lean: async () => [studentTask],
      };
    }],
  ], async () => {
    const result = await invoke(getStudentTasks, {
      user: { userId: studentId },
    });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.tasks[0].id, taskId);
    assert.equal(result.body.tasks[0].completed, false);
  });
});

test("student creates a validated planner task owned by their account", async () => {
  let created;
  await withStubs([
    [Student, "findOne", () => activeStudentQuery()],
    [StudentTask, "create", async (values) => {
      created = values;
      return { ...values, _id: taskId, createdAt: studentTask.createdAt };
    }],
  ], async () => {
    const result = await invoke(createStudentTask, {
      user: { userId: studentId },
      body: {
        title: "  Complete project ",
        category: "Assignment",
        date: "2026-11-15",
        time: "09:30",
        description: " Submit the final work. ",
      },
    });
    assert.equal(result.statusCode, 201);
    assert.equal(created.student, studentId);
    assert.equal(created.title, "Complete project");
    assert.equal(created.description, "Submit the final work.");
    assert.equal(result.body.task.id, taskId);
  });
});

test("planner creation rejects invalid dates, categories, and times", async () => {
  const result = await invoke(createStudentTask, {
    user: { userId: studentId },
    body: {
      title: "Invalid task",
      category: "Unknown",
      date: "2026-02-30",
      time: "25:99",
    },
  });
  assert.equal(result.statusCode, 400);
});

test("completion updates are restricted to the owning student", async () => {
  await withStubs([
    [Student, "findOne", () => activeStudentQuery()],
    [StudentTask, "findOneAndUpdate", (filter, update, options) => {
      assert.deepEqual(filter, { _id: taskId, student: studentId });
      assert.deepEqual(update, { $set: { completed: true } });
      assert.equal(options.new, true);
      return { lean: async () => ({ ...studentTask, completed: true }) };
    }],
  ], async () => {
    const result = await invoke(setStudentTaskCompletion, {
      user: { userId: studentId },
      params: { taskId },
      body: { completed: true },
    });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.task.completed, true);
  });
});

test("a student cannot delete another student's task", async () => {
  await withStubs([
    [Student, "findOne", () => activeStudentQuery(studentId)],
    [StudentTask, "findOneAndDelete", async (filter) => {
      assert.deepEqual(filter, { _id: taskId, student: studentId });
      assert.notEqual(filter.student, otherStudentId);
      return null;
    }],
  ], async () => {
    const result = await invoke(deleteStudentTask, {
      user: { userId: studentId },
      params: { taskId },
    });
    assert.equal(result.statusCode, 404);
  });
});
