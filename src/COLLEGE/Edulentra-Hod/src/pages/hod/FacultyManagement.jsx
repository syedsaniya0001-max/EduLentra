import HODLayout from "../../components/hod/HODLayout";
import "../../styles/hod/FacultyManagement.css";

function FacultyManagement() {
  const faculty = [
    {
      id: "FAC001",
      name: "Dr. Anil Kumar",
      designation: "Professor",
      subjects: "Artificial Intelligence",
      experience: "12 Years",
      status: "Active",
    },
    {
      id: "FAC002",
      name: "Dr. Priya Sharma",
      designation: "Associate Professor",
      subjects: "Machine Learning",
      experience: "9 Years",
      status: "Active",
    },
    {
      id: "FAC003",
      name: "Prof. Ravi Teja",
      designation: "Assistant Professor",
      subjects: "Computer Vision",
      experience: "6 Years",
      status: "Active",
    },
    {
      id: "FAC004",
      name: "Prof. Sneha Reddy",
      designation: "Assistant Professor",
      subjects: "Data Science",
      experience: "5 Years",
      status: "Active",
    },
    {
      id: "FAC005",
      name: "Dr. Kiran Rao",
      designation: "Associate Professor",
      subjects: "Natural Language Processing",
      experience: "10 Years",
      status: "Active",
    },
  ];

  return (
    <HODLayout>

      <div className="faculty-management">

        {/* Page Header */}
        <div className="faculty-page-header">
          <div>
            <h2>Faculty Management</h2>
            <p>
              View and manage faculty members in the CSE - Artificial
              Intelligence department.
            </p>
          </div>

          <button className="add-faculty-btn">
            + Add Faculty
          </button>
        </div>

        {/* Summary Cards */}
        <div className="faculty-summary">

          <div className="faculty-summary-card">
            <span>Total Faculty</span>
            <strong>32</strong>
          </div>

          <div className="faculty-summary-card">
            <span>Professors</span>
            <strong>8</strong>
          </div>

          <div className="faculty-summary-card">
            <span>Associate Professors</span>
            <strong>10</strong>
          </div>

          <div className="faculty-summary-card">
            <span>Assistant Professors</span>
            <strong>14</strong>
          </div>

        </div>

        {/* Faculty Table */}
        <div className="faculty-table-container">

          <div className="faculty-table-header">

            <div>
              <h3>Faculty Members</h3>
              <p>Department faculty records</p>
            </div>

            <div className="faculty-filters">

              <input
                type="text"
                placeholder="Search faculty..."
              />

              <select>
                <option>All Designations</option>
                <option>Professor</option>
                <option>Associate Professor</option>
                <option>Assistant Professor</option>
              </select>

            </div>

          </div>

          <div className="faculty-table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Faculty ID</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Subject</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {faculty.map((member) => (

                  <tr key={member.id}>

                    <td>
                      <strong>{member.id}</strong>
                    </td>

                    <td>{member.name}</td>

                    <td>{member.designation}</td>

                    <td>{member.subjects}</td>

                    <td>{member.experience}</td>

                    <td>
                      <span className="faculty-status">
                        {member.status}
                      </span>
                    </td>

                    <td>
                      <button className="view-faculty-btn">
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

export default FacultyManagement;