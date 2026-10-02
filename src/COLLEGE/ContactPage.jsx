import React from "react";
import { useNavigate } from "react-router-dom";
import Contact from "./Contact";
import "./ContactPage.css";

function ContactPage() {
    const navigate = useNavigate();

    return (
        <div className="contact-page">

            {/* TOP HEADER */}
            <header className="contact-header">

                <h1 className="contact-logo">
                    EduLentra
                </h1>

                <button
                    className="contact-back-btn"
                    onClick={() => navigate("/")}
                >
                    ← Back
                </button>

            </header>

            {/* CONTACT CONTENT */}
            <main>
                <Contact />
            </main>

        </div>
    );
}

export default ContactPage;