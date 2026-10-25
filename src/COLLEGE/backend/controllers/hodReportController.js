const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const AttendanceSession = require("../models/AttendanceSession");

const getHODReportData = async (req, res) => {
  const department = req.reviewer.department;

  try {
    const [students, faculty, sessions] = await Promise.all([
      Student.find({ branch: department, isActive: true })
        .select("_id name rollNumber section entryType createdAt")
        .sort({ rollNumber: 1 })
        .lean(),
      Faculty.find({ department, isActive: true })
        .select("name facultyId subject department createdAt")
        .sort({ name: 1 })
        .lean(),
      AttendanceSession.find({ branch: department })
        .select("records")
        .lean(),
    ]);

    const activeStudentIds = new Set(students.map((student) => String(student._id)));
    const attendanceByStudent = new Map();
    let attendanceTotal = 0;
    let attendanceCount = 0;

    for (const session of sessions) {
      for (const record of session.records) {
        const studentId = String(record.student);
        if (!activeStudentIds.has(studentId)) continue;

        const counts = attendanceByStudent.get(studentId) || {
          present: 0,
          absent: 0,
          late: 0,
          total: 0,
        };
        counts.total += 1;
        counts[record.status.toLowerCase()] += 1;
        attendanceByStudent.set(studentId, counts);
        attendanceTotal += 1;
        if (record.status === "PRESENT" || record.status === "LATE") {
          attendanceCount += 1;
        }
      }
    }

    const studentRows = students.map((student) => {
      const counts = attendanceByStudent.get(String(student._id)) || {
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
      };
      return {
        name: student.name,
        rollNumber: student.rollNumber,
        section: student.section || "Unassigned",
        entryType: student.entryType,
        present: counts.present,
        absent: counts.absent,
        late: counts.late,
        total: counts.total,
        attendancePercentage: counts.total
          ? Math.round(((counts.present + counts.late) / counts.total) * 1000) / 10
          : null,
      };
    });

    return res.status(200).json({
      department,
      generatedAt: new Date().toISOString(),
      summary: {
        studentCount: students.length,
        facultyCount: faculty.length,
        attendanceRecords: attendanceTotal,
        attendancePercentage: attendanceTotal
          ? Math.round((attendanceCount / attendanceTotal) * 1000) / 10
          : null,
      },
      students: studentRows,
      faculty: faculty.map((member) => ({
        name: member.name,
        facultyId: member.facultyId,
        subject: member.subject,
        department: member.department,
      })),
    });
  } catch (error) {
    console.error("HOD report lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to load department report data." });
  }
};

module.exports = { getHODReportData };
