import React, { useEffect, useState } from "react";
import { facultyApi } from "../../../api/facultyApi";

const normalizeStatus = (status) => {
  if (typeof status !== "string") return "pending";
  return status.trim().toLowerCase();
};

const statusLabel = (status) => {
  const value = normalizeStatus(status);
  if (value === "approved") return "Approved";
  if (value === "rejected") return "Rejected";
  return "Pending";
};

export default function OutpassApproval() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");
  const [actionModal, setActionModal] = useState(null); // { type: 'approve' | 'reject', request: obj }
  const [remarks, setRemarks] = useState("");
  const [alertMsg, setAlertMsg] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetchOutpasses();
  }, []);

  const fetchOutpasses = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const data = await facultyApi.getOutpasses();
      setRequests(data);
    } catch (err) {
      setLoadError(err.message || "Unable to load outpass requests.");
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
      await fetchOutpasses();
      setTimeout(() => setAlertMsg(null), 4000);
    } catch (err) {
      setAlertMsg({ type: "error", text: err.message || "Failed to approve outpass." });
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
      await fetchOutpasses();
      setTimeout(() => setAlertMsg(null), 4000);
    } catch (err) {
      setAlertMsg({ type: "error", text: err.message || "Failed to reject outpass." });
    }
  };

  const filtered = requests.filter((r) => {
    if (filter === "All") return true;
    return normalizeStatus(r.status) === filter.toLowerCase();
  });

  const pendingCount = requests.filter((r) => normalizeStatus(r.status) === "pending").length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>Outpass Requests & Gate Passes</h2>
          <p style={{ fontSize: "13px", color: "var(--fac-text-muted)", margin: "4px 0 0 0" }}>
            Review and decide outpass requests for students in your assigned branch.
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
      ) : loadError ? (
        <div className="fac-card" style={{ textAlign: "center", padding: "40px" }}>
          <p role="alert" style={{ color: "#b91c1c" }}>{loadError}</p>
          <button type="button" className="fac-btn secondary" onClick={fetchOutpasses}>
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="fac-card" style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎫</div>
          <h3 style={{ margin: "0 0 6px 0" }}>No {filter} Requests</h3>
          <p style={{ color: "#64748b", margin: 0 }}>There are currently no outpass requests in this category.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
          {filtered.map((req) => {
            const statusValue = normalizeStatus(req.status);
            const isPending = statusValue === "pending";
            const isApproved = statusValue === "approved";
            const statusText = statusLabel(req.status);

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
                      Roll No: {req.rollNumber}
                      {req.branch && ` • ${req.branch}`}
                      {req.section && ` • Section ${req.section}`}
                    </div>
                  </div>

                  <span
                    className={`fac-badge ${
                      isPending ? "fac-badge-amber" : isApproved ? "fac-badge-green" : "fac-badge-red"
                    }`}
                  >
                    {statusText}
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

                {(req.facultyRemarks || req.rejectionReason) && (
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
                    <b>{isApproved ? "Approval Note:" : "Faculty Remark:"}</b> {req.facultyRemarks || req.rejectionReason}
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
                    Outpass approved
                    {req.reviewedAt && ` on ${new Date(req.reviewedAt).toLocaleString()}`}
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
