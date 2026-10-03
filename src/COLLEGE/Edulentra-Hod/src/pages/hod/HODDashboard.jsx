import HODLayout from "../../components/hod/HODLayout";
import "../../styles/hod/HODDashboard.css";

function HODDashboard() {
  return (
    <HODLayout>

      <div className="hod-dashboard">

        {/* Welcome Section */}
        <div className="dashboard-welcome">
          <div>
            <h2>Welcome back, HOD 👋</h2>
            <p>
              Here's what's happening in your department today.
            </p>
          </div>

          <button className="dashboard-date">
            📅 Today
          </button>
        </div>

        {/* Statistics */}
        <div className="dashboard-stats">

          <div className="stat-card">
            <div className="stat-icon">👨‍🎓</div>
            <div>
              <span>Total Students</span>
              <h3>420</h3>
              <small>Active students</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👨‍🏫</div>
            <div>
              <span>Total Faculty</span>
              <h3>32</h3>
              <small>Department faculty</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div>
              <span>Attendance</span>
              <h3>86.5%</h3>
              <small>Overall attendance</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div>
              <span>Pending Requests</span>
              <h3>12</h3>
              <small>Need your attention</small>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="dashboard-grid">

          {/* Recent Activities */}
          <div className="dashboard-panel">

            <div className="panel-header">
              <div>
                <h3>Recent Activities</h3>
                <p>Latest department activities</p>
              </div>

              <button>View All</button>
            </div>

            <div className="activity-list">

              <div className="activity-item">
                <div className="activity-icon">👨‍🎓</div>
                <div>
                  <strong>New student registered</strong>
                  <span>Rahul Kumar joined CSE-AI</span>
                </div>
                <small>10 min ago</small>
              </div>

              <div className="activity-item">
                <div className="activity-icon">📄</div>
                <div>
                  <strong>Faculty approval request</strong>
                  <span>New faculty request received</span>
                </div>
                <small>30 min ago</small>
              </div>

              <div className="activity-item">
                <div className="activity-icon">🎫</div>
                <div>
                  <strong>Outpass request</strong>
                  <span>Student requested an outpass</span>
                </div>
                <small>1 hour ago</small>
              </div>

              <div className="activity-item">
                <div className="activity-icon">📢</div>
                <div>
                  <strong>Announcement published</strong>
                  <span>Internal assessment schedule</span>
                </div>
                <small>2 hours ago</small>
              </div>

            </div>

          </div>

          {/* Quick Actions */}
          <div className="dashboard-panel">

            <div className="panel-header">
              <div>
                <h3>Quick Actions</h3>
                <p>Frequently used actions</p>
              </div>
            </div>

            <div className="quick-actions">

              <button className="quick-action">
                <span>👨‍🎓</span>
                <div>
                  <strong>Manage Students</strong>
                  <small>View student records</small>
                </div>
              </button>

              <button className="quick-action">
                <span>👨‍🏫</span>
                <div>
                  <strong>Manage Faculty</strong>
                  <small>View faculty records</small>
                </div>
              </button>

              <button className="quick-action">
                <span>🎫</span>
                <div>
                  <strong>Outpass Requests</strong>
                  <small>Review pending requests</small>
                </div>
              </button>

              <button className="quick-action">
                <span>📢</span>
                <div>
                  <strong>Announcement</strong>
                  <small>Create department notice</small>
                </div>
              </button>

            </div>

          </div>

        </div>

      </div>

    </HODLayout>
  );
}

export default HODDashboard;