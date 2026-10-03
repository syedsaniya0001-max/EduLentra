import { useNavigate } from "react-router-dom";
import "../../styles/hod/HODHeader.css";

function HODHeader() {
  const navigate = useNavigate();

  return (
    <header className="hod-header">

      <div className="header-left">
        <div>
          <h1>HOD Portal</h1>
          <p>Department of CSE - Artificial Intelligence</p>
        </div>
      </div>

      <div className="header-right">
        <button
          className="header-icon-button"
          aria-label="Home"
          title="Home"
          onClick={() => navigate("/")}
        >
          ⌂
        </button>

        {/* Notification */}
        <button className="header-icon-button">
          🔔
          <span className="notification-dot"></span>
        </button>

        {/* Profile */}
        <button
          className="header-profile"
          onClick={() => navigate("/hod-profile")}
        >
          <div className="header-avatar">
            H
          </div>

          <div className="header-profile-info">
            <strong>HOD</strong>
            <span>Head of Department</span>
          </div>

          <span className="profile-arrow">⌄</span>
        </button>

      </div>

    </header>
  );
}

export default HODHeader;