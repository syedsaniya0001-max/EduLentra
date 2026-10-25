import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hodDashboardApi } from "../../../../../api/hodDashboardApi";
import { getAuthUser } from "../../../../../api/authSession";
import HODLayout from "../../components/hod/HODLayout";
import "../../styles/hod/HODDashboard.css";

const timeAgo = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

function HODDashboard() {
  const navigate = useNavigate();
  const hod = getAuthUser();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    hodDashboardApi.get()
      .then((data) => {
        if (!cancelled) {
          setDashboard(data);
          setError("");
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message || "Unable to load department dashboard.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const statistics = dashboard?.statistics;

  return (
    <HODLayout>
      <div className="hod-dashboard">
        <div className="dashboard-welcome">
          <div>
            <h2>Welcome back, {hod?.name || hod?.username || "HOD"} 👋</h2>
            <p>
              {dashboard?.department
                ? `${dashboard.department} department overview`
                : "Here's what's happening in your department today."}
            </p>
          </div>
          <div className="dashboard-date" aria-label="Current date">
            📅 {new Date().toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>

        {error && (
          <div role="alert" style={{ marginBottom: "16px", color: "#b91c1c" }}>
            {error}
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setError("");
                hodDashboardApi.get()
                  .then(setDashboard)
                  .catch((requestError) => setError(requestError.message || "Unable to load department dashboard."))
                  .finally(() => setIsLoading(false));
              }}
              style={{ marginLeft: "12px" }}
            >
              Retry
            </button>
          </div>
        )}

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">👨‍🎓</div>
            <div>
              <span>Total Students</span>
              <h3>{isLoading ? "…" : statistics?.studentCount ?? 0}</h3>
              <small>Active department students</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👨‍🏫</div>
            <div>
              <span>Total Faculty</span>
              <h3>{isLoading ? "…" : statistics?.facultyCount ?? 0}</h3>
              <small>Active department faculty</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div>
              <span>Attendance</span>
              <h3>
                {isLoading
                  ? "…"
                  : statistics?.attendancePercentage == null
                    ? "—"
                    : `${statistics.attendancePercentage}%`}
              </h3>
              <small>
                {statistics?.attendancePercentage == null && !isLoading
                  ? "No attendance records"
                  : "Across department attendance records"}
              </small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div>
              <span>Pending Items</span>
              <h3>{isLoading ? "…" : statistics?.pendingRequests ?? 0}</h3>
              <small>Requests, complaints and suggestions</small>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <h3>Recent Activities</h3>
                <p>Latest activity in your department</p>
              </div>
              <button type="button" onClick={() => navigate("/hod/complaints")}>
                View complaints
              </button>
            </div>

            <div className="activity-list">
              {isLoading ? (
                <p>Loading department activity...</p>
              ) : dashboard?.recentActivities?.length ? (
                dashboard.recentActivities.map((activity) => (
                  <div className="activity-item" key={activity.id}>
                    <div className="activity-icon">{activity.icon}</div>
                    <div>
                      <strong>{activity.title}</strong>
                      <span>{activity.description}</span>
                    </div>
                    <small>{timeAgo(activity.createdAt)}</small>
                  </div>
                ))
              ) : (
                <p>No recent department activity.</p>
              )}
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <h3>Quick Actions</h3>
                <p>Open a department workspace</p>
              </div>
            </div>

            <div className="quick-actions">
              <button type="button" className="quick-action" onClick={() => navigate("/hod/students")}>
                <span>👨‍🎓</span>
                <div><strong>Manage Students</strong><small>View department student records</small></div>
              </button>
              <button type="button" className="quick-action" onClick={() => navigate("/hod/faculty")}>
                <span>👨‍🏫</span>
                <div><strong>Manage Faculty</strong><small>View department faculty records</small></div>
              </button>
              <button type="button" className="quick-action" onClick={() => navigate("/hod/complaints")}>
                <span>💬</span>
                <div><strong>Review Complaints</strong><small>Respond to student concerns</small></div>
              </button>
              <button type="button" className="quick-action" onClick={() => navigate("/hod/suggestions")}>
                <span>💡</span>
                <div><strong>Review Suggestions</strong><small>Consider student ideas</small></div>
              </button>
              <button type="button" className="quick-action" onClick={() => navigate("/hod/announcements")}>
                <span>📢</span>
                <div><strong>Announcements</strong><small>Publish department notices</small></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </HODLayout>
  );
}

export default HODDashboard;
