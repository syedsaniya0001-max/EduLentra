import { useEffect, useMemo, useState } from "react";
import HODLayout from "../../components/hod/HODLayout";
import { attendanceApi } from "../../../../../api/attendanceApi";
import "../../styles/hod/StudentManagement.css";

function StudentManagement() {
  const [department, setDepartment] = useState("");
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    attendanceApi.getDepartment()
      .then((result) => {
        if (!cancelled) {
          setDepartment(result.department);
          setStudents(result.students);
          setError("");
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError.message || "Unable to load department students.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const sections = useMemo(
    () => [...new Set(students.map((student) => student.section || "Unassigned"))].sort(),
    [students]
  );
  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSection =
        sectionFilter === "All" ||
        (student.section || "Unassigned") === sectionFilter;
      const matchesSearch =
        !query ||
        `${student.name} ${student.rollNumber} ${student.email || ""}`
          .toLowerCase()
          .includes(query);
      return matchesSection && matchesSearch;
    });
  }, [students, search, sectionFilter]);

  const recentCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentStudents = students.filter(
    (student) => new Date(student.createdAt).getTime() >= recentCutoff
  ).length;
  const lowAttendance = students.filter(
    (student) => student.percentage !== null && student.percentage < 75
  ).length;

  return (
    <HODLayout>
      <div className="student-management">
        <div className="student-page-header">
          <div>
            <h2>Student Management</h2>
            <p>
              {department
                ? `View active student accounts in ${department}.`
                : "View active student accounts in your department."}
            </p>
          </div>
        </div>

        {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}

        <div className="student-summary">
          <div className="student-summary-card">
            <span>Total Students</span>
            <strong>{isLoading ? "—" : students.length}</strong>
          </div>
          <div className="student-summary-card">
            <span>Active Students</span>
            <strong>{isLoading ? "—" : students.length}</strong>
          </div>
          <div className="student-summary-card">
            <span>Low Attendance</span>
            <strong>{isLoading ? "—" : lowAttendance}</strong>
          </div>
          <div className="student-summary-card">
            <span>New Students (30 days)</span>
            <strong>{isLoading ? "—" : recentStudents}</strong>
          </div>
        </div>

        <div className="student-table-container">
          <div className="student-table-header">
            <div>
              <h3>Students</h3>
              <p>Department student records and submitted attendance</p>
            </div>

            <div className="student-filters">
              <input
                type="search"
                aria-label="Search students"
                placeholder="Search name, roll number, or email"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <select
                aria-label="Filter students by section"
                value={sectionFilter}
                onChange={(event) => setSectionFilter(event.target.value)}
              >
                <option value="All">All sections</option>
                {sections.map((section) => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Name</th>
                  <th>Section</th>
                  <th>Attendance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="6">Loading department students...</td></tr>
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan="6">No students match the selected filters.</td></tr>
                ) : filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td><strong>{student.rollNumber}</strong></td>
                    <td>{student.name}</td>
                    <td>{student.section || "Unassigned"}</td>
                    <td>
                      <span className={
                        student.percentage !== null && student.percentage < 75
                          ? "attendance-low"
                          : "attendance-good"
                      }>
                        {student.percentage === null ? "No data" : `${student.percentage}%`}
                      </span>
                    </td>
                    <td>
                      <span className="student-status">
                        {student.status === "No data" ? "Active · No attendance" : "Active"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="view-student-btn"
                        onClick={() => setSelectedStudent(student)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedStudent && (
          <div
            role="presentation"
            onClick={() => setSelectedStudent(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              display: "grid",
              placeItems: "center",
              padding: "20px",
              background: "rgba(15, 23, 42, 0.5)",
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="student-detail-title"
              onClick={(event) => event.stopPropagation()}
              style={{
                width: "min(520px, 100%)",
                padding: "24px",
                borderRadius: "14px",
                background: "#fff",
              }}
            >
              <h3 id="student-detail-title">{selectedStudent.name}</h3>
              <p>Roll Number: {selectedStudent.rollNumber}</p>
              <p>Email: {selectedStudent.email || "Not provided"}</p>
              <p>Department: {selectedStudent.branch}</p>
              <p>Section: {selectedStudent.section || "Unassigned"}</p>
              <p>Entry Type: {selectedStudent.entryType || "Not provided"}</p>
              <p>
                Attendance: {selectedStudent.percentage === null
                  ? "No records submitted"
                  : `${selectedStudent.percentage}% (${selectedStudent.present} present, ${selectedStudent.absent} absent, ${selectedStudent.late} late)`}
              </p>
              <button type="button" onClick={() => setSelectedStudent(null)}>Close</button>
            </section>
          </div>
        )}
      </div>
    </HODLayout>
  );
}

export default StudentManagement;
