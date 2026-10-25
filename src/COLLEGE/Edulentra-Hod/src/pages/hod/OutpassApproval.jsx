import { useEffect, useMemo, useState } from "react";
import { outpassesApi } from "../../../../../api/outpassesApi";
import HODLayout from "../../components/hod/HODLayout";
import "../../styles/hod/OutpassApproval.css";

const normalizeStatus = (status) => String(status || "PENDING").toUpperCase();

function OutpassApproval() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    outpassesApi.getDepartment()
      .then((items) => {
        if (!cancelled) setRequests(items);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message || "Unable to load department outpass requests.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((item) => normalizeStatus(item.status) === "PENDING").length,
    approved: requests.filter((item) => normalizeStatus(item.status) === "APPROVED").length,
    rejected: requests.filter((item) => normalizeStatus(item.status) === "REJECTED").length,
  }), [requests]);

  const filteredRequests = filter === "ALL"
    ? requests
    : requests.filter((item) => normalizeStatus(item.status) === filter);

  const updateRequest = async (nextStatus) => {
    if (!selected || isSaving) return;
    if (nextStatus === "REJECTED" && !remarks.trim()) {
      setError("Enter a reason before rejecting an outpass.");
      return;
    }

    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      const updated = await outpassesApi.updateDepartment(selected._id, {
        status: nextStatus,
        remarks,
      });
      setRequests((items) => items.map((item) =>
        item._id === updated._id ? { ...item, ...updated, student: item.student } : item
      ));
      setSelected(null);
      setRemarks("");
      setNotice(nextStatus === "APPROVED" ? "Outpass approved." : "Outpass rejected.");
    } catch (requestError) {
      setError(requestError.message || "Unable to update this outpass.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <HODLayout>
      <div className="outpass-approval">
        <div className="outpass-page-header">
          <div>
            <h2>Outpass Approval</h2>
            <p>Review real outpass requests submitted by students in your department.</p>
          </div>
        </div>

        {error && <p role="alert">{error}</p>}
        {notice && <p role="status">{notice}</p>}

        <div className="outpass-summary">
          <div className="outpass-summary-card">
            <span>Total Requests</span>
            <strong>{isLoading ? "…" : counts.total}</strong>
          </div>
          <div className="outpass-summary-card pending-card">
            <span>Pending</span>
            <strong>{isLoading ? "…" : counts.pending}</strong>
          </div>
          <div className="outpass-summary-card approved-card">
            <span>Approved</span>
            <strong>{isLoading ? "…" : counts.approved}</strong>
          </div>
          <div className="outpass-summary-card rejected-card">
            <span>Rejected</span>
            <strong>{isLoading ? "…" : counts.rejected}</strong>
          </div>
        </div>

        <div className="outpass-table-container">
          <div className="outpass-table-header">
            <div>
              <h3>Student Outpass Requests</h3>
              <p>Only requests belonging to active students in your department are shown.</p>
            </div>
            <label>
              Filter by status
              <select
                aria-label="Filter outpasses by status"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </label>
          </div>

          <div className="outpass-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Student</th>
                  <th>Roll Number</th>
                  <th>Reason / Destination</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => {
                  const status = normalizeStatus(request.status);
                  return (
                    <tr key={request._id}>
                      <td><strong>{request._id.slice(-8).toUpperCase()}</strong></td>
                      <td>{request.student?.name || "Student"}</td>
                      <td>{request.student?.rollNumber || "—"}</td>
                      <td>{request.reason}<br /><small>{request.destination}</small></td>
                      <td>{request.fromDate ? new Date(request.fromDate).toLocaleString() : "—"}</td>
                      <td>{request.toDate ? new Date(request.toDate).toLocaleString() : "—"}</td>
                      <td>
                        <span className={`outpass-status ${status.toLowerCase()}`}>
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td>
                        {status === "PENDING" ? (
                          <div className="outpass-actions">
                            <button
                              className="outpass-approve-btn"
                              type="button"
                              onClick={() => {
                                setSelected(request);
                                setRemarks("");
                                setError("");
                              }}
                            >
                              Review
                            </button>
                          </div>
                        ) : (
                          <span>{request.reviewRemarks || request.rejectionReason || "Reviewed"}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!isLoading && filteredRequests.length === 0 && (
                  <tr><td colSpan="8">No {filter === "ALL" ? "" : filter.toLowerCase()} outpass requests.</td></tr>
                )}
                {isLoading && <tr><td colSpan="8">Loading outpass requests...</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <section
            aria-label="Outpass review"
            style={{ marginTop: "20px", padding: "20px", background: "#fff", borderRadius: "12px" }}
          >
            <h3>Review request from {selected.student?.name || "Student"}</h3>
            <p><strong>Roll number:</strong> {selected.student?.rollNumber || "—"}</p>
            <p><strong>Reason:</strong> {selected.reason}</p>
            <p><strong>Destination:</strong> {selected.destination}</p>
            <label htmlFor="outpass-review-remarks">Review note / rejection reason</label>
            <textarea
              id="outpass-review-remarks"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              maxLength={1000}
              rows={3}
            />
            <div className="outpass-actions">
              <button
                type="button"
                className="outpass-approve-btn"
                disabled={isSaving}
                onClick={() => updateRequest("APPROVED")}
              >
                {isSaving ? "Saving..." : "Approve"}
              </button>
              <button
                type="button"
                className="outpass-reject-btn"
                disabled={isSaving}
                onClick={() => updateRequest("REJECTED")}
              >
                {isSaving ? "Saving..." : "Reject"}
              </button>
              <button type="button" onClick={() => setSelected(null)} disabled={isSaving}>
                Cancel
              </button>
            </div>
          </section>
        )}
      </div>
    </HODLayout>
  );
}

export default OutpassApproval;
