import HODLayout from "../../components/hod/HODLayout";
import "../../styles/hod/StudentManagement.css";

function StudentManagement() {
  const students = [
    {
      id: "STU001",
      name: "Rahul Kumar",
      year: "3rd Year",
      section: "A",
      attendance: "92%",
      status: "Active",
    },
    {
      id: "STU002",
      name: "Priya Reddy",
      year: "3rd Year",
      section: "A",
      attendance: "88%",
      status: "Active",
    },
    {
      id: "STU003",
      name: "Arjun Sharma",
      year: "2nd Year",
      section: "B",
      attendance: "76%",
      status: "Active",
    },
    {
      id: "STU004",
      name: "Sneha Rao",
      year: "4th Year",
      section: "A",
      attendance: "95%",
      status: "Active",
    },
    {
      id: "STU005",
      name: "Kiran Kumar",
      year: "2nd Year",
      section: "A",
      attendance: "68%",
      status: "Active",
    },
  ];

  return (
    <HODLayout>

      <div className="student-management">

        {/* Page Header */}
        <div className="student-page-header">
          <div>
            <h2>Student Management</h2>
            <p>
              View and manage students in the CSE - Artificial Intelligence
              department.
            </p>
          </div>

          <button className="add-student-btn">
            + Add Student
          </button>
        </div>

        {/* Summary Cards */}
        <div className="student-summary">

          <div className="student-summary-card">
            <span>Total Students</span>
            <strong>420</strong>
          </div>

          <div className="student-summary-card">
            <span>Active Students</span>
            <strong>405</strong>
          </div>

          <div className="student-summary-card">
            <span>Low Attendance</span>
            <strong>28</strong>
          </div>

          <div className="student-summary-card">
            <span>New Students</span>
            <strong>15</strong>
          </div>

        </div>

        {/* Student Table */}
        <div className="student-table-container">

          <div className="student-table-header">

            <div>
              <h3>Students</h3>
              <p>Department student records</p>
            </div>

            <div className="student-filters">

              <input
                type="text"
                placeholder="Search student..."
              />

              <select>
                <option>All Years</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>

            </div>

          </div>

          <div className="table-wrapper">

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
                      <span
                        className={
                          parseInt(student.attendance) < 75
                            ? "attendance-low"
                            : "attendance-good"
                        }
                      >
                        {student.attendance}
                      </span>
                    </td>

                    <td>
                      <span className="student-status">
                        {student.status}
                      </span>
                    </td>

                    <td>
                      <button className="view-student-btn">
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

export default StudentManagement;