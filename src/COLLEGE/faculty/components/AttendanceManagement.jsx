import React, { useEffect, useMemo, useState } from "react";
import { facultyApi } from "../../../api/facultyApi";

const PERIODS = [
  "Period 1 (09:00 AM - 10:00 AM)",
  "Period 2 (10:00 AM - 11:00 AM)",
  "Period 3 (11:30 AM - 12:30 PM)",
  "Lab Slot (02:00 PM - 04:30 PM)",
];

const localDate = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const STATUS_LABELS = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
};

export default function AttendanceManagement() {
  const [date, setDate] = useState(localDate);
  const [selectedSection, setSelectedSection] = useState("All");
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0]);
  const [branch, setBranch] = useState("");
  const [subject, setSubject] = useState("");
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setSaveStatus(null);

    facultyApi
      .getAttendanceRoster(date, selectedSection, selectedPeriod)
      .then((result) => {
        if (cancelled) return;
        setBranch(result.branch || "");
        setSubject(result.subject || "");
        setSections(result.sections);
        setStudents(result.students);
        setAttendanceMap(
          Object.fromEntries(
            result.students.map((student) => [
              student.id,
              student.attendanceStatus || "",
            ])
          )
        );
      })
      .catch((loadError) => {
        if (!cancelled) {
          setStudents([]);
          setAttendanceMap({});
          setError(loadError.message || "Unable to load the attendance roster.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date, selectedSection, selectedPeriod]);

  const counts = useMemo(
    () =>
      Object.values(attendanceMap).reduce(
        (result, status) => {
          if (status === "PRESENT") result.present += 1;
          if (status === "ABSENT") result.absent += 1;
          if (status === "LATE") result.late += 1;
          return result;
        },
        { present: 0, absent: 0, late: 0 }
      ),
    [attendanceMap]
  );
  const markedCount = counts.present + counts.absent + counts.late;
  const attendanceRate = students.length
    ? (((counts.present + counts.late) / students.length) * 100).toFixed(1)
    : "0.0";

  const setStatus = (studentId, status) => {
    setAttendanceMap((current) => ({ ...current, [studentId]: status }));
  };

  const markAll = (status) => {
    setAttendanceMap(
      Object.fromEntries(students.map((student) => [student.id, status]))
    );
  };

  const exportToCSV = () => {
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = [
      ["Roll Number", "Student Name", "Branch", "Section", "Subject", "Date", "Period", "Status"],
      ...students.map((student) => [
        student.rollNumber,
        student.name,
        branch,
        student.section || "Unassigned",
        subject,
        date,
        selectedPeriod,
        STATUS_LABELS[attendanceMap[student.id]] || "Unmarked",
      ]),
    ];
    const content = rows.map((row) => row.map(escape).join(",")).join("\r\n");
    const link = document.createElement("a");
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(content)}`;
    link.download = `Attendance_${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveAttendance = async () => {
    if (!students.length || markedCount !== students.length) {
      setSaveStatus({
        type: "error",
        text: "Mark every student before saving attendance.",
      });
      return;
    }

    setSaving(true);
    setSaveStatus(null);
    try {
      const result = await facultyApi.markAttendance({
        date,
        section: selectedSection,
        period: selectedPeriod,
        records: students.map((student) => ({
          studentId: student.id,
          status: attendanceMap[student.id],
        })),
      });
      setSaveStatus({
        type: "success",
        text: result.message || "Attendance saved successfully.",
      });
    } catch (saveError) {
      setSaveStatus({
        type: "error",
        text: saveError.message || "Unable to save attendance.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>Attendance Management</h2>
          <p style={{ fontSize: "13px", color: "var(--fac-text-muted)", margin: "4px 0 0" }}>
            Mark attendance for active students in your assigned branch.
          </p>
        </div>
        <button className="fac-btn secondary" onClick={exportToCSV} disabled={!students.length || loading}>
          Export CSV
        </button>
      </div>

      {error && <div className="fac-alert-banner error" role="alert">{error}</div>}
      {saveStatus && (
        <div className={`fac-alert-banner ${saveStatus.type}`} role={saveStatus.type === "error" ? "alert" : "status"}>
          {saveStatus.text}
        </div>
      )}

      <div className="fac-card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div>
            <label className="fac-form-label" htmlFor="attendance-date">Date</label>
            <input id="attendance-date" type="date" className="fac-form-input" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>
          <div>
            <label className="fac-form-label" htmlFor="attendance-branch">Branch</label>
            <input id="attendance-branch" className="fac-form-input" value={branch || "Loading..."} readOnly />
          </div>
          <div>
            <label className="fac-form-label" htmlFor="attendance-section">Section</label>
            <select id="attendance-section" className="fac-form-select" value={selectedSection} onChange={(event) => setSelectedSection(event.target.value)}>
              <option value="All">All sections</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section === "__unassigned__" ? "Unassigned section" : section}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="fac-form-label" htmlFor="attendance-subject">Subject</label>
            <input id="attendance-subject" className="fac-form-input" value={subject || "Loading..."} readOnly />
          </div>
          <div>
            <label className="fac-form-label" htmlFor="attendance-period">Period</label>
            <select id="attendance-period" className="fac-form-select" value={selectedPeriod} onChange={(event) => setSelectedPeriod(event.target.value)}>
              {PERIODS.map((period) => <option key={period} value={period}>{period}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--fac-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b" }}>Bulk mark:</span>
            <button className="fac-btn success" onClick={() => markAll("PRESENT")} disabled={loading || !students.length}>All Present</button>
            <button className="fac-btn danger" onClick={() => markAll("ABSENT")} disabled={loading || !students.length}>All Absent</button>
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center", fontSize: "13.5px", fontWeight: 700 }}>
            <span>Total: {students.length}</span>
            <span style={{ color: "#16a34a" }}>Present: {counts.present}</span>
            <span style={{ color: "#dc2626" }}>Absent: {counts.absent}</span>
            <span style={{ color: "#d97706" }}>Late: {counts.late}</span>
            <span className="fac-badge fac-badge-green">Rate: {attendanceRate}%</span>
          </div>
        </div>
      </div>

      <div className="fac-card" style={{ padding: 0, overflow: "hidden", marginBottom: "20px" }}>
        <div className="fac-table-wrapper" style={{ border: "none" }}>
          <table className="fac-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th style={{ textAlign: "center" }}>Attendance status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" style={{ textAlign: "center", padding: "24px" }}>Loading attendance roster...</td></tr>
              ) : students.length ? students.map((student) => (
                <tr key={student.id}>
                  <td style={{ fontWeight: 700, color: "#1e3a8a" }}>{student.rollNumber}</td>
                  <td>{student.name}</td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "inline-flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                      {Object.entries(STATUS_LABELS).map(([status, label]) => (
                        <button
                          key={status}
                          type="button"
                          aria-pressed={attendanceMap[student.id] === status}
                          onClick={() => setStatus(student.id, status)}
                          className={`fac-btn ${attendanceMap[student.id] === status ? status === "PRESENT" ? "success" : status === "ABSENT" ? "danger" : "warning" : "secondary"}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="3" style={{ textAlign: "center", padding: "24px" }}>No active students were found in this branch and section.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "16px 20px", background: "#f8fafc", borderTop: "1px solid var(--fac-border)", display: "flex", justifyContent: "flex-end" }}>
          <button className="fac-btn primary" onClick={handleSaveAttendance} disabled={loading || saving || !students.length || markedCount !== students.length}>
            {saving ? "Saving..." : "Save attendance"}
          </button>
        </div>
      </div>
    </div>
  );
}
