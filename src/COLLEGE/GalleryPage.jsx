import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Gallery from "./Gallery";
import "./GalleryPage.css";

function GalleryPage() {

  const navigate = useNavigate();

  return (
    <div className="gallery-page">

      {/* HEADER */}
      <header className="gallery-header">

        {/* LEFT LOGO */}
        <h1 className="gallery-logo">
          EduLentra
        </h1>

        {/* RIGHT SIDE */}
        <nav className="gallery-nav">

          {/* BACK */}
          <button
            className="gallery-back-btn"
            onClick={() => navigate("/")}
          >
            ← Back
          </button>

          {/* LOGIN */}
          <div className="gallery-login-dropdown">

            <span className="gallery-login-link">
              Login ▾
            </span>

            <div className="gallery-login-menu">

              <Link to="/student">
                🎓 <span>Student</span>
              </Link>

              <Link to="/faculty">
                👨‍🏫 <span>Faculty</span>
              </Link>

              <Link to="/hod">
                🏫 <span>HOD</span>
              </Link>

              <Link to="/admin">
                💻 <span>Admin</span>
              </Link>

            </div>

          </div>

        </nav>

      </header>

      {/* GALLERY */}
      <main>
        <Gallery />
      </main>

    </div>
  );
}

export default GalleryPage;