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
import "./role-theme.css";

function Mainc() {
  return (
    <Router>
      <Routes>

        {/* Main Pages */}
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<About />} />
        <Route path="/highlights" element={<HighlightsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/gallery/:type" element={<GalleryDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/role" element={<Role />} />

        {/* Individual Portals */}
        <Route path="/student" element={<StudentLogin />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-signup" element={<StudentSignup />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/hod" element={<Hod />} />
        <Route path="/hod/dashboard" element={<HODDashboard />} />
        <Route path="/hod/students" element={<StudentManagement />} />
        <Route path="/hod/faculty" element={<FacultyManagement />} />
        <Route path="/hod/attendance" element={<AttendanceMonitoring />} />
        <Route path="/hod/faculty-approval" element={<FacultyApproval />} />
        <Route path="/hod/outpass" element={<OutpassApproval />} />
        <Route path="/hod/complaints" element={<ComplaintManagement />} />
        <Route path="/hod/announcements" element={<DepartmentAnnouncements />} />
        <Route path="/hod/reports" element={<DepartmentReports />} />
        <Route path="/hod-profile" element={<HODProfile />} />

      </Routes>
    </Router>
  );
}

export default Mainc;