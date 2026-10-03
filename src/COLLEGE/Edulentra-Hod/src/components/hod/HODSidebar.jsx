import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/hod/HODSidebar.css";

function HODSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      label: "Home",
      path: "/",
      icon: "⌂",
    },
    {
      label: "Dashboard",
      path: "/hod/dashboard",
      icon: "▦",
    },
    {
      label: "Students",
      path: "/hod/students",
      icon: "👨‍🎓",
    },
    {
      label: "Faculty",
      path: "/hod/faculty",
      icon: "👨‍🏫",
    },
    {
      label: "Attendance",
      path: "/hod/attendance",
      icon: "📊",
    },
    {
      label: "Faculty Approval",
      path: "/hod/faculty-approval",
      icon: "✓",
    },
    {
      label: "Outpass Approval",
      path: "/hod/outpass",
      icon: "📄",
    },
    {
      label: "Complaints",
      path: "/hod/complaints",
      icon: "💬",
    },
    {
      label: "Announcements",
      path: "/hod/announcements",
      icon: "📢",
    },
    {
      label: "Reports",
      path: "/hod/reports",
      icon: "📈",
    },
  ];

  return (
    <aside className="hod-sidebar">

      {/* Brand */}
      <div className="hod-brand">
        <div className="hod-brand-logo">
          E
        </div>

        <div>
          <h2>Edulentra</h2>
          <span>HOD Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="hod-navigation">

        <p className="hod-nav-title">
          MAIN MENU
        </p>

        {menuItems.map((item) => (

          <button
            key={item.path}
            className={`hod-nav-item ${
              location.pathname === item.path ? "active" : ""
            }`}
            onClick={() => navigate(item.path)}
          >

            <span className="hod-nav-icon">
              {item.icon}
            </span>

            <span>
              {item.label}
            </span>

          </button>

        ))}

      </nav>

      {/* Bottom Profile */}
      <div className="hod-sidebar-bottom">

        <button
          className={`hod-profile-link ${
            location.pathname === "/hod-profile" ? "active" : ""
          }`}
          onClick={() => navigate("/hod-profile")}
        >
          <div className="hod-sidebar-avatar">
            H
          </div>

          <div className="hod-sidebar-profile-text">
            <strong>HOD</strong>
            <span>Head of Department</span>
          </div>
        </button>

      </div>

    </aside>
  );
}

export default HODSidebar;