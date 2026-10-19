import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/config";
import { storeAuthSession } from "../api/authSession";
import "./StudentLogin.css";
import PortalBackButton from "./PortalBackButton";

import bookCover from "../assets/BOOK-NEW.png";
import goldKey from "../assets/key.png";
import paper from "../assets/paper.png";

function StudentLogin() {
    const navigate = useNavigate();

    /* =========================
       BOOK STATES
    ========================= */

    const [openBook, setOpenBook] = useState(false);
    const [rotateKey, setRotateKey] = useState(false);
    const [showSignup, setShowSignup] = useState(false);


    /* =========================
       LOGIN DATA
    ========================= */

    const [loginData, setLoginData] = useState({
        rollNumber: "",
        password: ""
    });


    /* =========================
       SIGNUP DATA
    ========================= */

    const emptySignupData = {
        name: "",
        rollNumber: "",
        email: "",
        department: "",
        section: "",
        studentType: "",
        password: "",
        confirmPassword: ""
    };

    const [signupData, setSignupData] = useState(emptySignupData);


    /* =========================
       OPEN BOOK
    ========================= */

    const unlockBook = () => {

        if (openBook || rotateKey) {
            return;
        }

        setRotateKey(true);

        setTimeout(() => {
            setOpenBook(true);
        }, 1000);
    };


    /* =========================
       LOGIN CHANGE
    ========================= */

    const handleLoginChange = (e) => {

        const { name, value } = e.target;

        setLoginData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };


    /* =========================
       SIGNUP CHANGE
    ========================= */

    const handleSignupChange = (e) => {

        const { name, value } = e.target;

        setSignupData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };


    /* =========================
       LOGIN
    ========================= */

  const handleLogin = async (e) => {
    e.preventDefault();

    if (
        !loginData.rollNumber.trim() ||
        !loginData.password.trim()
    ) {
        alert("Please enter Roll Number and Password.");
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: loginData.rollNumber.trim(),
                    password: loginData.password,
                    role: "student",
                }),
            }
        );

        const data = await response.json();

        if (!response.ok || !data.token) {
            alert(data.message || "Login failed. Please check your credentials.");
            return;
        }

        storeAuthSession(data, "student");

        alert("Login successful!");
        navigate("/student-dashboard");

    } catch (error) {
        console.error("Student login error:", error);

        alert(
            "Unable to connect to the server. Please make sure the EduLentra backend is running on port 5000."
        );
    }
};


    /* =========================
       SIGNUP
    ========================= */
