import { useCallback, useEffect, useMemo, useState } from "react";
import { roleApprovalApi } from "../../../../../api/roleApprovalApi";
import HODLayout from "../../components/hod/HODLayout";
import "../../styles/hod/FacultyManagement.css";

function FacultyManagement() {
  const [faculty, setFaculty] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFaculty = useCallback(async () => {
    setError("");
    try {
      const result = await roleApprovalApi.directory("faculty");
      setFaculty(result.faculty || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFaculty();
  }, [loadFaculty]);

  const filteredFaculty = useMemo(() => {
    const query = search.trim().toLowerCase();
    return faculty.filter((member) =>
      !query ||
      `${member.name} ${member.facultyId} ${member.subject}`
        .toLowerCase()
        .includes(query)
    );
  }, [faculty, search]);

  const departmentCount = new Set(faculty.map((member) => member.department)).size;
  const subjectCount = new Set(faculty.map((member) => member.subject)).size;

  return (
    <HODLayout>
      <div className="faculty-management">
        <div className="faculty-page-header">
          <div>
            <h2>Faculty Management</h2>
            <p>View approved faculty accounts in your department.</p>
          </div>
        </div>

        <div className="faculty-summary">
          <div className="faculty-summary-card">
            <span>Total Faculty</span>
            <strong>{faculty.length}</strong>
          </div>
          <div className="faculty-summary-card">
            <span>Departments</span>
            <strong>{departmentCount}</strong>
          </div>
          <div className="faculty-summary-card">
            <span>Subjects</span>
            <strong>{subjectCount}</strong>
          </div>
          <div className="faculty-summary-card">
            <span>Active Accounts</span>
            <strong>{faculty.length}</strong>
          </div>
        </div>

        <div className="faculty-table-container">
          <div className="faculty-table-header">
            <div>
              <h3>Faculty Members</h3>
              <p>Approved department faculty records</p>
            </div>
            <div className="faculty-filters">
              <input
                type="search"
                placeholder="Search faculty..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
          <div className="faculty-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Faculty ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="6">Loading faculty accounts...</td></tr>
                ) : filteredFaculty.length === 0 ? (
                  <tr><td colSpan="6">No approved faculty accounts found.</td></tr>
                ) : filteredFaculty.map((member) => (
                  <tr key={member._id}>
                    <td><strong>{member.facultyId}</strong></td>
                    <td>{member.name}</td>
                    <td>{member.email || "—"}</td>
                    <td>{member.subject}</td>
                    <td>{member.department}</td>
                    <td><span className="faculty-status">Active</span></td>
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
