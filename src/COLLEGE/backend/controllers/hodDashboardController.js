const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Attendance = require("../models/Attendance");
const AttendanceSession = require("../models/AttendanceSession");
const FacultyRequest = require("../models/FacultyRequest");
const Complaint = require("../models/Complaint");
const Suggestion = require("../models/Suggestion");
const OutpassRequest = require("../models/OutpassRequest");

const recentRecords = (model, filter, fields) =>
  model.find(filter).select(fields).sort({ createdAt: -1 }).limit(5).lean();

const getHODDashboard = async (req, res) => {
  const department = req.reviewer.department;

  try {
    const students = await Student.find({ branch: department, isActive: true })
      .select("_id")
      .lean();
    const studentIds = students.map((student) => student._id);

    const [
      recentStudents,
      facultyCount,
      pendingFacultyRequests,
      pendingComplaints,
      pendingSuggestions,
      pendingOutpasses,
      sessionAttendanceSummary,
      attendanceSummary,
      facultyRequests,
      complaints,
      suggestions,
    ] = await Promise.all([
      recentRecords(
        Student,
        { branch: department, isActive: true },
        "name rollNumber createdAt"
      ),
      Faculty.countDocuments({ department, isActive: true }),
      FacultyRequest.countDocuments({ department, status: "PENDING" }),
      Complaint.countDocuments({
        department,
        status: { $in: ["PENDING", "UNDER_REVIEW"] },
      }),
      Suggestion.countDocuments({
        department,
        status: { $in: ["SUBMITTED", "UNDER_REVIEW"] },
      }),
      studentIds.length
        ? OutpassRequest.countDocuments({
            student: { $in: studentIds },
            status: "PENDING",
          })
        : 0,
      studentIds.length
        ? AttendanceSession.aggregate([
            { $match: { branch: department } },
            { $unwind: "$records" },
            { $group: { _id: "$records.status", count: { $sum: 1 } } },
          ])
        : [],
      studentIds.length
        ? Attendance.aggregate([
            { $match: { student: { $in: studentIds } } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ])
        : [],
      recentRecords(
        FacultyRequest,
        { department },
        "name facultyId status createdAt"
      ),
      recentRecords(
        Complaint,
        { department },
        "subject status createdAt student"
      ),
      recentRecords(
        Suggestion,
        { department },
        "message status createdAt student"
      ),
    ]);

    const attendanceCounts = (
      sessionAttendanceSummary.length ? sessionAttendanceSummary : attendanceSummary
    ).reduce(
      (counts, item) => {
        counts.total += item.count;
        if (item._id === "PRESENT" || item._id === "LATE") {
          counts.attended += item.count;
        }
        return counts;
      },
      { total: 0, attended: 0 }
    );

    const studentActivities = recentStudents.map((student) => ({
      id: `student-${student._id}`,
      title: "Student account active",
      description: `${student.name} (${student.rollNumber}) joined the department`,
      icon: "👨‍🎓",
      createdAt: student.createdAt,
    }));
    const activities = [
      ...studentActivities,
      ...facultyRequests.map((item) => ({
        id: `faculty-${item._id}`,
        title: "Faculty registration request",
        description: `${item.name} (${item.facultyId}) submitted a request`,
        icon: "👨‍🏫",
        createdAt: item.createdAt,
      })),
      ...complaints.map((item) => ({
        id: `complaint-${item._id}`,
        title: "Student complaint submitted",
        description: item.subject,
        icon: "💬",
        createdAt: item.createdAt,
      })),
      ...suggestions.map((item) => ({
        id: `suggestion-${item._id}`,
        title: "Student suggestion submitted",
        description: item.message,
        icon: "💡",
        createdAt: item.createdAt,
      })),
    ]
      .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
      .slice(0, 8);

    return res.status(200).json({
      department,
      statistics: {
        studentCount: students.length,
        facultyCount,
        attendancePercentage: attendanceCounts.total
          ? Math.round((attendanceCounts.attended / attendanceCounts.total) * 1000) / 10
          : null,
        pendingRequests:
          pendingFacultyRequests +
          pendingComplaints +
          pendingSuggestions +
          pendingOutpasses,
      },
      recentActivities: activities,
    });
  } catch (error) {
    console.error("HOD dashboard lookup failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to load department dashboard data.",
    });
  }
};

module.exports = { getHODDashboard };
