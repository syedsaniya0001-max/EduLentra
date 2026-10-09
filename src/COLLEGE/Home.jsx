import React from "react";
import "./Home.css";
import homeimg from "../assets/home_back.png";
import { Link } from "react-router-dom";

function Home() {

    const homeStyle = {
        margin: "0",
        padding: "0",
        fontFamily: "Arial, sans-serif",
        width: "100%",
        minHeight: "100vh",
    };

    const headerStyle = {
    backgroundColor: "white",
    padding: "6px 20px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "fixed",
    top: "0",
    left: "0",
    zIndex: "10",
    width: "100%",
    height: "70px",
    boxSizing: "border-box",
    boxShadow: "0 2px 10px rgba(30, 58, 138, 0.08)",
};

    const heading = {
        background: "linear-gradient(to right, #1e3a8a, #2563eb)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",

        fontSize: "45px",
        fontWeight: "bold",

        margin: "0",
    };

    const navbarStyle = {
        display: "flex",
        alignItems: "center",
        gap: "25px",

        fontSize: "24px",
        fontWeight: "bold",
    };

    const linkStyle = {
        textDecoration: "none",
        fontSize: "18px",
        fontWeight: "600",
    };

    const content = {
        width: "100%",
        height: "100vh",

        paddingTop: "80px",

        boxSizing: "border-box",
    };

    return (

        <div
            id="home"
            className="home-container"
            style={homeStyle}
        >

            {/* NAVBAR */}

            <div style={headerStyle}>

                <h1
                    className="heading"
                    style={heading}
                >
                    EduLentra
                </h1>


                <nav
                    className="navbar"
                    style={navbarStyle}
                >

                    <a
                        href="#home"
                        style={linkStyle}
                    >
                        Home
                    </a>


                      <Link to="/about" style={linkStyle}>
    About
</Link>


                   <Link to="/highlights" style={linkStyle}>
    Highlights
</Link>

                 <Link to="/gallery" style={linkStyle}>
    Gallery
</Link>


                  <div className="login-dropdown">

    <a 
        href="#login" 
        style={linkStyle}
        className="login-link"
    >
        Login ▾
    </a>

    <div className="login-menu">

        <Link to="/student" className="login-role">
            🎓 <span>Student</span>
        </Link>

        <Link to="/faculty" className="login-role">
            👨‍🏫 <span>Faculty</span>
        </Link>

        <Link to="/hod" className="login-role">
            🏫 <span>HOD</span>
        </Link>

        <Link to="/admin" className="login-role">
            💻 <span>Admin</span>
        </Link>

    </div>

</div>

<Link to="/contact" style={linkStyle}>
    Contact
</Link>

                    {/* <Link
                        to="/role"
                        className="hero-btn"
                        style={linkStyle}
                    >
                        Get Started
                       </Link> */}

                </nav>

            </div>


            {/* HOME IMAGE / HERO */}

            <div
                className="content"
                style={content}
            >

                <img
                    src={homeimg}
                    alt="EduLentra Education"
                    className="home-image"
                />

            </div>

        </div>
    );
}

export default Home;