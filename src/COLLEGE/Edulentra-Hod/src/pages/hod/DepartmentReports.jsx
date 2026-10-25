import { useEffect, useMemo, useState } from "react";
import { hodReportsApi } from "../../../../../api/hodReportsApi";
import HODLayout from "../../components/hod/HODLayout";
import "../../styles/hod/DepartmentReports.css";

const reports = [
  {
    id: "attendance",
    title: "Student Attendance Report",
    type: "Attendance",
    description: "Per-student attendance totals and percentages.",
  },
  {
    id: "students",
    title: "Department Student Directory",
    type: "Students",
    description: "Active students, sections, and entry types.",
  },
  {
    id: "faculty",
    title: "Department Faculty Directory",
    type: "Faculty",
    description: "Active faculty and their assigned subjects.",
  },
  {
    id: "department",
    title: "Department Summary",
    type: "Department",
    description: "Current student, faculty, and attendance totals.",
  },
];

const escapeCsvCell = (value) => {
  const text = String(value ?? "");
  const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
};

const rowsForReport = (reportId, data) => {
  if (reportId === "attendance") {
    return [
      ["Department", data.department],
      [],
      ["Roll Number", "Student Name", "Section", "Present", "Absent", "Late", "Total", "Attendance %"],
      ...data.students.map((student) => [
        student.rollNumber,
        student.name,
        student.section,
        student.present,
        student.absent,
        student.late,
        student.total,
        student.attendancePercentage ?? "No data",
      ]),
    ];
  }
  if (reportId === "students") {
    return [
      ["Department", data.department],
      [],
      ["Roll Number", "Student Name", "Section", "Entry Type"],
      ...data.students.map((student) => [
        student.rollNumber,
        student.name,
        student.section,
        student.entryType,
      ]),
    ];
  }
  if (reportId === "faculty") {
    return [
      ["Department", data.department],
      [],
      ["Faculty ID", "Faculty Name", "Subject", "Department"],
      ...data.faculty.map((member) => [
        member.facultyId,
        member.name,
        member.subject,
        member.department,
      ]),
    ];
  }
  return [
    ["Metric", "Value"],
    ["Department", data.department],
    ["Active students", data.summary.studentCount],
    ["Active faculty", data.summary.facultyCount],
    ["Attendance records", data.summary.attendanceRecords],
    ["Average attendance", data.summary.attendancePercentage == null
      ? "No attendance data"
      : `${data.summary.attendancePercentage}%`],
    ["Generated at", data.generatedAt],
  ];
};

const downloadCsv = (reportId, rows) => {
  const csv = rows
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `department-${reportId}-report.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

function DepartmentReports() {
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [generatingReportId, setGeneratingReportId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    hodReportsApi.get()
      .then((data) => {
        if (!cancelled) {
          setReportData(data);
          setError("");
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError.message || "Unable to load department report data.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleReports = useMemo(
    () => reports.filter((report) => reportType === "All" || report.type === reportType),
    [reportType]
  );

  const generateReport = async (reportId) => {
    setGeneratingReportId(reportId);
    setError("");
    setMessage("");
    try {
      const data = await hodReportsApi.get();
      setReportData(data);
      const report = reports.find((item) => item.id === reportId);
      downloadCsv(reportId, rowsForReport(reportId, data));
      setMessage(`${report.title} downloaded.`);
    } catch (generateError) {
      setError(generateError.message || "Unable to generate this report.");
    } finally {
      setGeneratingReportId("");
    }
  };

  return (
    <HODLayout>
      <div className="department-reports">
        <div className="reports-page-header">
          <div>
            <h2>Department Reports</h2>
            <p>
              {reportData
                ? `Live reports for ${reportData.department}. Reports include only data currently recorded in EduLentra.`
                : "Live department statistics and downloadable reports."}
            </p>
          </div>
          <label>
            <span className="sr-only">Report type</span>
            <select
              aria-label="Report type"
              value={reportType}
              onChange={(event) => setReportType(event.target.value)}
            >
              <option value="All">All report types</option>
              <option value="Attendance">Attendance</option>
              <option value="Students">Students</option>
              <option value="Faculty">Faculty</option>
              <option value="Department">Department</option>
            </select>
          </label>
        </div>

        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}

        <div className="reports-summary">
          <div className="reports-summary-card">
            <span>Available Reports</span>
            <strong>{reports.length}</strong>
          </div>
          <div className="reports-summary-card">
            <span>Active Students</span>
            <strong>{isLoading ? "—" : reportData?.summary.studentCount ?? "—"}</strong>
          </div>
          <div className="reports-summary-card">
            <span>Active Faculty</span>
            <strong>{isLoading ? "—" : reportData?.summary.facultyCount ?? "—"}</strong>
          </div>
          <div className="reports-summary-card">
            <span>Attendance Records</span>
            <strong>{isLoading ? "—" : reportData?.summary.attendanceRecords ?? "—"}</strong>
          </div>
        </div>

        <div className="report-statistics">
          <div className="report-stat-card">
            <div className="report-stat-icon">👨‍🎓</div>
            <div>
              <span>Department Students</span>
              <strong>{isLoading ? "—" : reportData?.summary.studentCount ?? "—"}</strong>
              <small>Active accounts</small>
            </div>
          </div>
          <div className="report-stat-card">
            <div className="report-stat-icon">📊</div>
            <div>
              <span>Average Attendance</span>
              <strong>
                {isLoading
                  ? "—"
                  : reportData?.summary.attendancePercentage == null
                    ? "No data"
                    : `${reportData.summary.attendancePercentage}%`}
              </strong>
              <small>{reportData?.summary.attendanceRecords || 0} submitted records</small>
            </div>
          </div>
          <div className="report-stat-card">
            <div className="report-stat-icon">👨‍🏫</div>
            <div>
              <span>Department Faculty</span>
              <strong>{isLoading ? "—" : reportData?.summary.facultyCount ?? "—"}</strong>
              <small>Active accounts</small>
            </div>
          </div>
          <div className="report-stat-card">
            <div className="report-stat-icon">📄</div>
            <div>
              <span>Academic Grades</span>
              <strong>Not available</strong>
              <small>No department-linked grade data is recorded</small>
            </div>
          </div>
        </div>

        <div className="reports-table-container">
          <div className="reports-table-header">
            <div>
              <h3>Available Reports</h3>
              <p>Generate a fresh CSV from current department records.</p>
            </div>
          </div>

          <div className="reports-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Type</th>
                  <th>Contents</th>
                  <th>Generated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleReports.map((report) => (
                  <tr key={report.id}>
                    <td><strong>{report.title}</strong></td>
                    <td>{report.type}</td>
                    <td>{report.description}</td>
                    <td>{reportData?.generatedAt
                      ? new Date(reportData.generatedAt).toLocaleString()
                      : "—"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="download-report-btn"
                        onClick={() => generateReport(report.id)}
                        disabled={isLoading || Boolean(generatingReportId)}
                      >
                        {generatingReportId === report.id
                          ? "Generating..."
                          : "↓ Generate & Download"}
                      </button>
                    </td>
                  </tr>
                ))}
                {!isLoading && visibleReports.length === 0 && (
                  <tr><td colSpan="5">No report type matches this filter.</td></tr>
                )}
                {isLoading && (
                  <tr><td colSpan="5">Loading live department report data...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </HODLayout>
  );
}

export default DepartmentReports;
