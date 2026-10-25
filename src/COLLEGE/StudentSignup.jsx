import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/config";

import "./StudentSignup.css";

function StudentSignup() {

    const navigate = useNavigate();


    /* =========================
       EMPTY FORM
    ========================= */

    const emptyFormData = {
        name: "",
        rollNumber: "",
        email: "",
        department: "",
        section: "",
        studentType: "",
        password: "",
        confirmPassword: ""
    };


    const [formData, setFormData] =
        useState(emptyFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);


    /* =========================
       INPUT CHANGE
    ========================= */

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };


    /* =========================
       REGISTER
    ========================= */

    const handleRegister = async (e) => {

        e.preventDefault();


        /* =========================
           EMPTY FIELD CHECK
        ========================= */

        if (
            !formData.name.trim() ||
            !formData.rollNumber.trim() ||
            !formData.email.trim() ||
            !formData.department.trim() ||
            !formData.section.trim() ||
            !formData.studentType ||
            !formData.password ||
            !formData.confirmPassword
        ) {

            alert(
                "Please fill all the fields."
            );

            return;
        }


        /* =========================
           PASSWORD CHECK
        ========================= */

        if (
            formData.password !==
            formData.confirmPassword
        ) {

            alert(
                "Passwords do not match."
            );

            return;
        }


        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/students/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    rollNumber: formData.rollNumber.trim(),
                    email: formData.email.trim(),
                    branch: formData.department.trim(),
                    section: formData.section.trim(),
                    entryType: formData.studentType,
                    password: formData.password,
                }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                alert(result.message || "Registration failed. Please try again.");
                return;
            }

            alert(
                result.message ||
                "Your registration has been submitted for Faculty approval."
            );
            setFormData(emptyFormData);
            navigate("/student");
        } catch (error) {
            console.error("Student signup error:", error);
            alert("Unable to connect to the EduLentra backend.");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (

        <div className="signup-page">
            <div className="signup-card">


                {/* =========================
                   TITLE
                ========================= */}

                <h2>
                    Student Registration
                </h2>


                {/* =========================
                   INTRO
                ========================= */}

                <p className="signup-intro">
                    Submit your details for
                    Student Portal approval.
                </p>


                <form
                    onSubmit={handleRegister}
                >


                    {/* NAME */}

                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="name"
                    />


                    {/* ROLL */}

                    <input
                        type="text"
                        name="rollNumber"
                        placeholder="Roll Number"
                        value={formData.rollNumber}
                        onChange={handleChange}
                    />


                    {/* EMAIL */}

                    <input
                        type="email"
                        name="email"
                        placeholder="Email ID"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                    />


                    {/* DEPARTMENT */}

                    <input
                        type="text"
                        name="department"
                        placeholder="Department"
                        value={formData.department}
                        onChange={handleChange}
                    />


                    {/* SECTION */}

                    <input
                        type="text"
                        name="section"
                        placeholder="Section"
                        value={formData.section}
                        onChange={handleChange}
                    />


                    {/* DAY SCHOLAR / HOSTELER */}

                    <select
                        name="studentType"
                        value={formData.studentType}
                        onChange={handleChange}
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


                    {/* PASSWORD */}

                    <input
                        type="password"
                        name="password"
                        placeholder="Create Password"
                        minLength={8}
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                    />


                    {/* CONFIRM PASSWORD */}

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        minLength={8}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                    />


                    {/* REGISTER */}

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Register"}
                    </button>

                </form>

                <button
                    type="button"
                    className="back-login-btn"
                    onClick={() => navigate("/student")}
                >
                    Back to Login
                </button>

            </div>

        </div>
    );
}

export default StudentSignup;