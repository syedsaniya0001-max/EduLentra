import React, { useEffect, useState } from "react";
import { facultyApi } from "../../../api/facultyApi";

export default function AttendanceManagement() {
  const todayStr = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(todayStr);
  const [selectedClass, setSelectedClass] = useState("CSE - 3rd Year (Section A)");
  const [selectedSubject, setSelectedSubject] = useState("Data Structures & Algorithms");
  const [selectedPeriod, setSelectedPeriod] = useState("Period 1 (09:00 AM - 10:00 AM)");

  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [historyRecords, setHistoryRecords] = useState([]);
  const [saveStatus, setSaveStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClassRosterAndHistory();
  }, [date, selectedClass, selectedSubject]);

  const loadClassRosterAndHistory = async () => {
    try {
      setLoading(true);
      // Fetch students
      const studentList = await facultyApi.getStudents("", "A", "All");
      setStudents(studentList);

      // Check if attendance already marked for this date
      const past = await facultyApi.getAttendanceRecords(date, selectedSubject, selectedClass);
      setHistoryRecords(past);

      if (past.length > 0 && past[0].records) {
        // Pre-fill existing marked attendance
        const map = {};
        past[0].records.forEach((r) => {
          map[r.rollNumber] = r.status;
        });
        setAttendanceMap(map);
      } else {
        // Default everyone to "Present" for speed
        const map = {};
        studentList.forEach((s) => {
          map[s.rollNumber] = "Present";
        });
        setAttendanceMap(map);
      }
    } catch (err) {
      console.error("Attendance load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (rollNumber, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [rollNumber]: status
    }));
  };

  const markAll = (status) => {
    const map = {};
    students.forEach((s) => {
      map[s.rollNumber] = status;
    });
    setAttendanceMap(map);
  };

  const handleSaveAttendance = async () => {
    try {
      const records = students.map((s) => ({
        rollNumber: s.rollNumber,
        name: s.name,
        status: attendanceMap[s.rollNumber] || "Absent"
      }));

      const payload = {
        date,
        subject: selectedSubject,
        class: selectedClass,
        period: selectedPeriod,
        records
      };

      const res = await facultyApi.markAttendance(payload);
      setSaveStatus({ type: "success", text: res.message || "Attendance saved successfully to backend!" });
      loadClassRosterAndHistory();

      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err) {
      setSaveStatus({ type: "error", text: "Failed to save attendance." });
    }
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ["Roll Number", "Student Name", "Class", "Subject", "Date", "Period", "Status"];
    const rows = students.map((s) => [
      s.rollNumber,
      `"${s.name}"`,
      `"${selectedClass}"`,
      `"${selectedSubject}"`,
      date,
      `"${selectedPeriod}"`,
      attendanceMap[s.rollNumber] || "Absent"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_${selectedClass.replace(/\s+/g, "_")}_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats calculation
  const total = students.length;
  const presentCount = Object.values(attendanceMap).filter((s) => s === "Present").length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === "Absent").length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === "Late").length;
  const percentage = total > 0 ? ((presentCount / total) * 100).toFixed(1) : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>Attendance Management</h2>
          <p style={{ fontSize: "13px", color: "var(--fac-text-muted)", margin: "4px 0 0 0" }}>
            Record, monitor, and export daily period-wise classroom attendance.
          </p>
        </div>
        <button className="fac-btn secondary" onClick={exportToCSV}>
          📥 Export CSV Sheet
        </button>
      </div>

      {saveStatus && (
        <div className={`fac-alert-banner ${saveStatus.type}`}>
          <span>{saveStatus.text}</span>
          <button
            onClick={() => setSaveStatus(null)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Control Panel Card */}
      <div className="fac-card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div>
            <label className="fac-form-label">Date:</label>
            <input
              type="date"
              className="fac-form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="fac-form-label">Class & Branch:</label>
            <select
              className="fac-form-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="CSE - 3rd Year (Section A)">CSE - 3rd Year (Section A)</option>
              <option value="CSE - 2nd Year (Section B)">CSE - 2nd Year (Section B)</option>
              <option value="AIML - 3rd Year">AIML - 3rd Year</option>
            </select>
          </div>

          <div>
            <label className="fac-form-label">Subject:</label>
            <select
              className="fac-form-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
              <option value="Design and Analysis of Algorithms">Design & Analysis of Algorithms</option>
              <option value="Machine Learning">Machine Learning</option>
            </select>
          </div>

          <div>
            <label className="fac-form-label">Period / Lecture Slot:</label>
            <select
              className="fac-form-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="Period 1 (09:00 AM - 10:00 AM)">Period 1 (09:00 AM - 10:00 AM)</option>
              <option value="Period 2 (10:00 AM - 11:00 AM)">Period 2 (10:00 AM - 11:00 AM)</option>
              <option value="Period 3 (11:30 AM - 12:30 PM)">Period 3 (11:30 AM - 12:30 PM)</option>
              <option value="Lab Slot (02:00 PM - 04:30 PM)">Lab Slot (02:00 PM - 04:30 PM)</option>
            </select>
          </div>
        </div>

        {/* Live Metrics & Quick Mark Bar */}
        <div
          style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid var(--fac-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b" }}>Bulk Mark:</span>
            <button
              className="fac-btn success"
              style={{ padding: "6px 12px", fontSize: "12.5px" }}
              onClick={() => markAll("Present")}
            >
              ✓ All Present
            </button>
            <button
              className="fac-btn danger"
              style={{ padding: "6px 12px", fontSize: "12.5px" }}
              onClick={() => markAll("Absent")}
            >
              ✗ All Absent
            </button>
          </div>

          <div style={{ display: "flex", gap: "16px", alignItems: "center", fontSize: "13.5px", fontWeight: 700 }}>
            <span>Total: {total}</span>
            <span style={{ color: "#16a34a" }}>Present: {presentCount}</span>
            <span style={{ color: "#dc2626" }}>Absent: {absentCount}</span>
            {lateCount > 0 && <span style={{ color: "#d97706" }}>Late: {lateCount}</span>}
            <span className="fac-badge fac-badge-green" style={{ fontSize: "13px" }}>
              Rate: {percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Student Attendance Roster */}
      <div className="fac-card" style={{ padding: 0, overflow: "hidden", marginBottom: "20px" }}>
        <div className="fac-table-wrapper" style={{ border: "none" }}>
          <table className="fac-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Overall Attendance</th>
                <th style={{ textAlign: "center" }}>Mark Today's Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "24px" }}>
                    Loading student list...
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const currentStatus = attendanceMap[student.rollNumber] || "Present";
                  return (
                    <tr key={student.id}>
                      <td style={{ fontWeight: 700, color: "#1e3a8a" }}>{student.rollNumber}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{student.name}</div>
                      </td>
                      <td>
                        <span
                          className={`fac-badge ${
                            student.attendance >= 85
                              ? "fac-badge-green"
                              : student.attendance >= 75
                              ? "fac-badge-amber"
                              : "fac-badge-red"
                          }`}
                        >
                          {student.attendance}%
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.rollNumber, "Present")}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                              border: "1px solid",
                              borderColor: currentStatus === "Present" ? "#16a34a" : "#cbd5e1",
                              background: currentStatus === "Present" ? "#dcfce7" : "#ffffff",
                              color: currentStatus === "Present" ? "#15803d" : "#64748b"
                            }}
                          >
                            ✓ Present
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.rollNumber, "Late")}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                              border: "1px solid",
                              borderColor: currentStatus === "Late" ? "#d97706" : "#cbd5e1",
                              background: currentStatus === "Late" ? "#fef3c7" : "#ffffff",
                              color: currentStatus === "Late" ? "#b45309" : "#64748b"
                            }}
                          >
                            ⏰ Late
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.rollNumber, "Absent")}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                              border: "1px solid",
                              borderColor: currentStatus === "Absent" ? "#dc2626" : "#cbd5e1",
                              background: currentStatus === "Absent" ? "#fee2e2" : "#ffffff",
                              color: currentStatus === "Absent" ? "#b91c1c" : "#64748b"
                            }}
                          >
                            ✗ Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Submit Button */}
        <div style={{ padding: "16px 20px", background: "#f8fafc", borderTop: "1px solid var(--fac-border)", display: "flex", justifyContent: "flex-end" }}>
          <button className="fac-btn primary" onClick={handleSaveAttendance} style={{ padding: "10px 24px" }}>
            💾 Save & Submit Attendance to Portal
          </button>
        </div>
      </div>
    </div>
  );
}
