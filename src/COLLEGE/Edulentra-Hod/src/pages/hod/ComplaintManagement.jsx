import HODLayout from "../../components/hod/HODLayout";
import "../../styles/hod/ComplaintManagement.css";

function ComplaintManagement() {
  const complaints = [
    {
      id: "CMP001",
      student: "Rahul Kumar",
      studentId: "STU001",
      subject: "Classroom Facilities",
      date: "02 Oct 2026",
      priority: "Medium",
      status: "Pending",
    },
    {
      id: "CMP002",
      student: "Priya Reddy",
      studentId: "STU002",
      subject: "Faculty Concern",
      date: "01 Oct 2026",
      priority: "High",
      status: "Under Review",
    },
    {
      id: "CMP003",
      student: "Arjun Sharma",
      studentId: "STU003",
      subject: "Attendance Issue",
      date: "30 Sep 2026",
      priority: "Low",
      status: "Resolved",
    },
    {
      id: "CMP004",
      student: "Sneha Rao",
      studentId: "STU004",
      subject: "Laboratory Equipment",
      date: "29 Sep 2026",
      priority: "High",
      status: "Pending",
    },
  ];

  return (
    <HODLayout>

      <div className="complaint-management">

        {/* Page Header */}
        <div className="complaint-page-header">
          <div>
            <h2>Complaint Management</h2>
            <p>
              Review and manage student complaints and department concerns.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="complaint-summary">

          <div className="complaint-summary-card">
            <span>Total Complaints</span>
            <strong>36</strong>
          </div>

          <div className="complaint-summary-card pending-card">
            <span>Pending</span>
            <strong>12</strong>
          </div>

          <div className="complaint-summary-card review-card">
            <span>Under Review</span>
            <strong>8</strong>
          </div>

          <div className="complaint-summary-card resolved-card">
            <span>Resolved</span>
            <strong>16</strong>
          </div>

        </div>

        {/* Complaints Table */}
        <div className="complaint-table-container">

          <div className="complaint-table-header">

            <div>
              <h3>Student Complaints</h3>
              <p>Department complaint records</p>
            </div>

            <select>
              <option>All Status</option>
              <option>Pending</option>
              <option>Under Review</option>
              <option>Resolved</option>
            </select>

          </div>

          <div className="complaint-table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {complaints.map((complaint) => (

                  <tr key={complaint.id}>

                    <td>
                      <strong>{complaint.id}</strong>
                    </td>

                    <td>{complaint.student}</td>

                    <td>{complaint.studentId}</td>

                    <td>{complaint.subject}</td>

                    <td>{complaint.date}</td>

                    <td>
                      <span
                        className={`complaint-priority ${complaint.priority.toLowerCase()}`}
                      >
                        {complaint.priority}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`complaint-status ${complaint.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {complaint.status}
                      </span>
                    </td>

                    <td>
                      <button className="complaint-view-btn">
                        View
                      </button>
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

export default ComplaintManagement;