const handleSignup = async (e) => {
    e.preventDefault();

    // Check empty fields
    if (
        !signupData.name.trim() ||
        !signupData.rollNumber.trim() ||
        !signupData.email.trim() ||
        !signupData.department.trim() ||
        !signupData.section.trim() ||
        !signupData.studentType ||
        !signupData.password ||
        !signupData.confirmPassword
    ) {
        alert("Please fill all the registration fields.");
        return;
    }

    // Check password confirmation
    if (signupData.password !== signupData.confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/students/signup`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: signupData.name.trim(),
                    rollNumber: signupData.rollNumber.trim(),
                    email: signupData.email.trim(),
                    branch: signupData.department.trim(),
                    section: signupData.section.trim(),
                    entryType: signupData.studentType,
                    password: signupData.password,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Registration failed. Please try again.");
            return;
        }

        alert(
            data.message ||
            "Your signup request is pending Faculty approval. After approval, sign in with your roll number and the password you chose."
        );

        // Clear signup details
        setSignupData(emptySignupData);

        // Clear login details
        setLoginData({
            rollNumber: "",
            password: "",
        });

        // Return to login form
        setShowSignup(false);

    } catch (error) {
        console.error("Student signup error:", error);

        alert(
            "Unable to connect to the server. " +
            "Please make sure the EduLentra backend is running on port 5000."
        );
    }
};


    /* =========================
       SHOW SIGNUP
    ========================= */

    const openSignup = () => {

        setSignupData(
            emptySignupData
        );

        setShowSignup(true);
    };


    /* =========================
       SHOW LOGIN
    ========================= */

    const openLogin = () => {

        setSignupData(
            emptySignupData
        );

        setShowSignup(false);
    };


    return (

        <div className="student-login-page">
            {!showSignup && (
                <PortalBackButton role="student" fallbackTo="/role" />
            )}

            {/* =========================
               TITLE
            ========================= */}

            <h1>
                EduLentra Student Portal
            </h1>


            {/* =========================
               BOOK
            ========================= */}

            <div
                className={
                    `student-book ${
                        openBook
                            ? "book-open"
                            : ""
                    }`
                }
            >


                {/* =========================
                   INSIDE PAPER
                ========================= */}

                <div
                    className="student-inside-page"
                    style={{
                        backgroundImage:
                            `url(${paper})`
                    }}
                >


                    {/* =================================================
                       LOGIN
                    ================================================= */}

                    {!showSignup && (

                        <div
                            className="student-form"
                            key="login-form"
                        >

                            <h2>
                                Student Login
                            </h2>


                            <form
                                onSubmit={handleLogin}
                            >

                                {/* ROLL NUMBER */}

                                <input
                                    type="text"
                                    name="rollNumber"
                                    placeholder="Enter Roll Number"
                                    value={
                                        loginData.rollNumber
                                    }
                                    onChange={
                                        handleLoginChange
                                    }
                                    autoComplete="username"
                                />


                                {/* PASSWORD */}

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter Password"
                                    value={
                                        loginData.password
                                    }
                                    onChange={
                                        handleLoginChange
                                    }
                                    autoComplete="current-password"
                                />

                                <Link
                                    className="password-recovery-link"
                                    to="/forgot-password?role=student"
                                >
                                    Forgot Password?
                                </Link>


                                {/* LOGIN BUTTON */}

                                <button
                                    type="submit"
                                >
                                    Login
                                </button>

                            </form>


                            {/* ACCOUNT TEXT */}

                            <p className="student-account-text">
                                Don't have an account?
                            </p>


                            {/* SIGNUP BUTTON */}

                            <button
                                type="button"
                                className="student-secondary-btn"
                                onClick={openSignup}
                            >
                                Sign Up
                            </button>

                        </div>

                    )}


                    {/* =================================================
                       SIGNUP
                    ================================================= */}

                    {showSignup && (

                        <div
                            className="student-form student-signup-form"
                            key="signup-form"
                        >

                            <h2>
                                Student Registration
                            </h2>


                            <form
                                onSubmit={handleSignup}
                            >

                                {/* =========================
                                   NAME
                                ========================= */}

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    value={
                                        signupData.name
                                    }
                                    onChange={
                                        handleSignupChange
                                    }
                                    autoComplete="name"
                                />


                                {/* =========================
                                   ROLL NUMBER
                                ========================= */}

                                <input
                                    type="text"
                                    name="rollNumber"
                                    placeholder="Roll Number"
                                    value={
                                        signupData.rollNumber
                                    }
                                    onChange={
                                        handleSignupChange
                                    }
                                />


                                {/* =========================
                                   EMAIL
                                ========================= */}

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email ID"
                                    value={
                                        signupData.email
                                    }
                                    onChange={
                                        handleSignupChange
                                    }
                                    autoComplete="email"
                                />


                                {/* =========================
                                   DEPARTMENT
                                ========================= */}

                                <input
                                    type="text"
                                    name="department"
                                    placeholder="Department"
                                    value={
                                        signupData.department
                                    }
                                    onChange={
                                        handleSignupChange
                                    }
                                />


                                {/* =========================
                                   SECTION
                                ========================= */}

                                <input
                                    type="text"
                                    name="section"
                                    placeholder="Section"
                                    value={
                                        signupData.section
                                    }
                                    onChange={
                                        handleSignupChange
                                    }
                                />


                                {/* =========================
                                   DAY SCHOLAR / HOSTELER
                                ========================= */}

                                <select
                                    name="studentType"
                                    value={
                                        signupData.studentType
                                    }
                                    onChange={
                                        handleSignupChange
                                    }
                                >

                                    <option value="">
                                        Select Student Type
                                    </option>

                                    <option value="Day Scholar">
                                        Day Scholar
                                    </option>

                                    <option value="Hosteler">
                                        Hosteler
                                    </option>

                                </select>


                                {/* =========================
                                   CREATE PASSWORD
                                ========================= */}

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Create Password"
                                    minLength={8}
                                    value={
                                        signupData.password
                                    }
                                    onChange={
                                        handleSignupChange
                                    }
                                    autoComplete="new-password"
                                />


                                {/* =========================
                                   CONFIRM PASSWORD
                                ========================= */}

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    minLength={8}
                                    value={
                                        signupData.confirmPassword
                                    }
                                    onChange={
                                        handleSignupChange
                                    }
                                    autoComplete="new-password"
                                />


                                {/* =========================
                                   REGISTER
                                ========================= */}

                                <button
                                    type="submit"
                                >
                                    Register
                                </button>

                                <button
                                    type="button"
                                    className="student-secondary-btn"
                                    onClick={openLogin}
                                >
                                    Back to Login
                                </button>

                            </form>


                        </div>

                    )}

                </div>


                {/* =================================================
                   BOOK COVER
                ================================================= */}

                <div className="student-book-cover">


                    {/* BOOK COVER IMAGE */}

                    <img
                        src={bookCover}
                        alt="Student Book Cover"
                        className="student-cover-image"
                    />


                    {/* BOOK SPINE */}

                    <div
                        className="student-book-spine"
                    ></div>


                    {/* =========================
                       GOLDEN KEY
                    ========================= */}

                    <img
                        src={goldKey}
                        alt="Golden Key"
                        className={
                            rotateKey
                                ? "student-key key-rotate"
                                : "student-key"
                        }
                        onClick={unlockBook}
                    />

                </div>

            </div>


            {/* =========================
               INSTRUCTION
            ========================= */}

            {!openBook && (

                <p className="student-instruction">
                    Click the key to Enter the Student Portal
                </p>

            )}

        </div>
    );
}

export default StudentLogin;