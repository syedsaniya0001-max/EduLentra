import React, { useCallback, useEffect, useState } from "react";
import { roleApprovalApi } from "../../../api/roleApprovalApi";

export default function StudentSignupApprovals() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    setError("");
    try {
      const result = await roleApprovalApi.list("student");
      setRequests(result.requests || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const decide = async (request, decision) => {
    setReviewingId(request._id);
    setMessage("");
    setError("");
    try {
      const result = await roleApprovalApi.decide(
        "student",
        request._id,
        decision
      );
      setRequests((current) =>
        current.filter((item) => item._id !== request._id)
      );
      setMessage(result.message);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setReviewingId("");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>Student Signup Approvals</h2>
          <p style={{ fontSize: "13px", color: "var(--fac-text-muted)", margin: "4px 0 0 0" }}>
            Review and approve student portal registrations before access is granted.
          </p>
        </div>
        <div className="fac-badge fac-badge-amber" style={{ fontSize: "13px", padding: "6px 14px" }}>
          {requests.length} Pending
        </div>
      </div>

      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}

      <div className="fac-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="fac-table-wrapper" style={{ border: "none" }}>
          <table className="fac-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll Number</th>
                <th>Department</th>
                <th>Requested On</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    Loading student requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    No pending signup requests.
                  </td>
                </tr>
              ) : (
                requests.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{student.name}</div>
                      <div style={{ fontSize: "11.5px", color: "#64748b" }}>{student.email}</div>
                    </td>
                    <td>{student.rollNumber}</td>
                    <td>{student.branch}</td>
                    <td>{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "—"}</td>
                    <td>
                      <span className="fac-badge fac-badge-amber">Pending</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <button
                          className="fac-btn primary"
                          style={{ padding: "6px 12px", fontSize: "12.5px" }}
                          disabled={Boolean(reviewingId)}
                          onClick={() => decide(student, "APPROVED")}
                        >
                          {reviewingId === student._id ? "Saving..." : "Approve"}
                        </button>
                        <button
                          className="fac-btn secondary"
                          style={{ padding: "6px 12px", fontSize: "12.5px" }}
                          disabled={Boolean(reviewingId)}
                          onClick={() => decide(student, "REJECTED")}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
