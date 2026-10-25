const { test } = require("node:test");
const assert = require("node:assert/strict");

const AttendanceSession = require("../models/AttendanceSession");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const {
  getFacultyAttendance,
  saveFacultyAttendance,
  getStudentAttendance,
  getHODAttendance,
} = require("../controllers/attendanceController");

const methods = [
  [AttendanceSession, "findOne"],
  [AttendanceSession, "findOneAndUpdate"],
  [AttendanceSession, "find"],
  [Faculty, "findOne"],
  [Student, "find"],
  [Student, "findOne"],
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

const faculty = {
  _id: "65f0c0a12345678901234567",
  branch: "CSE-AI",
  department: "CSE-AI",
  subject: "Machine Learning",
};
const student1 = {
  _id: "65f0c0a12345678901234568",
  name: "A Student",
  rollNumber: "ST-1",
  branch: "CSE-AI",
  section: "A",
};
const student2 = {
  _id: "65f0c0a12345678901234569",
  name: "B Student",
  rollNumber: "ST-2",
  branch: "CSE-AI",
  section: "A",
};

test("faculty attendance roster is limited to the faculty branch and restores saved statuses", async () => {
  await withStubs([
    [Faculty, "findOne", (filter) => {
      assert.deepEqual(filter, { _id: faculty._id, isActive: true });
      return { select: async () => faculty };
    }],
    [Student, "find", (filter) => {
      assert.deepEqual(filter, { branch: "CSE-AI", isActive: true });
      return query([student1, student2]);
    }],
    [AttendanceSession, "findOne", (filter) => {
      assert.equal(filter.subject, "Machine Learning");
      assert.equal(filter.section, "A");
      return { lean: async () => ({
        records: [{ student: student1._id, status: "PRESENT" }],
      }) };
    }],
  ], async () => {
    const result = await invoke(getFacultyAttendance, {
      user: { userId: faculty._id },
      query: { date: "2026-10-25", section: "A", period: "Period 1" },
    });
    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body.sections, ["A"]);
    assert.equal(result.body.students.length, 2);
    assert.equal(result.body.students[0].attendanceStatus, "PRESENT");
    assert.equal(result.body.students[1].attendanceStatus, null);
  });
});

test("faculty can save only a complete roster with valid statuses and server-owned subject", async () => {
  let savedFilter;
  let savedUpdate;
  await withStubs([
    [Faculty, "findOne", () => ({ select: async () => faculty })],
    [Student, "find", (filter) => {
      assert.deepEqual(filter, { branch: "CSE-AI", isActive: true, section: "A" });
      return query([{ _id: student1._id }, { _id: student2._id }]);
    }],
    [AttendanceSession, "findOneAndUpdate", async (filter, update) => {
      savedFilter = filter;
      savedUpdate = update;
      return { _id: "session-1" };
    }],
  ], async () => {
    const result = await invoke(saveFacultyAttendance, {
      user: { userId: faculty._id },
      body: {
        date: "2026-10-25",
        section: "A",
        period: "Period 1",
        subject: "Untrusted subject",
        records: [
          { studentId: student1._id, status: "present" },
          { studentId: student2._id, status: "LATE" },
        ],
      },
    });
    assert.equal(result.statusCode, 200);
    assert.equal(savedFilter.subject, "Machine Learning");
    assert.equal(savedUpdate.$set.records[0].status, "PRESENT");
    assert.equal(savedUpdate.$set.records[1].status, "LATE");
  });
});

test("faculty attendance refuses to save a partial roster", async () => {
  await withStubs([
    [Faculty, "findOne", () => ({ select: async () => faculty })],
    [Student, "find", () => query([{ _id: student1._id }, { _id: student2._id }])],
  ], async () => {
    const result = await invoke(saveFacultyAttendance, {
      user: { userId: faculty._id },
      body: {
        date: "2026-10-25",
        section: "A",
        period: "Period 1",
        records: [{ studentId: student1._id, status: "PRESENT" }],
      },
    });
    assert.equal(result.statusCode, 400);
  });
});

test("student attendance returns only the signed-in student's records and real summary", async () => {
  const sessions = [
    {
      date: new Date("2026-10-25T00:00:00.000Z"),
      subject: "Machine Learning",
      section: "A",
      period: "Period 1",
      records: [
        { student: student1._id, status: "PRESENT" },
        { student: student2._id, status: "ABSENT" },
      ],
    },
    {
      date: new Date("2026-10-24T00:00:00.000Z"),
      subject: "Machine Learning",
      section: "A",
      period: "Period 2",
      records: [{ student: student1._id, status: "LATE" }],
    },
  ];
  await withStubs([
    [Student, "findOne", () => ({ select: async () => ({ _id: student1._id }) })],
    [AttendanceSession, "find", (filter) => {
      assert.deepEqual(filter, { "records.student": student1._id });
      return {
        select() { return this; },
        sort() { return this; },
        lean: async () => sessions,
      };
    }],
  ], async () => {
    const result = await invoke(getStudentAttendance, {
      user: { userId: student1._id },
    });
    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body.summary, {
      present: 1,
      absent: 0,
      late: 1,
      total: 2,
      percentage: 100,
    });
    assert.equal(result.body.records.length, 2);
    assert.equal(result.body.subjects[0].total, 2);
  });
});

test("HOD attendance aggregates only the reviewer's active department students", async () => {
  await withStubs([
    [Student, "find", (filter) => {
      assert.deepEqual(filter, { branch: "CSE-AI", isActive: true });
      return query([student1]);
    }],
    [AttendanceSession, "find", (filter) => {
      assert.deepEqual(filter, { branch: "CSE-AI" });
      return query([{
        records: [
          { student: student1._id, status: "PRESENT" },
          { student: "65f0c0a12345678901234570", status: "ABSENT" },
        ],
      }]);
    }],
  ], async () => {
    const result = await invoke(getHODAttendance, {
      reviewer: { department: "CSE-AI" },
    });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.students.length, 1);
    assert.equal(result.body.students[0].percentage, 100);
    assert.equal(result.body.summary.studentCount, 1);
    assert.equal(result.body.summary.totalRecords, 1);
  });
});
