import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Homepage from "./Homepage";
import About from "./About";
import Role from "./Role";

import HighlightsPage from "./HighlightsPage";
import GalleryPage from "./GalleryPage";
import GalleryDetailPage from "./GalleryDetailPage";
import ContactPage from "./ContactPage";

import StudentLogin from "./StudentLogin";
import StudentSignup from "./StudentSignup";
import StudentDashboard from "./StudentDashboard";
import Faculty from "./Faculty";
import Admin from "./Admin";
import Hod from "./Hod";
import HODDashboard from "./Edulentra-Hod/src/pages/hod/HODDashboard";
import StudentManagement from "./Edulentra-Hod/src/pages/hod/StudentManagement";
import FacultyManagement from "./Edulentra-Hod/src/pages/hod/FacultyManagement";
import AttendanceMonitoring from "./Edulentra-Hod/src/pages/hod/AttendanceMonitoring";
import FacultyApproval from "./Edulentra-Hod/src/pages/hod/FacultyApproval";
import OutpassApproval from "./Edulentra-Hod/src/pages/hod/OutpassApproval";
import ComplaintManagement from "./Edulentra-Hod/src/pages/hod/ComplaintManagement";
import DepartmentAnnouncements from "./Edulentra-Hod/src/pages/hod/DepartmentAnnouncements";
import DepartmentReports from "./Edulentra-Hod/src/pages/hod/DepartmentReports";
import HODProfile from "./Edulentra-Hod/src/pages/hod/HODProfile";
import { ForgotPassword, ResetPassword } from "./PasswordRecovery";
import ProtectedRoleRoute from "./ProtectedRoleRoute";
import "./role-theme.css";
import { PortalNavigationProvider } from "./PortalBackButton";

function Mainc() {
  return (
    <Router basename="/EduLentra">
      <PortalNavigationProvider>
        <div className="college-app">
          <Routes>

        {/* Main Pages */}
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<About />} />
        <Route path="/highlights" element={<HighlightsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/gallery/:type" element={<GalleryDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/role" element={<Role />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Individual Portals */}
        <Route path="/student" element={<StudentLogin />} />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoleRoute role="student">
              <StudentDashboard />
            </ProtectedRoleRoute>
          }
        />
        <Route path="/student-signup" element={<StudentSignup />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/hod" element={<Hod />} />
        <Route path="/hod/dashboard" element={<ProtectedRoleRoute role="hod"><HODDashboard /></ProtectedRoleRoute>} />
        <Route path="/hod/students" element={<ProtectedRoleRoute role="hod"><StudentManagement /></ProtectedRoleRoute>} />
        <Route path="/hod/faculty" element={<ProtectedRoleRoute role="hod"><FacultyManagement /></ProtectedRoleRoute>} />
        <Route path="/hod/attendance" element={<ProtectedRoleRoute role="hod"><AttendanceMonitoring /></ProtectedRoleRoute>} />
        <Route path="/hod/faculty-approval" element={<ProtectedRoleRoute role="hod"><FacultyApproval /></ProtectedRoleRoute>} />
        <Route path="/hod/outpass" element={<ProtectedRoleRoute role="hod"><OutpassApproval /></ProtectedRoleRoute>} />
        <Route path="/hod/complaints" element={<ProtectedRoleRoute role="hod"><ComplaintManagement /></ProtectedRoleRoute>} />
        <Route path="/hod/announcements" element={<ProtectedRoleRoute role="hod"><DepartmentAnnouncements /></ProtectedRoleRoute>} />
        <Route path="/hod/reports" element={<ProtectedRoleRoute role="hod"><DepartmentReports /></ProtectedRoleRoute>} />
        <Route path="/hod-profile" element={<ProtectedRoleRoute role="hod"><HODProfile /></ProtectedRoleRoute>} />

          </Routes>
        </div>
      </PortalNavigationProvider>
    </Router>
  );
}

export default Mainc;