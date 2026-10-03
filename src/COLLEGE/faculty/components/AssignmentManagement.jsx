import React, { useEffect, useState } from "react";
import { facultyApi } from "../../../api/facultyApi";

export default function AssignmentManagement() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);

  // Form State
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    subject: "Data Structures & Algorithms",
    class: "CSE - 3rd Year (Section A)",
    dueDate: "2026-10-10",
    maxMarks: 25,
    description: ""
  });

  // Grade State
  const [gradingMarks, setGradingMarks] = useState({});
  const [gradingFeedback, setGradingFeedback] = useState({});

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await facultyApi.getAssignments();
      setAssignments(data);
    } catch (err) {
      console.error("Assignment fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newAssignment.title.trim()) {
      alert("Please enter assignment title.");
      return;
    }

    try {
      await facultyApi.createAssignment(newAssignment);
      setAlertMsg({ type: "success", text: "Assignment published successfully!" });
      setShowCreateModal(false);
      setNewAssignment({
        title: "",
        subject: "Data Structures & Algorithms",
        class: "CSE - 3rd Year (Section A)",
        dueDate: "2026-10-10",
        maxMarks: 25,
        description: ""
      });
      fetchAssignments();
      setTimeout(() => setAlertMsg(null), 4000);
    } catch (err) {
      setAlertMsg({ type: "error", text: "Failed to create assignment." });
    }
  };

  const handleGradeSubmission = async (assignmentId, submissionId) => {
    const marks = gradingMarks[submissionId];
    const feedback = gradingFeedback[submissionId] || "";

    if (marks === undefined || marks === "") {
      alert("Please enter marks to grade.");
      return;
    }

    try {
      await facultyApi.gradeSubmission(assignmentId, submissionId, marks, feedback);
      setAlertMsg({ type: "success", text: "Submission graded successfully!" });

      // Refresh local assignment list and active modal
      const updated = await facultyApi.getAssignments();
      setAssignments(updated);
      const cur = updated.find((a) => a.id === assignmentId);
      if (cur) setSelectedAssignment(cur);

      setTimeout(() => setAlertMsg(null), 3000);
    } catch (err) {
      alert("Grading failed.");
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>Assignment Management</h2>
          <p style={{ fontSize: "13px", color: "var(--fac-text-muted)", margin: "4px 0 0 0" }}>
            Create coursework tasks, track submissions, evaluate student reports, and assign marks.
          </p>
        </div>
        <button className="fac-btn primary" onClick={() => setShowCreateModal(true)}>
          ➕ Create Assignment
        </button>
      </div>

      {alertMsg && (
        <div className={`fac-alert-banner ${alertMsg.type}`}>
          <span>{alertMsg.text}</span>
          <button
            onClick={() => setAlertMsg(null)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Assignment Cards */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="fac-card" style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📝</div>
          <h3 style={{ margin: "0 0 6px 0" }}>No Assignments Found</h3>
          <p style={{ color: "#64748b", margin: 0 }}>Create your first student assignment by clicking the button above.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
          {assignments.map((asn) => {
            const submissions = asn.submissions || [];
            const gradedCount = submissions.filter((s) => s.status === "Graded").length;
            const isClosed = asn.status === "Closed";

            return (
              <div key={asn.id} className="fac-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <span className={`fac-badge ${isClosed ? "fac-badge-red" : "fac-badge-green"}`}>
                      {asn.status}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#e11d48" }}>
                      Deadline: {asn.dueDate}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "16.5px", fontWeight: 700, margin: "0 0 6px 0", color: "#0f172a", lineHeight: 1.3 }}>
                    {asn.title}
                  </h3>

                  <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600, marginBottom: "8px" }}>
                    {asn.subject} • {asn.class} • <span style={{ color: "#059669" }}>Max: {asn.maxMarks} Marks</span>
                  </div>

                  <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.5, margin: 0 }}>
                    {asn.description}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    paddingTop: "14px",
                    borderTop: "1px solid var(--fac-border)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 600, color: "#334155" }}>
                      Submissions: {asn.submittedCount} / {asn.totalCount} Students
                    </span>
                    <span style={{ color: "#16a34a", fontWeight: 700 }}>
                      Graded: {gradedCount}
                    </span>
                  </div>

                  {/* Submission bar */}
                  <div style={{ width: "100%", height: "6px", background: "#e2e8f0", borderRadius: "9999px", overflow: "hidden", marginBottom: "14px" }}>
                    <div
                      style={{
                        width: `${(asn.submittedCount / (asn.totalCount || 1)) * 100}%`,
                        height: "100%",
                        background: "#2563eb",
                        borderRadius: "9999px"
                      }}
                    />
                  </div>

                  <button
                    className="fac-btn primary"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => setSelectedAssignment(asn)}
                  >
                    📂 Review Submissions & Grade ({submissions.length})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fac-modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="fac-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fac-modal-header">
              <h3 className="fac-modal-title">Create New Student Assignment</h3>
              <button className="fac-modal-close" onClick={() => setShowCreateModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="fac-form-group">
                <label className="fac-form-label">Assignment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Assignment 4: Binary Trees & Graph Algorithms Problem Set"
                  className="fac-form-input"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="fac-form-group">
                  <label className="fac-form-label">Subject</label>
                  <select
                    className="fac-form-select"
                    value={newAssignment.subject}
                    onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                  >
                    <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                    <option value="Design and Analysis of Algorithms">Design & Analysis of Algorithms</option>
                    <option value="Machine Learning">Machine Learning</option>
                  </select>
                </div>

                <div className="fac-form-group">
                  <label className="fac-form-label">Target Class</label>
                  <select
                    className="fac-form-select"
                    value={newAssignment.class}
                    onChange={(e) => setNewAssignment({ ...newAssignment, class: e.target.value })}
                  >
                    <option value="CSE - 3rd Year (Section A)">CSE - 3rd Year (Section A)</option>
                    <option value="CSE - 2nd Year (Section B)">CSE - 2nd Year (Section B)</option>
                    <option value="AIML - 3rd Year">AIML - 3rd Year</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="fac-form-group">
                  <label className="fac-form-label">Submission Due Date *</label>
                  <input
                    type="date"
                    required
                    className="fac-form-input"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  />
                </div>

                <div className="fac-form-group">
                  <label className="fac-form-label">Maximum Marks *</label>
                  <input
                    type="number"
                    required
                    min="5"
                    max="100"
                    className="fac-form-input"
                    value={newAssignment.maxMarks}
                    onChange={(e) => setNewAssignment({ ...newAssignment, maxMarks: e.target.value })}
                  />
                </div>
              </div>

              <div className="fac-form-group">
                <label className="fac-form-label">Instructions & Problem Statement</label>
                <textarea
                  className="fac-form-textarea"
                  placeholder="Detail assignment questions, submission guidelines, plagiarism policies..."
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                />
              </div>

              <div className="fac-btn-group">
                <button type="button" className="fac-btn secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="fac-btn primary">
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions & Grading Drawer/Modal */}
      {selectedAssignment && (
        <div className="fac-modal-backdrop" onClick={() => setSelectedAssignment(null)}>
          <div className="fac-modal" style={{ maxWidth: "750px" }} onClick={(e) => e.stopPropagation()}>
            <div className="fac-modal-header">
              <div>
                <h3 className="fac-modal-title">{selectedAssignment.title}</h3>
                <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>
                  Max Marks: {selectedAssignment.maxMarks} | Due Date: {selectedAssignment.dueDate}
                </div>
              </div>
              <button className="fac-modal-close" onClick={() => setSelectedAssignment(null)}>
                ✕
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 10px 0" }}>
                Student Submissions ({selectedAssignment.submissions?.length || 0})
              </h4>

              {(!selectedAssignment.submissions || selectedAssignment.submissions.length === 0) ? (
                <div style={{ padding: "24px", textAlign: "center", background: "#f8fafc", borderRadius: "8px", color: "#64748b" }}>
                  No student submissions received yet for this assignment.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {selectedAssignment.submissions.map((sub) => (
                    <div
                      key={sub.submissionId}
                      style={{
                        padding: "14px",
                        background: "#f8fafc",
                        borderRadius: "10px",
                        border: "1px solid var(--fac-border)"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>
                            {sub.studentName} <span style={{ color: "#2563eb", fontWeight: 600 }}>({sub.rollNumber})</span>
                          </div>
                          <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                            Submitted: {sub.submittedAt} • Attachment: <a href="#view" style={{ color: "#2563eb" }}>{sub.fileUrl}</a>
                          </div>
                        </div>

                        <span className={`fac-badge ${sub.status === "Graded" ? "fac-badge-green" : "fac-badge-amber"}`}>
                          {sub.status === "Graded" ? `Graded (${sub.marks}/${selectedAssignment.maxMarks})` : "Pending Evaluation"}
                        </span>
                      </div>

                      {/* Grading Input Controls */}
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                          marginTop: "10px",
                          paddingTop: "10px",
                          borderTop: "1px dashed var(--fac-border)"
                        }}
                      >
                        <input
                          type="number"
                          placeholder={`Score (/${selectedAssignment.maxMarks})`}
                          style={{ width: "110px", padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--fac-border)", fontSize: "13px" }}
                          defaultValue={sub.marks ?? ""}
                          onChange={(e) =>
                            setGradingMarks({ ...gradingMarks, [sub.submissionId]: e.target.value })
                          }
                        />

                        <input
                          type="text"
                          placeholder="Faculty Feedback / Remarks..."
                          style={{ flex: 1, padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--fac-border)", fontSize: "13px" }}
                          defaultValue={sub.feedback || ""}
                          onChange={(e) =>
                            setGradingFeedback({ ...gradingFeedback, [sub.submissionId]: e.target.value })
                          }
                        />

                        <button
                          type="button"
                          className="fac-btn success"
                          style={{ padding: "6px 14px", fontSize: "12px", whiteSpace: "nowrap" }}
                          onClick={() => handleGradeSubmission(selectedAssignment.id, sub.submissionId)}
                        >
                          Save Grade
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="fac-btn secondary" onClick={() => setSelectedAssignment(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
