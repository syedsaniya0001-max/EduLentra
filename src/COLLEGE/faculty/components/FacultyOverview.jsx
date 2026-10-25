import React, { useEffect, useState } from "react";
import { facultyApi } from "../../../api/facultyApi";

export default function FacultyOverview({ faculty, onNavigate }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    facultyApi.getDashboard()
      .then((data) => {
        if (!cancelled) setDashboardData(data);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError.message || "Unable to load faculty dashboard.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = dashboardData?.stats;

  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
  const schedule = (dashboardData?.timetable || [])
    .filter((entry) => entry.day === weekday)
    .sort((first, second) => first.startTime.localeCompare(second.startTime));
  const activities = dashboardData?.recentActivities || [];

  return (
    <div className="fac-overview-container">
      {error && <p role="alert">{error}</p>}
      {/* Banner */}
      <div className="fac-overview-banner">
        <div>
          <span className="fac-session-badge">
            Academic Session 2026 - Odd Semester
          </span>
          <h2 className="fac-overview-title">
            Welcome back, {faculty?.name || faculty?.username || "Faculty"}! 🎓
          </h2>
          <p className="fac-overview-subtitle">
            {faculty?.department || "Department not provided"}{faculty?.designation ? ` | ${faculty.designation}` : ""}
          </p>
        </div>

        <div className="fac-overview-actions">
          <button
            onClick={() => onNavigate("attendance")}
            className="fac-overview-button"
          >
            📅 Mark Attendance
          </button>
          <button
            onClick={() => onNavigate("outpass")}
            className={`fac-overview-button ${stats?.pendingOutpasses > 0 ? "has-pending" : ""}`}
          >
            🎫 Outpasses ({stats?.pendingOutpasses ?? (loading ? "Loading..." : "Unavailable")} Pending)
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="fac-stats-grid">
        <button type="button" className="fac-stat-card" onClick={() => onNavigate("students")} style={{ cursor: "pointer", textAlign: "left" }}>
          <div className="fac-stat-icon-wrapper fac-stat-icon-blue">👥</div>
          <div>
          <div className="fac-stat-value">{stats?.totalStudents ?? (loading ? "Loading..." : "Unavailable")}</div>
            <div className="fac-stat-label">Students Enrolled</div>
          </div>
        </button>

        <button type="button" className="fac-stat-card" onClick={() => onNavigate("attendance")} style={{ cursor: "pointer", textAlign: "left" }}>
          <div className="fac-stat-icon-wrapper fac-stat-icon-green">📊</div>
          <div>
          <div className="fac-stat-value">
            {stats?.avgAttendance == null
              ? (loading ? "Loading..." : "No records")
              : `${stats.avgAttendance}%`}
          </div>
          <div className="fac-stat-label">Avg Attendance</div>
        </div>
        </button>

        <button type="button" className="fac-stat-card" onClick={() => onNavigate("outpass")} style={{ cursor: "pointer", textAlign: "left" }}>
        <div className="fac-stat-icon-wrapper fac-stat-icon-amber">🎫</div>
        <div>
          <div className="fac-stat-value" style={{ color: stats?.pendingOutpasses > 0 ? "#b45309" : "inherit" }}>
            {stats?.pendingOutpasses ?? (loading ? "Loading..." : "Unavailable")}
          </div>
          <div className="fac-stat-label">Pending Outpass</div>
        </div>
        </button>

        <button type="button" className="fac-stat-card" onClick={() => onNavigate("assignments")} style={{ cursor: "pointer", textAlign: "left" }}>
        <div className="fac-stat-icon-wrapper fac-stat-icon-purple">📝</div>
        <div>
          <div className="fac-stat-value">{stats?.activeAssignments ?? (loading ? "Loading..." : "Unavailable")}</div>
          <div className="fac-stat-label">Active Assignments</div>
        </div>
        </button>

        <button type="button" className="fac-stat-card" onClick={() => onNavigate("notes")} style={{ cursor: "pointer", textAlign: "left" }}>
        <div className="fac-stat-icon-wrapper fac-stat-icon-blue">📚</div>
        <div>
          <div className="fac-stat-value">{stats?.totalNotes ?? (loading ? "Loading..." : "Unavailable")}</div>
          <div className="fac-stat-label">Notes & Materials</div>
        </div>
        </button>
      </div>

      {/* Quick Action Shortcuts */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.5px" }}>
          Quick Actions
        </h3>
        <div className="fac-quick-actions-bar">
          <div className="fac-action-pill" onClick={() => onNavigate("attendance")}>
            <span>📅</span> Take Daily Attendance
          </div>
          <div className="fac-action-pill" onClick={() => onNavigate("notes")}>
            <span>📤</span> Upload Lecture Notes
          </div>
          <div className="fac-action-pill" onClick={() => onNavigate("assignments")}>
            <span>➕</span> New Assignment
          </div>
          <div className="fac-action-pill" onClick={() => onNavigate("announcements")}>
            <span>📢</span> Post Notice
          </div>
          <div className="fac-action-pill" onClick={() => onNavigate("students")}>
            <span>🔍</span> Search Student Directory
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="fac-overview-grid">
        {/* Left: Today's Schedule */}
        <div className="fac-card">
          <div className="fac-card-header">
            <h3 className="fac-card-title">
              <span>🕒</span> Today's Teaching Schedule
            </h3>
            {dashboardData?.timetableConfigured && (
              <span className="fac-badge fac-badge-blue">
                {schedule.length} {schedule.length === 1 ? "Class" : "Classes"} Today
              </span>
            )}
            <button
              className="fac-btn secondary"
              onClick={() => onNavigate("timetable")}
              type="button"
            >
              Manage timetable
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {!loading && !error && !dashboardData?.timetableConfigured && (
              <p role="status">
                Add your recurring weekly classes to configure your timetable.
              </p>
            )}
            {!loading && !error && dashboardData?.timetableConfigured && !schedule.length && (
              <p role="status">No classes are scheduled for today.</p>
            )}
            {schedule.map((item) => (
              <div
                key={item._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px",
                  borderRadius: "10px",
                  background: "#ffffff",
                  border: "1px solid var(--fac-border)",
                  borderLeft: "4px solid #2563eb"
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#2563eb" }}>
                    {item.startTime}–{item.endTime}
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#172033", marginTop: "3px" }}>
                    {item.subject}
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                    {item.branch} · Section {item.section}
                    {item.room ? <> · <span style={{ fontWeight: 600 }}>{item.room}</span></> : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Activity Feed */}
        <div className="fac-card">
          <div className="fac-card-header">
            <h3 className="fac-card-title">
              <span>⚡</span> Recent System Activity
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {!loading && !error && !activities.length && (
              <p role="status">No recent activity is available.</p>
            )}
            {activities.map((act) => (
              <div key={act.id} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background:
                      act.type === "outpass"
                        ? "#fef3c7"
                        : act.type === "assignment"
                        ? "#f3e8ff"
                        : act.type === "announcement"
                        ? "#dbeafe"
                        : "#dcfce7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    flexShrink: 0
                  }}
                >
                  {act.type === "outpass"
                    ? "🎫"
                    : act.type === "assignment"
                    ? "📝"
                    : act.type === "announcement"
                    ? "📢"
                    : "📅"}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#172033", lineHeight: 1.5 }}>
                    {act.text}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
