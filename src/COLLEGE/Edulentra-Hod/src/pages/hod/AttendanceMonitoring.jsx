import HODLayout from "../../components/hod/HODLayout";
import "../../styles/hod/AttendanceMonitoring.css";

function AttendanceMonitoring() {
  const students = [
    {
      id: "STU001",
      name: "Rahul Kumar",
      year: "3rd Year",
      section: "A",
      attendance: 92,
      status: "Good",
    },
    {
      id: "STU002",
      name: "Priya Reddy",
      year: "3rd Year",
      section: "A",
      attendance: 88,
      status: "Good",
    },
    {
      id: "STU003",
      name: "Arjun Sharma",
      year: "2nd Year",
      section: "B",
      attendance: 76,
      status: "Average",
    },
    {
      id: "STU004",
      name: "Sneha Rao",
      year: "4th Year",
      section: "A",
      attendance: 95,
      status: "Excellent",
    },
    {
      id: "STU005",
      name: "Kiran Kumar",
      year: "2nd Year",
      section: "A",
      attendance: 68,
      status: "Low",
    },
  ];

  return (
    <HODLayout>

      <div className="attendance-monitoring">

        {/* Page Header */}
        <div className="attendance-page-header">
          <div>
            <h2>Attendance Monitoring</h2>
            <p>
              Monitor student attendance across the CSE - Artificial
              Intelligence department.
            </p>
          </div>

          <button className="attendance-export-btn">
            ↓ Export Report
          </button>
        </div>

        {/* Attendance Summary */}
        <div className="attendance-summary">

          <div className="attendance-summary-card">
            <span>Overall Attendance</span>
            <strong>86.5%</strong>
            <small>Department average</small>
          </div>

          <div className="attendance-summary-card">
            <span>Good Attendance</span>
            <strong>356</strong>
            <small>Above 75%</small>
          </div>

          <div className="attendance-summary-card">
            <span>Low Attendance</span>
            <strong>28</strong>
            <small>Below 75%</small>
          </div>

          <div className="attendance-summary-card">
            <span>Critical</span>
            <strong>8</strong>
            <small>Below 65%</small>
          </div>

        </div>

        {/* Filters */}
        <div className="attendance-filter-panel">

          <div className="attendance-filter">

            <label>Year</label>

            <select>
              <option>All Years</option>
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
            </select>

          </div>

          <div className="attendance-filter">

            <label>Section</label>

            <select>
              <option>All Sections</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>

          </div>

          <div className="attendance-filter">

            <label>Period</label>

            <select>
              <option>Current Semester</option>
              <option>Previous Semester</option>
            </select>

          </div>

          <div className="attendance-search">

            <label>Search</label>

            <input
              type="text"
              placeholder="Search student..."
            />

          </div>

        </div>

        {/* Attendance Table */}
        <div className="attendance-table-container">

          <div className="attendance-table-header">

            <div>
              <h3>Student Attendance</h3>
              <p>Current semester attendance records</p>
            </div>

          </div>

          <div className="attendance-table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Year</th>
                  <th>Section</th>
                  <th>Attendance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {students.map((student) => (

                  <tr key={student.id}>

                    <td>
                      <strong>{student.id}</strong>
                    </td>

                    <td>{student.name}</td>

                    <td>{student.year}</td>

                    <td>{student.section}</td>

                    <td>

                      <div className="attendance-value">

                        <div className="attendance-progress">

                          <div
                            className={
                              student.attendance < 65
                                ? "progress critical"
                                : student.attendance < 75
                                ? "progress low"
                                : "progress good"
                            }
                            style={{
                              width: `${student.attendance}%`,
                            }}
                          ></div>

                        </div>

                        <span>{student.attendance}%</span>

                      </div>

                    </td>

                    <td>

                      <span
                        className={`attendance-status ${student.status.toLowerCase()}`}
                      >
                        {student.status}
                      </span>

                    </td>

                    <td>

                      <button className="attendance-view-btn">
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

export default AttendanceMonitoring;