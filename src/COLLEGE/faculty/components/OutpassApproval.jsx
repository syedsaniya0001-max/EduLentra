import React, { useEffect, useState } from "react";
import { facultyApi } from "../../../api/facultyApi";

export default function OutpassApproval() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");
  const [actionModal, setActionModal] = useState(null); // { type: 'approve' | 'reject', request: obj }
  const [remarks, setRemarks] = useState("");
  const [alertMsg, setAlertMsg] = useState(null);

  useEffect(() => {
    fetchOutpasses();
  }, []);

  const fetchOutpasses = async () => {
    try {
      setLoading(true);
      const data = await facultyApi.getOutpasses();
      setRequests(data);
    } catch (err) {
      console.error("Outpass error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!actionModal) return;
    try {
      await facultyApi.approveOutpass(actionModal.request.id, remarks || "Approved by Class Advisor.");
      setAlertMsg({ type: "success", text: `Outpass for ${actionModal.request.studentName} approved!` });
      setActionModal(null);
      setRemarks("");
      fetchOutpasses();
      setTimeout(() => setAlertMsg(null), 4000);
    } catch (err) {
      setAlertMsg({ type: "error", text: "Failed to approve outpass." });
    }
  };

  const handleReject = async () => {
    if (!actionModal) return;
    if (!remarks.trim()) {
      alert("Please provide a reason for rejecting the outpass.");
      return;
    }
    try {
      await facultyApi.rejectOutpass(actionModal.request.id, remarks);
      setAlertMsg({ type: "info", text: `Outpass for ${actionModal.request.studentName} rejected.` });
      setActionModal(null);
      setRemarks("");
      fetchOutpasses();
      setTimeout(() => setAlertMsg(null), 4000);
    } catch (err) {
      setAlertMsg({ type: "error", text: "Failed to reject outpass." });
    }
  };

  const filtered = requests.filter((r) => {
    if (filter === "All") return true;
    return r.status === filter;
  });

  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>Outpass Requests & Gate Passes</h2>
          <p style={{ fontSize: "13px", color: "var(--fac-text-muted)", margin: "4px 0 0 0" }}>
            Review, verify parent contacts, and grant electronic gate passes for hostel students.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["Pending", "Approved", "Rejected", "All"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: filter === tab ? "#2563eb" : "#ffffff",
                color: filter === tab ? "#ffffff" : "#64748b",
                boxShadow: filter === tab ? "0 2px 8px rgba(37, 99, 235, 0.25)" : "none"
              }}
            >
              {tab} {tab === "Pending" && pendingCount > 0 && `(${pendingCount})`}
            </button>
          ))}
        </div>
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

      {/* Outpass Cards */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading outpasses...</div>
      ) : filtered.length === 0 ? (
        <div className="fac-card" style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎫</div>
          <h3 style={{ margin: "0 0 6px 0" }}>No {filter} Requests</h3>
          <p style={{ color: "#64748b", margin: 0 }}>There are currently no outpass requests in this category.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
          {filtered.map((req) => {
            const isPending = req.status === "Pending";
            const isApproved = req.status === "Approved";

            return (
              <div
                key={req.id}
                className="fac-card"
                style={{
                  borderLeft: `5px solid ${
                    isPending ? "#f59e0b" : isApproved ? "#10b981" : "#ef4444"
                  }`
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 2px 0", fontSize: "16.5px", fontWeight: 700, color: "#0f172a" }}>
                      {req.studentName}
                    </h3>
                    <div style={{ fontSize: "12.5px", color: "#2563eb", fontWeight: 600 }}>
                      Roll No: {req.rollNumber} • {req.hostelRoom}
                    </div>
                  </div>

                  <span
                    className={`fac-badge ${
                      isPending ? "fac-badge-amber" : isApproved ? "fac-badge-green" : "fac-badge-red"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                {/* Details */}
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--fac-border)",
                    marginBottom: "14px",
                    fontSize: "13px"
                  }}
                >
                  <div style={{ marginBottom: "6px" }}>
                    <span style={{ color: "#64748b" }}>Reason:</span>{" "}
                    <b style={{ color: "#0f172a" }}>{req.reason}</b>
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    <span style={{ color: "#64748b" }}>Destination:</span>{" "}
                    <b>{req.destination}</b>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed var(--fac-border)" }}>
                    <div>
                      <span style={{ color: "#64748b", fontSize: "11px" }}>Out Time:</span>
                      <div style={{ fontWeight: 600, fontSize: "12px" }}>{req.outDate}</div>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", fontSize: "11px" }}>In Time:</span>
                      <div style={{ fontWeight: 600, fontSize: "12px" }}>{req.inDate}</div>
                    </div>
                  </div>
                </div>

                {/* Contact numbers */}
                <div style={{ fontSize: "12.5px", color: "#475569", marginBottom: "14px", display: "flex", justifyContent: "space-between" }}>
                  <span>
                    📞 Parent: <a href={`tel:${req.parentPhone}`} style={{ color: "#2563eb", fontWeight: 600 }}>{req.parentPhone}</a>
                  </span>
                  <span>
                    📱 Student: <a href={`tel:${req.studentPhone}`} style={{ color: "#2563eb", fontWeight: 600 }}>{req.studentPhone}</a>
                  </span>
                </div>

                {req.facultyRemarks && (
                  <div
                    style={{
                      fontSize: "12px",
                      background: isApproved ? "#dcfce7" : "#fee2e2",
                      color: isApproved ? "#166534" : "#991b1b",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      marginBottom: "12px"
                    }}
                  >
                    <b>Faculty Remark:</b> {req.facultyRemarks}
                  </div>
                )}

                {/* Actions */}
                {isPending ? (
                  <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                    <button
                      className="fac-btn success"
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => {
                        setActionModal({ type: "approve", request: req });
                        setRemarks("Approved by Class Advisor. Ensure timely reporting.");
                      }}
                    >
                      ✓ Approve Outpass
                    </button>
                    <button
                      className="fac-btn danger"
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => {
                        setActionModal({ type: "reject", request: req });
                        setRemarks("");
                      }}
                    >
                      ✗ Reject
                    </button>
                  </div>
                ) : isApproved ? (
                  <div style={{ textAlign: "center", padding: "6px", background: "#f0fdf4", borderRadius: "6px", fontSize: "12px", color: "#15803d", fontWeight: 700 }}>
                    Gate Pass Issued • Gate Pass ID: GP-{req.id}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {actionModal && (
        <div className="fac-modal-backdrop" onClick={() => setActionModal(null)}>
          <div className="fac-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fac-modal-header">
              <h3 className="fac-modal-title">
                {actionModal.type === "approve" ? "Approve Outpass Request" : "Reject Outpass Request"}
              </h3>
              <button className="fac-modal-close" onClick={() => setActionModal(null)}>
                ✕
              </button>
            </div>

            <div style={{ marginBottom: "16px", fontSize: "14px" }}>
              Are you sure you want to <b>{actionModal.type}</b> outpass request for{" "}
              <b style={{ color: "#2563eb" }}>{actionModal.request.studentName}</b> ({actionModal.request.rollNumber})?
            </div>

            <div className="fac-form-group">
              <label className="fac-form-label">
                {actionModal.type === "approve" ? "Remarks / Conditions:" : "Reason for Rejection *:"}
              </label>
              <textarea
                className="fac-form-textarea"
                required={actionModal.type === "reject"}
                placeholder={
                  actionModal.type === "approve"
                    ? "e.g. Approved. Student must report before 8:00 PM."
                    : "e.g. Low attendance percentage / internal exam conflict."
                }
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            <div className="fac-btn-group">
              <button className="fac-btn secondary" onClick={() => setActionModal(null)}>
                Cancel
              </button>
              {actionModal.type === "approve" ? (
                <button className="fac-btn success" onClick={handleApprove}>
                  Confirm Approval
                </button>
              ) : (
                <button className="fac-btn danger" onClick={handleReject}>
                  Confirm Rejection
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
