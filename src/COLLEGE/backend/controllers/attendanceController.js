const mongoose = require("mongoose");
const AttendanceSession = require("../models/AttendanceSession");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");

const ALL_SECTIONS = "All";
const UNASSIGNED_SECTION = "__unassigned__";

const parseDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === value ? date : null;
};

const getActiveFaculty = async (userId) =>
  Faculty.findOne({ _id: userId, isActive: true }).select(
    "_id department branch subject"
  );

const sectionQuery = (section) => {
  if (section === ALL_SECTIONS) return {};
  if (section === UNASSIGNED_SECTION) {
    return { $or: [{ section: "" }, { section: { $exists: false } }] };
  }
  return { section };
};

const getFacultyAttendance = async (req, res) => {
  const date = parseDate(req.query.date);
  const period = typeof req.query.period === "string" ? req.query.period.trim() : "";
  const section =
    typeof req.query.section === "string" && req.query.section.trim()
      ? req.query.section.trim()
      : ALL_SECTIONS;

  if (!date || !period || period.length > 100 || section.length > 100) {
    return res.status(400).json({
      message: "Select a valid attendance date, section, and period.",
    });
  }

  try {
    const faculty = await getActiveFaculty(req.user.userId);
    if (!faculty) {
      return res.status(403).json({ message: "An active faculty account is required." });
    }

    const branch = faculty.branch || faculty.department;
    if (!branch?.trim() || !faculty.subject?.trim()) {
      return res.status(409).json({
        message: "Your faculty account needs a branch and subject before attendance can be marked.",
      });
    }

    const branchStudents = await Student.find({ branch, isActive: true })
      .select("_id name rollNumber branch section")
      .sort({ rollNumber: 1 })
      .lean();
    const students = branchStudents.filter((student) => {
      if (section === ALL_SECTIONS) return true;
      if (section === UNASSIGNED_SECTION) return !student.section?.trim();
      return student.section?.trim() === section;
    });

    const session = await AttendanceSession.findOne({
      faculty: faculty._id,
      date,
      subject: faculty.subject,
      section,
      period,
    }).lean();

    return res.status(200).json({
      branch,
      subject: faculty.subject,
      sections: [
        ...new Set(
          students.map((student) =>
            student.section?.trim() ? student.section.trim() : UNASSIGNED_SECTION
          )
        ),
      ],
      students: students.map((student) => ({
        ...student,
        attendanceStatus:
          session?.records.find(
            (record) => String(record.student) === String(student._id)
          )?.status || null,
      })),
      session,
    });
  } catch (error) {
    console.error("Faculty attendance lookup failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to load the attendance roster.",
    });
  }
};

const saveFacultyAttendance = async (req, res) => {
  const { date: rawDate, section: rawSection, period: rawPeriod, records } =
    req.body || {};
  const date = parseDate(rawDate);
  const section =
    typeof rawSection === "string" ? rawSection.trim() : "";
  const period = typeof rawPeriod === "string" ? rawPeriod.trim() : "";

  if (
    !date ||
    !section ||
    section.length > 100 ||
    !period ||
    period.length > 100 ||
    !Array.isArray(records) ||
    records.length === 0 ||
    records.length > 500
  ) {
    return res.status(400).json({
      message: "Provide a valid date, section, period, and complete student attendance list.",
    });
  }

  try {
    const faculty = await getActiveFaculty(req.user.userId);
    if (!faculty) {
      return res.status(403).json({ message: "An active faculty account is required." });
    }

    const branch = faculty.branch || faculty.department;
    if (!branch?.trim() || !faculty.subject?.trim()) {
      return res.status(409).json({
        message: "Your faculty account needs a branch and subject before attendance can be marked.",
      });
    }

    const students = await Student.find({
      branch,
      isActive: true,
      ...sectionQuery(section),
    })
      .select("_id")
      .lean();
    const allowedIds = new Set(students.map((student) => String(student._id)));
    const submittedIds = new Set();
    const normalizedRecords = [];

    for (const record of records) {
      const studentId = typeof record?.studentId === "string" ? record.studentId : "";
      const status = typeof record?.status === "string" ? record.status.toUpperCase() : "";
      if (
        !mongoose.isValidObjectId(studentId) ||
        !allowedIds.has(studentId) ||
        submittedIds.has(studentId) ||
        !["PRESENT", "ABSENT", "LATE"].includes(status)
      ) {
        return res.status(400).json({
          message: "Attendance contains an invalid student or status.",
        });
      }
      submittedIds.add(studentId);
      normalizedRecords.push({ student: studentId, status });
    }

    if (submittedIds.size !== allowedIds.size) {
      return res.status(400).json({
        message: "Mark attendance for every active student in the selected section.",
      });
    }

    const session = await AttendanceSession.findOneAndUpdate(
      {
        faculty: faculty._id,
        date,
        subject: faculty.subject,
        section,
        period,
      },
      {
        $set: {
          branch,
          records: normalizedRecords,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      message: "Attendance saved successfully.",
      session,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This attendance session was saved at the same time. Reload and try again.",
      });
    }
    console.error("Faculty attendance save failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to save attendance.",
    });
  }
};

