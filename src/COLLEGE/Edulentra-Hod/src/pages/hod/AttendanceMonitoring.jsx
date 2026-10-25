import { useEffect, useMemo, useState } from "react";
import HODLayout from "../../components/hod/HODLayout";
import { attendanceApi } from "../../../../../api/attendanceApi";
import "../../styles/hod/AttendanceMonitoring.css";

function AttendanceMonitoring() {
  const [department, setDepartment] = useState("");
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [sectionFilter, setSectionFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    attendanceApi.getDepartment()
      .then((result) => {
        if (!cancelled) {
          setDepartment(result.department);
          setSummary(result.summary);
          setStudents(result.students);
          setError("");
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError.message || "Unable to load department attendance.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
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
      const section = student.section || "Unassigned";
      const matchesSection = sectionFilter === "All" || section === sectionFilter;
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.rollNumber.toLowerCase().includes(query);
      return matchesSection && matchesSearch;
    });
  }, [students, sectionFilter, search]);

  const exportToCSV = () => {
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = [
      ["Roll Number", "Student Name", "Section", "Present", "Absent", "Late", "Total", "Attendance %", "Status"],
      ...filteredStudents.map((student) => [
        student.rollNumber,
        student.name,
        student.section || "Unassigned",
        student.present,
        student.absent,
        student.late,
        student.total,
        student.percentage ?? "No data",
        student.status,
      ]),
    ];
    const content = rows.map((row) => row.map(escape).join(",")).join("\r\n");
    const link = document.createElement("a");
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(content)}`;
    link.download = "Department_Attendance.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <HODLayout>
      <div className="attendance-monitoring">
        <div className="attendance-page-header">
          <div>
            <h2>Attendance Monitoring</h2>
            <p>
              {department
                ? `Attendance records for ${department}.`
                : "Department attendance records."}
            </p>
          </div>
          <button
            className="attendance-export-btn"
            onClick={exportToCSV}
            disabled={!filteredStudents.length || loading}
          >
            Export Report
          </button>
        </div>

        {error && <p role="alert">{error}</p>}

        <div className="attendance-summary">
          <div className="attendance-summary-card">
            <span>Overall Attendance</span>
            <strong>{summary?.percentage == null ? "—" : `${summary.percentage}%`}</strong>
            <small>{summary?.totalRecords || 0} submitted attendance records</small>
          </div>
          <div className="attendance-summary-card">
            <span>Students Above 75%</span>
            <strong>{summary?.goodCount ?? "—"}</strong>
            <small>Based on submitted records</small>
          </div>
          <div className="attendance-summary-card">
            <span>Below 75%</span>
            <strong>{summary?.lowCount ?? "—"}</strong>
            <small>Students needing attention</small>
          </div>
          <div className="attendance-summary-card">
            <span>Below 65%</span>
            <strong>{summary?.criticalCount ?? "—"}</strong>
            <small>Critical attendance</small>
          </div>
        </div>

        <div className="attendance-filter-panel">
          <div className="attendance-filter">
            <label htmlFor="attendance-section-filter">Section</label>
            <select
              id="attendance-section-filter"
              value={sectionFilter}
              onChange={(event) => setSectionFilter(event.target.value)}
            >
              <option value="All">All sections</option>
              {sections.map((section) => <option key={section} value={section}>{section}</option>)}
            </select>
          </div>
          <div className="attendance-search">
            <label htmlFor="attendance-student-search">Search</label>
            <input
              id="attendance-student-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by student name or roll number"
            />
          </div>
        </div>

        <div className="attendance-table-container">
          <div className="attendance-table-header">
            <h3>Student Attendance</h3>
            <p>Attendance is calculated from sessions submitted by faculty.</p>
          </div>
          <div className="attendance-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Name</th>
                  <th>Section</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Attendance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8">Loading department attendance...</td></tr>
                ) : error ? (
                  <tr><td colSpan="8">Attendance could not be loaded.</td></tr>
                ) : filteredStudents.length ? filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td><strong>{student.rollNumber}</strong></td>
                    <td>{student.name}</td>
                    <td>{student.section || "Unassigned"}</td>
                    <td>{student.present}</td>
                    <td>{student.absent}</td>
                    <td>{student.late}</td>
                    <td>
                      {student.percentage == null ? (
                        "No records"
                      ) : (
                        <div className="attendance-value">
                          <div className="attendance-progress">
                            <div
                              className={`progress ${student.percentage < 65 ? "critical" : student.percentage < 75 ? "low" : "good"}`}
                              style={{ width: `${student.percentage}%` }}
                            />
                          </div>
                          <span>{student.percentage}%</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`attendance-status ${student.status.toLowerCase().replace(/\s+/g, "-")}`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="8">No students or attendance records match these filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </HODLayout>
  );
}

export default AttendanceMonitoring;
