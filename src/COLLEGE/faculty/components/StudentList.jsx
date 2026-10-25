import React, { useCallback, useEffect, useState } from "react";
import { facultyApi } from "../../../api/facultyApi";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("All");
  const [sections, setSections] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState("");

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await facultyApi.getStudents(search, section);
      setStudents(data.students);
      setSections(data.sections);
    } catch (loadError) {
      setError(loadError.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, [search, section]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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
          aria-label="Filter students by section"
          value={section}
          onChange={(e) => setSection(e.target.value)}
        >
          <option value="All">All Sections</option>
          {sections.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

      </div>

      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}

      {/* Students Table */}
      <div className="fac-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="fac-table-wrapper" style={{ border: "none" }}>
          <table className="fac-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Branch</th>
                <th>Entry Type</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    Loading student records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    No students found matching current filters.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  return (
                    <tr key={student.id}>
                      <td style={{ fontWeight: 700, color: "#1e3a8a" }}>{student.rollNumber}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{student.name}</div>
                      </td>
                      <td>{student.email || "—"}</td>
                      <td>
                        <span className="fac-badge fac-badge-blue">
                          {student.branch}{student.section ? ` - Sec ${student.section}` : ""}
                        </span>
                      </td>
                      <td>{student.entryType || "—"}</td>
                      <td>
                        <span className="fac-badge fac-badge-green">Active</span>
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
                  Roll No: <span style={{ fontWeight: 700, color: "#0f172a" }}>{selectedStudent.rollNumber}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "13.5px" }}>
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid var(--fac-border)" }}>
                <span style={{ color: "#64748b", fontSize: "12px" }}>Branch:</span>
                <div style={{ fontWeight: 600, marginTop: "2px" }}>
                  {selectedStudent.branch}{selectedStudent.section ? ` - Section ${selectedStudent.section}` : ""}
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid var(--fac-border)" }}>
                <span style={{ color: "#64748b", fontSize: "12px" }}>Registered Email:</span>
                <div style={{ fontWeight: 600, marginTop: "2px" }}>
                  {selectedStudent.email || "—"}
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid var(--fac-border)" }}>
                <span style={{ color: "#64748b", fontSize: "12px" }}>Entry Type:</span>
                <div style={{ fontWeight: 600, marginTop: "2px" }}>
                  {selectedStudent.entryType || "—"}
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid var(--fac-border)" }}>
                <span style={{ color: "#64748b", fontSize: "12px" }}>Account Status:</span>
                <div style={{ fontWeight: 600, marginTop: "2px" }}>Active</div>
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
