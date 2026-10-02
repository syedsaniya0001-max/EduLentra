import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Homepage from "./Homepage";
import About from "./About";

import HighlightsPage from "./HighlightsPage";
import GalleryPage from "./GalleryPage";
import GalleryDetailPage from "./GalleryDetailPage";
import ContactPage from "./ContactPage";

import StudentLogin from "./StudentLogin";
import StudentSignup from "./StudentSignup";
import Faculty from "./Faculty";
import Admin from "./Admin";
import HOD from "./HOD";

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

        {/* Individual Portals */}
        <Route path="/student" element={<StudentLogin />} />
        <Route path="/student-signup" element={<StudentSignup />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/hod" element={<HOD />} />

      </Routes>
    </Router>
  );
}

export default Mainc;