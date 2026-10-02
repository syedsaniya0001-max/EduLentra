import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Highlights from "./Highlights";
import "./HighlightsPage.css";

function HighlightsPage() {
    const navigate = useNavigate();

    return (
        <div className="highlights-page">

            {/* HEADER */}
            <header className="highlights-header">

                <h1 className="highlights-logo">
                    EduLentra
                </h1>

                <nav className="highlights-nav">

                    {/* BACK */}
                    <button
                        className="back-btn"
                        onClick={() => navigate("/")}
                    >
                        ← Back
                    </button>

                    {/* LOGIN */}
                    <div className="page-login-dropdown">

                        <span className="page-login-link">
                            Login ▾
                        </span>

                        <div className="page-login-menu">

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

            {/* HIGHLIGHTS */}
            <main>
                <Highlights />
            </main>

        </div>
    );
}

export default HighlightsPage;