import React, { useEffect, useState } from "react";
import { facultyApi } from "../../../api/facultyApi";

export default function FacultyOverview({ faculty, onNavigate }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await facultyApi.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = dashboardData?.stats || {
    totalStudents: 142,
    classesToday: 3,
    pendingOutpasses: 2,
    activeAssignments: 1,
    totalNotes: 3,
    avgAttendance: 87.4
  };

  const schedule = dashboardData?.todaySchedule || [];
  const activities = dashboardData?.recentActivities || [];

  return (
    <div className="fac-overview-container">
      {/* Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
          borderRadius: "16px",
          padding: "24px 28px",
          color: "white",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)"
        }}
      >
        <div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              background: "rgba(255,255,255,0.2)",
              padding: "4px 10px",
              borderRadius: "9999px"
            }}
          >
            Academic Session 2026 - Odd Semester
          </span>
          <h2 style={{ fontSize: "24px", fontWeight: 800, margin: "10px 0 4px 0" }}>
            Welcome back, {faculty?.name || "Professor"}! 🎓
          </h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "14px" }}>
            {faculty?.department || "Department of Computer Science & Engineering"} | {faculty?.designation || "Faculty Advisor"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => onNavigate("attendance")}
            style={{
              background: "white",
              color: "#1e3a8a",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "13.5px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
            }}
          >
            📅 Mark Attendance
          </button>
          <button
            onClick={() => onNavigate("outpass")}
            style={{
              background: stats.pendingOutpasses > 0 ? "#ef4444" : "rgba(255,255,255,0.15)",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "13.5px",
              cursor: "pointer"
            }}
          >
            🎫 Outpasses ({stats.pendingOutpasses} Pending)
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="fac-stats-grid">
        <div className="fac-stat-card" onClick={() => onNavigate("students")} style={{ cursor: "pointer" }}>
          <div className="fac-stat-icon-wrapper fac-stat-icon-blue">👥</div>
          <div>
            <div className="fac-stat-value">{stats.totalStudents}</div>
            <div className="fac-stat-label">Students Enrolled</div>
          </div>
        </div>

        <div className="fac-stat-card" onClick={() => onNavigate("attendance")} style={{ cursor: "pointer" }}>
          <div className="fac-stat-icon-wrapper fac-stat-icon-green">📊</div>
          <div>
            <div className="fac-stat-value">{stats.avgAttendance}%</div>
            <div className="fac-stat-label">Avg Attendance</div>
          </div>
        </div>

        <div className="fac-stat-card" onClick={() => onNavigate("outpass")} style={{ cursor: "pointer" }}>
          <div className="fac-stat-icon-wrapper fac-stat-icon-amber">🎫</div>
          <div>
            <div className="fac-stat-value" style={{ color: stats.pendingOutpasses > 0 ? "#b45309" : "inherit" }}>
              {stats.pendingOutpasses}
            </div>
            <div className="fac-stat-label">Pending Outpass</div>
          </div>
        </div>

        <div className="fac-stat-card" onClick={() => onNavigate("assignments")} style={{ cursor: "pointer" }}>
          <div className="fac-stat-icon-wrapper fac-stat-icon-purple">📝</div>
          <div>
            <div className="fac-stat-value">{stats.activeAssignments}</div>
            <div className="fac-stat-label">Active Assignments</div>
          </div>
        </div>

        <div className="fac-stat-card" onClick={() => onNavigate("notes")} style={{ cursor: "pointer" }}>
          <div className="fac-stat-icon-wrapper fac-stat-icon-blue">📚</div>
          <div>
            <div className="fac-stat-value">{stats.totalNotes}</div>
            <div className="fac-stat-label">Notes & Materials</div>
          </div>
        </div>
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
            <span className="fac-badge fac-badge-blue">3 Lectures Today</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {schedule.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px",
                  borderRadius: "10px",
                  background: item.status === "Completed" ? "#f8fafc" : "#ffffff",
                  border: "1px solid var(--fac-border)",
                  borderLeft: `4px solid ${
                    item.status === "Completed" ? "#10b981" : item.status === "Upcoming" ? "#2563eb" : "#f59e0b"
                  }`
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#2563eb" }}>{item.time}</div>
                  <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#0f172a", marginTop: "3px" }}>
                    {item.subject}
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>
                    {item.class} • <span style={{ fontWeight: 600 }}>{item.room}</span>
                  </div>
                </div>

                <div>
                  {item.attendanceMarked ? (
                    <span className="fac-badge fac-badge-green">✓ Attendance Done</span>
                  ) : (
                    <button
                      onClick={() => onNavigate("attendance")}
                      className="fac-btn primary"
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                    >
                      Take Attendance
                    </button>
                  )}
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
            <span style={{ fontSize: "12px", color: "#64748b" }}>Live</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
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
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", lineHeight: 1.4 }}>
                    {act.text}
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
