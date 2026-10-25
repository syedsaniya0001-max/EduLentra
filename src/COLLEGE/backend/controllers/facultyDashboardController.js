const Assignment = require("../models/Assignment");
const AttendanceSession = require("../models/AttendanceSession");
const Faculty = require("../models/Faculty");
const FacultyTimetable = require("../models/FacultyTimetable");
const OutpassRequest = require("../models/OutpassRequest");
const Student = require("../models/Student");
const StudyMaterial = require("../models/StudyMaterial");

const getFacultyDashboard = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({
      _id: req.user.userId,
      isActive: true,
    }).select("_id branch department");

    if (!faculty) {
      return res.status(403).json({
        message: "An active faculty account is required.",
      });
    }

    const branch = faculty.branch || faculty.department;
    const activeAssignmentsFilter = {
      faculty: faculty._id,
      dueDate: { $gte: new Date() },
    };
    const [
      totalStudents,
      pendingOutpasses,
      activeAssignments,
      totalNotes,
      attendanceCounts,
      timetable,
    ] = await Promise.all([
      Student.countDocuments({ branch, isActive: true }),
      OutpassRequest.countDocuments({ status: "PENDING" }),
      Assignment.countDocuments(activeAssignmentsFilter),
      StudyMaterial.countDocuments({ faculty: faculty._id }),
      AttendanceSession.aggregate([
        { $match: { faculty: faculty._id } },
        { $unwind: "$records" },
        { $group: { _id: "$records.status", count: { $sum: 1 } } },
      ]),
      FacultyTimetable.find({ faculty: faculty._id })
        .sort({ day: 1, startTime: 1 })
        .lean(),
    ]);

    const attendance = attendanceCounts.reduce(
      (totals, item) => {
        totals.total += item.count;
        if (item._id === "PRESENT" || item._id === "LATE") {
          totals.attended += item.count;
        }
        return totals;
      },
      { total: 0, attended: 0 }
    );

    return res.status(200).json({
      stats: {
        totalStudents,
        pendingOutpasses,
        activeAssignments,
        totalNotes,
        avgAttendance: attendance.total
          ? Math.round((attendance.attended / attendance.total) * 1000) / 10
          : null,
        attendanceRecords: attendance.total,
      },
      timetable,
      timetableConfigured: timetable.length > 0,
      recentActivities: [],
    });
  } catch (error) {
    console.error("Faculty dashboard lookup failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to load faculty dashboard data.",
    });
  }
};

module.exports = { getFacultyDashboard };
