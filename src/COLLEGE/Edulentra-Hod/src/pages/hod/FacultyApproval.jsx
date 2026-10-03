import HODLayout from "../../components/hod/HODLayout";
import "../../styles/hod/FacultyApproval.css";

function FacultyApproval() {
  const requests = [
    {
      id: "REQ001",
      name: "Dr. Arun Kumar",
      designation: "Assistant Professor",
      subject: "Deep Learning",
      date: "01 Oct 2026",
      status: "Pending",
    },
    {
      id: "REQ002",
      name: "Dr. Meena Reddy",
      designation: "Associate Professor",
      subject: "Data Science",
      date: "30 Sep 2026",
      status: "Pending",
    },
    {
      id: "REQ003",
      name: "Prof. Vijay Kumar",
      designation: "Assistant Professor",
      subject: "Computer Networks",
      date: "28 Sep 2026",
      status: "Approved",
    },
    {
      id: "REQ004",
      name: "Dr. Anitha Rao",
      designation: "Professor",
      subject: "Artificial Intelligence",
      date: "26 Sep 2026",
      status: "Rejected",
    },
  ];

  return (
    <HODLayout>

      <div className="faculty-approval">

        {/* Page Header */}
        <div className="approval-page-header">
          <div>
            <h2>Faculty Approval</h2>
            <p>
              Review and manage faculty approval requests for the department.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="approval-summary">

          <div className="approval-summary-card">
            <span>Total Requests</span>
            <strong>24</strong>
          </div>

          <div className="approval-summary-card pending-card">
            <span>Pending</span>
            <strong>8</strong>
          </div>

          <div className="approval-summary-card approved-card">
            <span>Approved</span>
            <strong>14</strong>
          </div>

          <div className="approval-summary-card rejected-card">
            <span>Rejected</span>
            <strong>2</strong>
          </div>

        </div>

        {/* Approval Table */}
        <div className="approval-table-container">

          <div className="approval-table-header">

            <div>
              <h3>Faculty Requests</h3>
              <p>Review submitted faculty requests</p>
            </div>

            <select>
              <option>All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>

          </div>

          <div className="approval-table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Faculty Name</th>
                  <th>Designation</th>
                  <th>Subject</th>
                  <th>Applied Date</th>
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

                    <td>{request.name}</td>

                    <td>{request.designation}</td>

                    <td>{request.subject}</td>

                    <td>{request.date}</td>

                    <td>
                      <span
                        className={`approval-status ${request.status.toLowerCase()}`}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td>

                      {request.status === "Pending" ? (
                        <div className="approval-actions">

                          <button className="approve-btn">
                            Approve
                          </button>

                          <button className="reject-btn">
                            Reject
                          </button>

                        </div>
                      ) : (
                        <button className="view-request-btn">
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

export default FacultyApproval;