import { useEffect, useMemo, useState } from "react";
import { complaintsApi } from "../../../../../api/complaintsApi";
import HODLayout from "../../components/hod/HODLayout";
import "../../styles/hod/ComplaintManagement.css";

const statusLabels = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  RESOLVED: "Resolved",
};

function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    complaintsApi.getDepartment()
      .then((items) => {
        if (!cancelled) setComplaints(items);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message || "Unable to load department complaints.");
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
    total: complaints.length,
    pending: complaints.filter((item) => item.status === "PENDING").length,
    review: complaints.filter((item) => item.status === "UNDER_REVIEW").length,
    resolved: complaints.filter((item) => item.status === "RESOLVED").length,
  }), [complaints]);

  const filteredComplaints = statusFilter === "ALL"
    ? complaints
    : complaints.filter((item) => item.status === statusFilter);

  const openComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setResponse(complaint.response || "");
    setNotice("");
  };

  const saveComplaintUpdate = async (event) => {
    event.preventDefault();
    if (!selectedComplaint || isSaving) return;

    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      const updatedComplaint = await complaintsApi.update(selectedComplaint._id, {
        status: selectedComplaint.status === "RESOLVED" ? "RESOLVED" : "UNDER_REVIEW",
        response,
      });
      setComplaints((items) => items.map((item) =>
        item._id === updatedComplaint._id ? { ...item, ...updatedComplaint } : item
      ));
      setSelectedComplaint(updatedComplaint);
      setNotice("Complaint review saved.");
    } catch (requestError) {
      setError(requestError.message || "Unable to update this complaint.");
    } finally {
      setIsSaving(false);
    }
  };

  const resolveComplaint = async () => {
    if (!selectedComplaint || isSaving) return;

    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      const updatedComplaint = await complaintsApi.update(selectedComplaint._id, {
        status: "RESOLVED",
        response,
      });
      setComplaints((items) => items.map((item) =>
        item._id === updatedComplaint._id ? { ...item, ...updatedComplaint } : item
      ));
      setSelectedComplaint(updatedComplaint);
      setNotice("Complaint marked as resolved.");
    } catch (requestError) {
      setError(requestError.message || "Unable to resolve this complaint.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <HODLayout>
      <div className="complaint-management">
        <div className="complaint-page-header">
          <h2>Complaint Management</h2>
          <p>Review student complaints from your department and send a response.</p>
        </div>

        {error && <p role="alert">{error}</p>}
        {notice && <p role="status">{notice}</p>}

        <div className="complaint-summary">
          <div className="complaint-summary-card"><span>Total Complaints</span><strong>{counts.total}</strong></div>
          <div className="complaint-summary-card pending-card"><span>Pending</span><strong>{counts.pending}</strong></div>
          <div className="complaint-summary-card review-card"><span>Under Review</span><strong>{counts.review}</strong></div>
          <div className="complaint-summary-card resolved-card"><span>Resolved</span><strong>{counts.resolved}</strong></div>
        </div>

        <div className="complaint-table-container">
          <div className="complaint-table-header">
            <div>
              <h3>Student Complaints</h3>
              <p>Only complaints for your department are shown.</p>
            </div>
            <label>
              Filter by status
              <select
                aria-label="Filter complaints by status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="ALL">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </label>
          </div>

          <div className="complaint-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint._id}>
                    <td>{complaint.student?.name || "Student"}</td>
                    <td>{complaint.student?.rollNumber || "—"}</td>
                    <td>{complaint.subject}</td>
                    <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`complaint-status ${complaint.status.toLowerCase().replaceAll("_", "-")}`}>
                        {statusLabels[complaint.status] || complaint.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="complaint-view-btn"
                        type="button"
                        onClick={() => openComplaint(complaint)}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
                {!isLoading && filteredComplaints.length === 0 && (
                  <tr>
                    <td colSpan="6">No complaints found.</td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td colSpan="6">Loading complaints...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedComplaint && (
          <section className="complaint-review-panel" aria-label="Complaint review">
            <h3>{selectedComplaint.subject}</h3>
            <p><strong>From:</strong> {selectedComplaint.student?.name || "Student"} ({selectedComplaint.student?.rollNumber || "—"})</p>
            <p>{selectedComplaint.description}</p>
            {selectedComplaint.status === "RESOLVED" ? (
              <p><strong>Department response:</strong> {selectedComplaint.response || "No response was provided."}</p>
            ) : (
              <form onSubmit={saveComplaintUpdate}>
                <label htmlFor="complaint-response">Response to student</label>
                <textarea
                  id="complaint-response"
                  value={response}
                  onChange={(event) => setResponse(event.target.value)}
                  maxLength={3000}
                  rows={4}
                  required
                />
                <button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save review"}
                </button>
                <button type="button" disabled={isSaving} onClick={resolveComplaint}>
                  {isSaving ? "Saving..." : "Resolve complaint"}
                </button>
              </form>
            )}
          </section>
        )}
      </div>
    </HODLayout>
  );
}

export default ComplaintManagement;
