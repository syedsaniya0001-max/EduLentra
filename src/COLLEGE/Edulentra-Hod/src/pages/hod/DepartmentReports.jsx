import HODLayout from "../../components/hod/HODLayout";
import "../../styles/hod/DepartmentReports.css";

function DepartmentReports() {
  const reports = [
    {
      id: "REP001",
      title: "Student Performance Report",
      type: "Academic",
      period: "2026 - Semester I",
      date: "02 Oct 2026",
      status: "Generated",
    },
    {
      id: "REP002",
      title: "Faculty Performance Report",
      type: "Faculty",
      period: "2026 - Semester I",
      date: "01 Oct 2026",
      status: "Generated",
    },
    {
      id: "REP003",
      title: "Attendance Report",
      type: "Attendance",
      period: "2026 - Semester I",
      date: "30 Sep 2026",
      status: "Generated",
    },
    {
      id: "REP004",
      title: "Department Summary Report",
      type: "Department",
      period: "September 2026",
      date: "30 Sep 2026",
      status: "Generated",
    },
  ];

  return (
    <HODLayout>

      <div className="department-reports">

        {/* Page Header */}
        <div className="reports-page-header">

          <div>
            <h2>Department Reports</h2>
            <p>
              View department performance reports and academic statistics.
            </p>
          </div>

          <button className="generate-report-btn">
            + Generate Report
          </button>

        </div>

        {/* Summary Cards */}
        <div className="reports-summary">

          <div className="reports-summary-card">
            <span>Total Reports</span>
            <strong>24</strong>
          </div>

          <div className="reports-summary-card">
            <span>Academic Reports</span>
            <strong>8</strong>
          </div>

          <div className="reports-summary-card">
            <span>Faculty Reports</span>
            <strong>6</strong>
          </div>

          <div className="reports-summary-card">
            <span>Attendance Reports</span>
            <strong>10</strong>
          </div>

        </div>

        {/* Report Statistics */}
        <div className="report-statistics">

          <div className="report-stat-card">
            <div className="report-stat-icon">
              👨‍🎓
            </div>

            <div>
              <span>Total Students</span>
              <strong>420</strong>
              <small>Department strength</small>
            </div>
          </div>

          <div className="report-stat-card">
            <div className="report-stat-icon">
              📊
            </div>

            <div>
              <span>Average Attendance</span>
              <strong>86.5%</strong>
              <small>Current semester</small>
            </div>
          </div>

          <div className="report-stat-card">
            <div className="report-stat-icon">
              🎓
            </div>

            <div>
              <span>Pass Percentage</span>
              <strong>92%</strong>
              <small>Previous semester</small>
            </div>
          </div>

          <div className="report-stat-card">
            <div className="report-stat-icon">
              👨‍🏫
            </div>

            <div>
              <span>Faculty Members</span>
              <strong>32</strong>
              <small>Active faculty</small>
            </div>
          </div>

        </div>

        {/* Reports Table */}
        <div className="reports-table-container">

          <div className="reports-table-header">

            <div>
              <h3>Generated Reports</h3>
              <p>Department reports and documents</p>
            </div>

            <select>
              <option>All Report Types</option>
              <option>Academic</option>
              <option>Faculty</option>
              <option>Attendance</option>
              <option>Department</option>
            </select>

          </div>

          <div className="reports-table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Report Name</th>
                  <th>Type</th>
                  <th>Period</th>
                  <th>Generated Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {reports.map((report) => (

                  <tr key={report.id}>

                    <td>
                      <strong>{report.id}</strong>
                    </td>

                    <td>{report.title}</td>

                    <td>{report.type}</td>

                    <td>{report.period}</td>

                    <td>{report.date}</td>

                    <td>
                      <span className="report-status">
                        {report.status}
                      </span>
                    </td>

                    <td>
                      <button className="download-report-btn">
                        ↓ Download
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

export default DepartmentReports;