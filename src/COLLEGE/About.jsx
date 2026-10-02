import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./About.css";

function About() {
    const navigate = useNavigate();

    return (
        <div>

            {/* TOP BAR */}
            <div className="about-top-bar">

                {/* LEFT LOGO */}
                <h1 className="about-logo">
                    EduLentra
                </h1>

                {/* RIGHT SIDE */}
                <div className="about-nav">

                    {/* BACK BUTTON */}
                    <button
                        className="about-back-btn"
                        onClick={() => navigate("/")}
                    >
                        ← Back
                    </button>

                    {/* LOGIN DROPDOWN */}
                    <div className="about-login-dropdown">

                        <span className="about-login-link">
                            Login ▾
                        </span>

                        <div className="about-login-menu">

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

                </div>

            </div>

            {/* ABOUT CONTENT */}
            <section id="about" className="about-section">

                <h2>About EduLentra</h2>

                <p className="about-intro">
                    EduLentra is a smart digital campus platform designed to bring students,
                    faculty, departments, and administration together in one connected ecosystem.
                    It simplifies communication, learning, and campus management through technology.
                </p>

                <div className="slider">

                    <div className="about-cards">

                        <div className="about-card">
                            <h3>🎓 Smart Learning</h3>
                            <p>
                                EduLentra provides a centralized learning environment where students
                                can access notes, assignments, study materials, and academic resources
                                anytime from anywhere.
                            </p>
                        </div>

                        <div className="about-card">
                            <h3>📢 Digital Communication</h3>
                            <p>
                                Important announcements, notices, events, and opportunities are
                                delivered through a single platform, reducing information gaps.
                            </p>
                        </div>

                        <div className="about-card">
                            <h3>🏫 Campus Management</h3>
                            <p>
                                The platform connects different departments, faculty members,
                                and students to make daily college operations faster and organized.
                            </p>
                        </div>

                        <div className="about-card">
                            <h3>🚀 Student Growth</h3>
                            <p>
                                Students can discover events, internships, achievements, clubs,
                                and career opportunities that support their overall development.
                            </p>
                        </div>

                        <div className="about-card">
                            <h3>🔐 Secure Platform</h3>
                            <p>
                                Role-based access ensures that students, faculty, and administrators
                                get personalized features according to their responsibilities.
                            </p>
                        </div>

                        <div className="about-card">
                            <h3>🌐 Digital Future</h3>
                            <p>
                                EduLentra aims to transform traditional campuses into intelligent,
                                connected, and technology-driven learning environments.
                            </p>
                        </div>

                        {/* DUPLICATE CARDS FOR CONTINUOUS SLIDER */}

                        <div className="about-card">
                            <h3>🎓 Smart Learning</h3>
                            <p>
                                EduLentra provides a centralized learning environment where students
                                can access notes, assignments, study materials, and academic resources
                                anytime from anywhere.
                            </p>
                        </div>

                        <div className="about-card">
                            <h3>📢 Digital Communication</h3>
                            <p>
                                Important announcements, notices, events, and opportunities are
                                delivered through a single platform, reducing information gaps.
                            </p>
                        </div>

                        <div className="about-card">
                            <h3>🏫 Campus Management</h3>
                            <p>
                                The platform connects different departments, faculty members,
                                and students to make daily college operations faster and organized.
                            </p>
                        </div>

                        <div className="about-card">
                            <h3>🚀 Student Growth</h3>
                            <p>
                                Students can discover events, internships, achievements, clubs,
                                and career opportunities that support their overall development.
                            </p>
                        </div>

                        <div className="about-card">
                            <h3>🔐 Secure Platform</h3>
                            <p>
                                Role-based access ensures that students, faculty, and administrators
                                get personalized features according to their responsibilities.
                            </p>
                        </div>

                        <div className="about-card">
                            <h3>🌐 Digital Future</h3>
                            <p>
                                EduLentra aims to transform traditional campuses into intelligent,
                                connected, and technology-driven learning environments.
                            </p>
                        </div>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default About;