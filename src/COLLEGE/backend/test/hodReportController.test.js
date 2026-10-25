const { test } = require("node:test");
const assert = require("node:assert/strict");

const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const AttendanceSession = require("../models/AttendanceSession");
const { getHODReportData } = require("../controllers/hodReportController");

const models = [
  [Student, "find"],
  [Faculty, "find"],
  [AttendanceSession, "find"],
];

const query = (value) => ({
  select() { return this; },
  sort() { return this; },
  lean: async () => value,
});

const invoke = async (department) => {
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
  await getHODReportData({ reviewer: { department } }, response);
  return { statusCode, body };
};

test("HOD report data is department-scoped and calculated from recorded attendance", async () => {
  const saved = models.map(([model, method]) => [model, method, model[method]]);
  Student.find = (filter) => {
    assert.deepEqual(filter, { branch: "CSE-AI", isActive: true });
    return query([
      {
        _id: "student-1",
        name: "Maya Student",
        rollNumber: "ST-101",
        section: "A",
        entryType: "Regular",
      },
      {
        _id: "student-2",
        name: "Noah Student",
        rollNumber: "ST-102",
        section: "B",
        entryType: "Regular",
      },
    ]);
  };
  Faculty.find = (filter) => {
    assert.deepEqual(filter, { department: "CSE-AI", isActive: true });
    return query([{
      name: "Faculty One",
      facultyId: "FAC-1",
      subject: "Machine Learning",
      department: "CSE-AI",
    }]);
  };
  AttendanceSession.find = (filter) => {
    assert.deepEqual(filter, { branch: "CSE-AI" });
    return query([{
      records: [
        { student: "student-1", status: "PRESENT" },
        { student: "student-1", status: "LATE" },
        { student: "student-1", status: "ABSENT" },
        { student: "inactive-student", status: "PRESENT" },
      ],
    }]);
  };

  try {
    const result = await invoke("CSE-AI");
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.department, "CSE-AI");
    assert.deepEqual(result.body.summary, {
      studentCount: 2,
      facultyCount: 1,
      attendanceRecords: 3,
      attendancePercentage: 66.7,
    });
    assert.equal(result.body.students[0].attendancePercentage, 66.7);
    assert.equal(result.body.students[1].attendancePercentage, null);
    assert.equal(result.body.students[1].total, 0);
    assert.equal(result.body.faculty[0].facultyId, "FAC-1");
    assert.equal(typeof result.body.generatedAt, "string");
  } finally {
    for (const [model, method, implementation] of saved) {
      model[method] = implementation;
    }
  }
});

test("HOD report reports no attendance percentage when there are no recorded sessions", async () => {
  const saved = models.map(([model, method]) => [model, method, model[method]]);
  Student.find = () => query([]);
  Faculty.find = () => query([]);
  AttendanceSession.find = () => query([]);

  try {
    const result = await invoke("ECE");
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.summary.attendancePercentage, null);
    assert.equal(result.body.summary.attendanceRecords, 0);
    assert.deepEqual(result.body.students, []);
  } finally {
    for (const [model, method, implementation] of saved) {
      model[method] = implementation;
    }
  }
});
