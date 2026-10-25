const { test } = require("node:test");
const assert = require("node:assert/strict");

const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Attendance = require("../models/Attendance");
const AttendanceSession = require("../models/AttendanceSession");
const FacultyRequest = require("../models/FacultyRequest");
const Complaint = require("../models/Complaint");
const Suggestion = require("../models/Suggestion");
const OutpassRequest = require("../models/OutpassRequest");
const { getHODDashboard } = require("../controllers/hodDashboardController");

const originalMethods = [
  [Student, "find"],
  [Faculty, "countDocuments"],
  [Attendance, "aggregate"],
  [AttendanceSession, "aggregate"],
  [FacultyRequest, "countDocuments"],
  [FacultyRequest, "find"],
  [Complaint, "countDocuments"],
  [Complaint, "find"],
  [Suggestion, "countDocuments"],
  [Suggestion, "find"],
  [OutpassRequest, "countDocuments"],
];

const queryWith = (value) => ({
  select() { return this; },
  sort() { return this; },
  limit() { return this; },
  lean: async () => value,
});

const invoke = async (reviewer) => {
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

  await getHODDashboard({ reviewer }, response);
  return { statusCode, body };
};

test("HOD dashboard returns department-scoped live statistics and recent activity", async () => {
  const saved = originalMethods.map(([model, method]) => [model, method, model[method]]);
  const studentRows = [
    { _id: "student-1", name: "A Student", rollNumber: "ST-1", createdAt: new Date("2026-10-25T10:00:00Z") },
    { _id: "student-2", name: "B Student", rollNumber: "ST-2", createdAt: new Date("2026-10-24T10:00:00Z") },
  ];
  Student.find = () => queryWith(studentRows);
  Faculty.countDocuments = async (filter) => {
    assert.deepEqual(filter, { department: "CSE-AI", isActive: true });
    return 4;
  };
  FacultyRequest.countDocuments = async () => 2;
  Complaint.countDocuments = async () => 1;
  Suggestion.countDocuments = async () => 3;
  OutpassRequest.countDocuments = async (filter) => {
    assert.deepEqual(filter, {
      student: { $in: ["student-1", "student-2"] },
      status: "PENDING",
    });
    return 1;
  };
  Attendance.aggregate = async () => [
    { _id: "PRESENT", count: 9 },
    { _id: "LATE", count: 1 },
    { _id: "ABSENT", count: 1 },
  ];
  AttendanceSession.aggregate = async () => [
    { _id: "PRESENT", count: 9 },
    { _id: "LATE", count: 1 },
    { _id: "ABSENT", count: 1 },
  ];
  FacultyRequest.find = () => queryWith([
    { _id: "faculty-request", name: "A Faculty", facultyId: "F-1", createdAt: new Date("2026-10-25T11:00:00Z") },
  ]);
  Complaint.find = () => queryWith([
    { _id: "complaint", subject: "Lab equipment", createdAt: new Date("2026-10-25T12:00:00Z") },
  ]);
  Suggestion.find = () => queryWith([
    { _id: "suggestion", message: "More study spaces", createdAt: new Date("2026-10-25T13:00:00Z") },
  ]);

  try {
    const result = await invoke({ department: "CSE-AI" });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.department, "CSE-AI");
    assert.deepEqual(result.body.statistics, {
      studentCount: 2,
      facultyCount: 4,
      attendancePercentage: 90.9,
      pendingRequests: 7,
    });
    assert.equal(result.body.recentActivities.length, 5);
    assert.equal(result.body.recentActivities[0].title, "Student suggestion submitted");
  } finally {
    for (const [model, method, original] of saved) {
      model[method] = original;
    }
  }
});

test("HOD dashboard reports missing attendance data instead of inventing a percentage", async () => {
  const saved = originalMethods.map(([model, method]) => [model, method, model[method]]);
  Student.find = () => queryWith([]);
  Faculty.countDocuments = async () => 0;
  FacultyRequest.countDocuments = async () => 0;
  Complaint.countDocuments = async () => 0;
  Suggestion.countDocuments = async () => 0;
  OutpassRequest.countDocuments = async () => 0;
  Attendance.aggregate = async () => [];
  AttendanceSession.aggregate = async () => [];
  FacultyRequest.find = () => queryWith([]);
  Complaint.find = () => queryWith([]);
  Suggestion.find = () => queryWith([]);

  try {
    const result = await invoke({ department: "CSE-AI" });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.statistics.attendancePercentage, null);
    assert.equal(result.body.statistics.pendingRequests, 0);
    assert.deepEqual(result.body.recentActivities, []);
  } finally {
    for (const [model, method, original] of saved) {
      model[method] = original;
    }
  }
});
