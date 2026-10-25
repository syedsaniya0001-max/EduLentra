import { useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthUser } from "../../../../../api/authSession";
import "../../styles/hod/HODHeader.css";

function HODHeader() {
  const navigate = useNavigate();
  const hod = getAuthUser();

  return (
    <header className="hod-header">

      <div className="header-left">
        <div>
          <h1>HOD Portal</h1>
          <p>{hod?.department || "Head of Department"}</p>
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
        <button
          className="header-icon-button"
          aria-label="Log out"
          title="Log out"
          onClick={() => {
            clearAuthSession();
            navigate("/hod", { replace: true });
          }}
        >
          ↪
        </button>

        <button
          className="header-icon-button"
          aria-label="Notifications"
          title="Notifications"
          onClick={() => navigate("/hod/notifications")}
        >
          🔔
        </button>

        {/* Profile */}
        <button
          className="header-profile"
          onClick={() => navigate("/hod-profile")}
        >
          <div className="header-avatar">
            {(hod?.name || hod?.username || "H").charAt(0).toUpperCase()}
          </div>

          <div className="header-profile-info">
            <strong>{hod?.name || hod?.username || "HOD"}</strong>
            <span>Head of Department</span>
          </div>

          <span className="profile-arrow">⌄</span>
        </button>

      </div>

    </header>
  );
}

export default HODHeader;