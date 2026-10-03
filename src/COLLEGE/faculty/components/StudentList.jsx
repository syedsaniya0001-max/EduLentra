import React, { useEffect, useState } from "react";
import { facultyApi } from "../../../api/facultyApi";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("All");
  const [semester, setSemester] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [search, branch, semester]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await facultyApi.getStudents(search, branch, semester);
      setStudents(data);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>Student Directory</h2>
          <p style={{ fontSize: "13px", color: "var(--fac-text-muted)", margin: "4px 0 0 0" }}>
            View and manage students under your branches, monitor attendance, and review academic performance.
          </p>
        </div>
        <div className="fac-badge fac-badge-blue" style={{ fontSize: "13px", padding: "6px 14px" }}>
          Total: {students.length} Students
        </div>
      </div>

      {/* Filter Bar */}
      <div className="fac-filter-bar">
        <input
          type="text"
          className="fac-search-input"
          placeholder="🔍 Search student by name, roll number, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="fac-select-input"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        >
          <option value="All">All Branches</option>
          <option value="CSE">CSE</option>
          <option value="AIML">AIML</option>
          <option value="A">Section A</option>
          <option value="B">Section B</option>
        </select>

        <select
          className="fac-select-input"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="All">All Semesters</option>
          <option value="3">Semester 3 (2nd Year)</option>
          <option value="5">Semester 5 (3rd Year)</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="fac-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="fac-table-wrapper" style={{ border: "none" }}>
          <table className="fac-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Branch & Section</th>
                <th>Semester</th>
                <th>Attendance</th>
                <th>CGPA</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    Loading student records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    No students found matching current filters.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const isLowAttendance = student.attendance < 75;
                  return (
                    <tr key={student.id}>
                      <td style={{ fontWeight: 700, color: "#1e3a8a" }}>{student.rollNumber}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{student.name}</div>
                        <div style={{ fontSize: "11.5px", color: "#64748b" }}>{student.email}</div>
                      </td>
                      <td>
                        <span className="fac-badge fac-badge-blue">
                          {student.branch} - Sec {student.section}
                        </span>
                      </td>
                      <td>Sem {student.semester}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                          {isLowAttendance && (
                            <span title="Attendance below 75% requirement" style={{ cursor: "pointer", fontSize: "14px" }}>
                              ⚠️
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700 }}>{student.cgpa}</td>
                      <td>
                        <span
                          className={`fac-badge ${
                            isLowAttendance ? "fac-badge-red" : "fac-badge-green"
                          }`}
                        >
                          {student.status || "Active"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="fac-btn secondary"
                          style={{ padding: "6px 12px", fontSize: "12.5px" }}
                          onClick={() => setSelectedStudent(student)}
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fac-modal-backdrop" onClick={() => setSelectedStudent(null)}>
          <div className="fac-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fac-modal-header">
              <h3 className="fac-modal-title">Student Profile Dossier</h3>
              <button className="fac-modal-close" onClick={() => setSelectedStudent(null)}>
                ✕
              </button>
            </div>

            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "#dbeafe",
                  color: "#1e40af",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: 800
                }}
              >
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "18px" }}>{selectedStudent.name}</h4>
                <div style={{ fontSize: "13px", color: "#64748b" }}>
                  Roll No: <span style={{ fontWeight: 700, color: "#0f172a" }}>{selectedStudent.rollNumber}</span> | {selectedStudent.department}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "13.5px" }}>
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid var(--fac-border)" }}>
                <span style={{ color: "#64748b", fontSize: "12px" }}>Class & Section:</span>
                <div style={{ fontWeight: 600, marginTop: "2px" }}>
                  {selectedStudent.branch} - Year {selectedStudent.year} (Sem {selectedStudent.semester})
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid var(--fac-border)" }}>
                <span style={{ color: "#64748b", fontSize: "12px" }}>Cumulative CGPA:</span>
                <div style={{ fontWeight: 700, color: "#16a34a", fontSize: "15px", marginTop: "2px" }}>
                  {selectedStudent.cgpa} / 10.0
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid var(--fac-border)" }}>
                <span style={{ color: "#64748b", fontSize: "12px" }}>Current Attendance:</span>
                <div
                  style={{
                    fontWeight: 700,
                    color: selectedStudent.attendance >= 75 ? "#16a34a" : "#dc2626",
                    fontSize: "15px",
                    marginTop: "2px"
                  }}
                >
                  {selectedStudent.attendance}%
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid var(--fac-border)" }}>
                <span style={{ color: "#64748b", fontSize: "12px" }}>Hostel Accommodation:</span>
                <div style={{ fontWeight: 600, marginTop: "2px" }}>{selectedStudent.hostelRoom}</div>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid var(--fac-border)" }}>
                <span style={{ color: "#64748b", fontSize: "12px" }}>Student Contact:</span>
                <div style={{ fontWeight: 600, marginTop: "2px" }}>{selectedStudent.phone}</div>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid var(--fac-border)" }}>
                <span style={{ color: "#64748b", fontSize: "12px" }}>Parent / Guardian Phone:</span>
                <div style={{ fontWeight: 600, marginTop: "2px" }}>{selectedStudent.parentPhone}</div>
              </div>
            </div>

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button className="fac-btn primary" onClick={() => setSelectedStudent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
