const { test } = require("node:test");
const assert = require("node:assert/strict");

const Assignment = require("../models/Assignment");
const AttendanceSession = require("../models/AttendanceSession");
const Faculty = require("../models/Faculty");
const FacultyTimetable = require("../models/FacultyTimetable");
const OutpassRequest = require("../models/OutpassRequest");
const Student = require("../models/Student");
const StudyMaterial = require("../models/StudyMaterial");
const { getFacultyDashboard } = require("../controllers/facultyDashboardController");

const methods = [
  [Assignment, "countDocuments"],
  [AttendanceSession, "aggregate"],
  [Faculty, "findOne"],
  [FacultyTimetable, "find"],
  [OutpassRequest, "countDocuments"],
  [Student, "countDocuments"],
  [StudyMaterial, "countDocuments"],
];

const invoke = async () => {
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
  await getFacultyDashboard({ user: { userId: "faculty-1" } }, response);
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

test("faculty dashboard calculates statistics from the signed-in faculty's records", async () => {
  const faculty = {
    _id: "faculty-1",
    branch: "CSE-AI",
    department: "CSE",
  };
  await withStubs([
    [Faculty, "findOne", (filter) => {
      assert.deepEqual(filter, { _id: "faculty-1", isActive: true });
      return { select: async () => faculty };
    }],
    [Student, "countDocuments", async (filter) => {
      assert.deepEqual(filter, { branch: "CSE-AI", isActive: true });
      return 25;
    }],
    [OutpassRequest, "countDocuments", async (filter) => {
      assert.deepEqual(filter, { status: "PENDING" });
      return 3;
    }],
    [Assignment, "countDocuments", async (filter) => {
      assert.equal(filter.faculty, faculty._id);
      assert.ok(filter.dueDate.$gte instanceof Date);
      return 4;
    }],
    [StudyMaterial, "countDocuments", async (filter) => {
      assert.deepEqual(filter, { faculty: faculty._id });
      return 6;
    }],
    [AttendanceSession, "aggregate", async (pipeline) => {
      assert.deepEqual(pipeline[0], { $match: { faculty: faculty._id } });
      return [
        { _id: "PRESENT", count: 18 },
        { _id: "LATE", count: 2 },
        { _id: "ABSENT", count: 5 },
      ];
    }],
    [FacultyTimetable, "find", (filter) => {
      assert.deepEqual(filter, { faculty: faculty._id });
      return {
        sort() { return this; },
        lean: async () => [],
      };
    }],
  ], async () => {
    const result = await invoke();
    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body.stats, {
      totalStudents: 25,
      pendingOutpasses: 3,
      activeAssignments: 4,
      totalNotes: 6,
      avgAttendance: 80,
      attendanceRecords: 25,
    });
    assert.deepEqual(result.body.timetable, []);
    assert.equal(result.body.timetableConfigured, false);
    assert.deepEqual(result.body.recentActivities, []);
  });
});

test("faculty dashboard reports no attendance percentage when no attendance exists", async () => {
  await withStubs([
    [Faculty, "findOne", () => ({ select: async () => ({ _id: "faculty-1", department: "CSE" }) })],
    [Student, "countDocuments", async () => 0],
    [OutpassRequest, "countDocuments", async () => 0],
    [Assignment, "countDocuments", async () => 0],
    [StudyMaterial, "countDocuments", async () => 0],
    [AttendanceSession, "aggregate", async () => []],
    [FacultyTimetable, "find", () => ({
      sort() { return this; },
      lean: async () => [],
    })],
  ], async () => {
    const result = await invoke();
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.stats.avgAttendance, null);
    assert.equal(result.body.stats.attendanceRecords, 0);
  });
});

test("faculty dashboard refuses inactive or missing accounts", async () => {
  await withStubs([
    [Faculty, "findOne", () => ({ select: async () => null })],
  ], async () => {
    const result = await invoke();
    assert.equal(result.statusCode, 403);
  });
});
