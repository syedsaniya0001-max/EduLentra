import { useCallback, useEffect, useState } from "react";
import { roleApprovalApi } from "../../../../../api/roleApprovalApi";
import HODLayout from "../../components/hod/HODLayout";
import "../../styles/hod/FacultyApproval.css";

function FacultyApproval() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    setError("");
    try {
      const result = await roleApprovalApi.list("faculty");
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
        "faculty",
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
    <HODLayout>
      <div className="faculty-approval">
        <div className="approval-page-header">
          <div>
            <h2>Faculty Approval</h2>
            <p>
              Review pending faculty registrations for your department.
            </p>
          </div>
        </div>

        <div className="approval-summary">
          <div className="approval-summary-card pending-card">
            <span>Pending Requests</span>
            <strong>{requests.length}</strong>
          </div>
        </div>

        {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
        {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}

        <div className="approval-table-container">
          <div className="approval-table-header">
            <div>
              <h3>Faculty Requests</h3>
              <p>Requests from your department</p>
            </div>
          </div>

          <div className="approval-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Faculty ID</th>
                  <th>Faculty Name</th>
                  <th>Department</th>
                  <th>Subject</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="7">Loading faculty requests...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan="7">No pending faculty requests.</td></tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request._id}>
                      <td><strong>{request.facultyId}</strong></td>
                      <td>{request.name}</td>
                      <td>{request.department}</td>
                      <td>{request.subject}</td>
                      <td>{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "—"}</td>
                      <td>
                        <span className="approval-status pending">Pending</span>
                      </td>
                      <td>
                        <div className="approval-actions">
                          <button
                            className="approve-btn"
                            disabled={Boolean(reviewingId)}
                            onClick={() => decide(request, "APPROVED")}
                          >
                            {reviewingId === request._id ? "Saving..." : "Approve"}
                          </button>
                          <button
                            className="reject-btn"
                            disabled={Boolean(reviewingId)}
                            onClick={() => decide(request, "REJECTED")}
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
    </HODLayout>
  );
}

export default FacultyApproval;
