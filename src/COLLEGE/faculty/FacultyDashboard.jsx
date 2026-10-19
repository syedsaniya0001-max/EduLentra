import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { facultyApi } from "../../api/facultyApi";
import "./components/FacultyStyles.css";
import PortalBackButton from "../PortalBackButton";

import FacultyOverview from "./components/FacultyOverview";
import StudentList from "./components/StudentList";
import StudentSignupApprovals from "./components/StudentSignupApprovals";
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
  const [hasTabHistory, setHasTabHistory] = useState(false);
  const tabHistory = useRef([]);

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
    if (tabId !== activeTab) {
      tabHistory.current.push(activeTab);
      setHasTabHistory(true);
    }
    setActiveTab(tabId);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTabBack = () => {
    const previousTab = tabHistory.current.pop() || "overview";
    setHasTabHistory(tabHistory.current.length > 0);
    setActiveTab(previousTab);
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
    { id: "overview", label: "Dashboard Home", icon: "🏠" },
    { id: "students", label: "Student List", icon: "👥" },
    {
  id: "student-approvals",
  label: "Student Signup Approvals",
  icon: "✅"
},
    { id: "attendance", label: "Attendance", icon: "📅" },
    { id: "notes", label: "Notes & Materials", icon: "📚" },
    { id: "assignments", label: "Assignments", icon: "📝" },
    { id: "announcements", label: "Announcements", icon: "📢" },
    { id: "outpass", label: "Outpass Approvals", icon: "🎫", badge: pendingOutpasses },
    { id: "profile", label: "Faculty Profile", icon: "👤" }
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
        <div className="fac-sidebar-profile">
          <img
            src={faculty?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
            alt=""
            className="fac-user-avatar"
          />
          <div className="fac-profile-info">
            <h3>{faculty?.name || "Dr. Faculty"}</h3>
            <p>{faculty?.department || "CSE Department"}</p>
          </div>
        </div>

        <div className="fac-sidebar-nav">
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
          <button className="fac-nav-item fac-logout-btn" onClick={handleSignout}>
            <span className="fac-nav-icon">↪</span>
            <span>Log Out</span>
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
          <PortalBackButton
            show={activeTab !== "overview" || hasTabHistory}
            onBack={handleTabBack}
          />
          {activeTab === "overview" && (
            <FacultyOverview faculty={faculty} onNavigate={handleTabChange} />
          )}

          {activeTab === "students" && <StudentList />}
          {activeTab === "student-approvals" && <StudentSignupApprovals />}

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