const getStudentAttendance = async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.user.userId,
      isActive: true,
    }).select("_id");

    if (!student) {
      return res.status(403).json({ message: "An active student account is required." });
    }

    const sessions = await AttendanceSession.find({
      "records.student": student._id,
    })
      .select("date subject section period records")
      .sort({ date: -1, period: 1 })
      .lean();
    const records = sessions.flatMap((session) =>
      session.records
        .filter((record) => String(record.student) === String(student._id))
        .map((record) => ({
          date: session.date,
          subject: session.subject,
          section: session.section,
          period: session.period,
          status: record.status,
        }))
    );
    const summary = records.reduce(
      (result, record) => {
        result.total += 1;
        result[record.status.toLowerCase()] += 1;
        return result;
      },
      { present: 0, absent: 0, late: 0, total: 0 }
    );
    const bySubject = new Map();
    for (const record of records) {
      const subject = bySubject.get(record.subject) || {
        subject: record.subject,
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
      };
      subject.total += 1;
      subject[record.status.toLowerCase()] += 1;
      bySubject.set(record.subject, subject);
    }

    return res.status(200).json({
      summary: {
        ...summary,
        percentage: summary.total
          ? Math.round(((summary.present + summary.late) / summary.total) * 1000) / 10
          : null,
      },
      subjects: [...bySubject.values()].map((subject) => ({
        ...subject,
        percentage: Math.round(
          ((subject.present + subject.late) / subject.total) * 1000
        ) / 10,
      })),
      records,
    });
  } catch (error) {
    console.error("Student attendance lookup failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to load your attendance records.",
    });
  }
};

const getHODAttendance = async (req, res) => {
  try {
    const students = await Student.find({
      branch: req.reviewer.department,
      isActive: true,
    })
      .select("_id name rollNumber branch section")
      .sort({ rollNumber: 1 })
      .lean();
    const studentById = new Map(
      students.map((student) => [String(student._id), student])
    );
    const sessions = students.length
      ? await AttendanceSession.find({ branch: req.reviewer.department })
          .select("records")
          .lean()
      : [];
    const totalsByStudent = new Map();

    for (const session of sessions) {
      for (const record of session.records) {
        const studentId = String(record.student);
        if (!studentById.has(studentId)) continue;
        const counts = totalsByStudent.get(studentId) || {
          present: 0,
          absent: 0,
          late: 0,
          total: 0,
        };
        counts.total += 1;
        counts[record.status.toLowerCase()] += 1;
        totalsByStudent.set(studentId, counts);
      }
    }

    const rows = students.map((student) => {
      const counts = totalsByStudent.get(String(student._id)) || {
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
      };
      const percentage = counts.total
        ? Math.round(((counts.present + counts.late) / counts.total) * 1000) / 10
        : null;
      return {
        ...student,
        ...counts,
        percentage,
        status:
          percentage === null
            ? "No data"
            : percentage < 65
              ? "Critical"
              : percentage < 75
                ? "Low"
                : percentage < 85
                  ? "Average"
                  : "Good",
      };
    });
    const total = rows.reduce((sum, student) => sum + student.total, 0);
    const attended = rows.reduce(
      (sum, student) => sum + student.present + student.late,
      0
    );

    return res.status(200).json({
      department: req.reviewer.department,
      summary: {
        studentCount: rows.length,
        totalRecords: total,
        percentage: total ? Math.round((attended / total) * 1000) / 10 : null,
        goodCount: rows.filter((student) => student.percentage >= 75).length,
        lowCount: rows.filter(
          (student) => student.percentage !== null && student.percentage < 75
        ).length,
        criticalCount: rows.filter(
          (student) => student.percentage !== null && student.percentage < 65
        ).length,
      },
      students: rows,
    });
  } catch (error) {
    console.error("HOD attendance lookup failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to load department attendance.",
    });
  }
};

module.exports = {
  getFacultyAttendance,
  saveFacultyAttendance,
  getStudentAttendance,
  getHODAttendance,
};
