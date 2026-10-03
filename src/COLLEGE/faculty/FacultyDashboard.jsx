import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { facultyApi } from "../../api/facultyApi";
import "./components/FacultyStyles.css";

import FacultyOverview from "./components/FacultyOverview";
import StudentList from "./components/StudentList";
import AttendanceManagement from "./components/AttendanceManagement";
import NotesManagement from "./components/NotesManagement";
import AssignmentManagement from "./components/AssignmentManagement";
import AnnouncementManagement from "./components/AnnouncementManagement";
import OutpassApproval from "./components/OutpassApproval";
import FacultyProfile from "./components/FacultyProfile";

export default function FacultyDashboard({ initialTab = "overview", onLogout }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [faculty, setFaculty] = useState(facultyApi.getCurrentUser());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingOutpasses, setPendingOutpasses] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    loadProfileAndBadges();
  }, []);

  const loadProfileAndBadges = async () => {
    try {
      const prof = await facultyApi.getProfile();
      setFaculty(prof);

      const outpasses = await facultyApi.getOutpasses();
      const pending = (outpasses || []).filter((o) => o.status === "Pending").length;
      setPendingOutpasses(pending);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignout = () => {
    facultyApi.logout();
    if (onLogout) {
      onLogout();
    } else {
      navigate("/role");
    }
  };

  const navItems = [
    { id: "overview", label: "Dashboard Home", icon: "🏠", category: "Core" },
    { id: "students", label: "Student List", icon: "👥", category: "Academics" },
    { id: "attendance", label: "Attendance", icon: "📅", category: "Academics" },
    { id: "notes", label: "Notes & Materials", icon: "📚", category: "Academics" },
    { id: "assignments", label: "Assignments", icon: "📝", category: "Academics" },
    { id: "announcements", label: "Announcements", icon: "📢", category: "Campus" },
    { id: "outpass", label: "Outpass Approvals", icon: "🎫", badge: pendingOutpasses, category: "Campus" },
    { id: "profile", label: "Faculty Profile", icon: "👤", category: "Settings" }
  ];

  return (
    <div className="faculty-dashboard-layout">
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 45
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fac-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="fac-sidebar-brand">
          <div className="fac-brand-title">
            <span>🎓</span> EduLentra
          </div>
          <span className="fac-brand-badge">Faculty</span>
        </div>

        <div className="fac-sidebar-nav">
          <div className="fac-nav-category">Portal Navigation</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`fac-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => handleTabChange(item.id)}
            >
              <span className="fac-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && <span className="fac-nav-count">{item.badge}</span>}
            </button>
          ))}
        </div>

        <div className="fac-sidebar-footer">
          <div className="fac-user-snippet" onClick={() => handleTabChange("profile")} style={{ cursor: "pointer" }}>
            <img
              src={faculty?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt="Avatar"
              className="fac-user-avatar"
            />
            <div className="fac-user-info">
              <div className="fac-user-name">{faculty?.name || "Dr. Faculty"}</div>
              <div className="fac-user-dept">{faculty?.department || "CSE Department"}</div>
            </div>
          </div>

          <button className="fac-logout-btn" onClick={handleSignout}>
            <span>🚪</span> Sign Out Portal
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="fac-main-area">
        {/* Top Navigation Bar */}
        <header className="fac-topbar">
          <div className="fac-topbar-left">
            <button className="fac-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <div>
              <h1 className="fac-page-heading">
                {navItems.find((n) => n.id === activeTab)?.label || "Faculty Dashboard"}
              </h1>
              <p className="fac-page-subheading">
                EduLentra Integrated College Portal • Academic Session 2026
              </p>
            </div>
          </div>

          <div className="fac-topbar-right">
            <Link to="/role" className="fac-top-action-btn">
              <span>🔄</span> Switch Role
            </Link>

            <Link to="/" className="fac-top-action-btn">
              <span>🏠</span> College Home
            </Link>
          </div>
        </header>

        {/* Dynamic Content View */}
        <main className="fac-content">
          {activeTab === "overview" && (
            <FacultyOverview faculty={faculty} onNavigate={handleTabChange} />
          )}

          {activeTab === "students" && <StudentList />}

          {activeTab === "attendance" && <AttendanceManagement />}

          {activeTab === "notes" && <NotesManagement />}

          {activeTab === "assignments" && <AssignmentManagement />}

          {activeTab === "announcements" && <AnnouncementManagement faculty={faculty} />}

          {activeTab === "outpass" && <OutpassApproval />}

          {activeTab === "profile" && (
            <FacultyProfile faculty={faculty} onUpdateFaculty={(updated) => setFaculty(updated)} />
          )}
        </main>
      </div>
    </div>
  );
}
