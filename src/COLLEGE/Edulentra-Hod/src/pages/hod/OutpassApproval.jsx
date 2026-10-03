import HODLayout from "../../components/hod/HODLayout";
import "../../styles/hod/OutpassApproval.css";

function OutpassApproval() {
  const requests = [
    {
      id: "OUT001",
      student: "Rahul Kumar",
      studentId: "STU001",
      reason: "Medical Appointment",
      date: "02 Oct 2026",
      time: "10:00 AM",
      status: "Pending",
    },
    {
      id: "OUT002",
      student: "Priya Reddy",
      studentId: "STU002",
      reason: "Family Function",
      date: "02 Oct 2026",
      time: "02:00 PM",
      status: "Pending",
    },
    {
      id: "OUT003",
      student: "Arjun Sharma",
      studentId: "STU003",
      reason: "Personal Work",
      date: "01 Oct 2026",
      time: "11:30 AM",
      status: "Approved",
    },
    {
      id: "OUT004",
      student: "Sneha Rao",
      studentId: "STU004",
      reason: "Medical Emergency",
      date: "30 Sep 2026",
      time: "09:00 AM",
      status: "Rejected",
    },
  ];

  return (
    <HODLayout>

      <div className="outpass-approval">

        {/* Page Header */}
        <div className="outpass-page-header">
          <div>
            <h2>Outpass Approval</h2>
            <p>
              Review and manage student outpass requests.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="outpass-summary">

          <div className="outpass-summary-card">
            <span>Total Requests</span>
            <strong>32</strong>
          </div>

          <div className="outpass-summary-card pending-card">
            <span>Pending</span>
            <strong>7</strong>
          </div>

          <div className="outpass-summary-card approved-card">
            <span>Approved</span>
            <strong>21</strong>
          </div>

          <div className="outpass-summary-card rejected-card">
            <span>Rejected</span>
            <strong>4</strong>
          </div>

        </div>

        {/* Requests Table */}
        <div className="outpass-table-container">

          <div className="outpass-table-header">

            <div>
              <h3>Student Outpass Requests</h3>
              <p>Review submitted outpass requests</p>
            </div>

            <select>
              <option>All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>

          </div>

          <div className="outpass-table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {requests.map((request) => (

                  <tr key={request.id}>

                    <td>
                      <strong>{request.id}</strong>
                    </td>

                    <td>{request.student}</td>

                    <td>{request.studentId}</td>

                    <td>{request.reason}</td>

                    <td>{request.date}</td>

                    <td>{request.time}</td>

                    <td>
                      <span
                        className={`outpass-status ${request.status.toLowerCase()}`}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td>

                      {request.status === "Pending" ? (
                        <div className="outpass-actions">

                          <button className="outpass-approve-btn">
                            Approve
                          </button>

                          <button className="outpass-reject-btn">
                            Reject
                          </button>

                        </div>
                      ) : (
                        <button className="outpass-view-btn">
                          View
                        </button>
                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </HODLayout>
  );
}

export default OutpassApproval;