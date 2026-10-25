import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/config";
import { storeAuthSession } from "../api/authSession";
import "./Hod.css";
import PortalBackButton from "./PortalBackButton";

function Hod() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginData, setLoginData] = useState({ id: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    id: "",
    department: "",
    email: "",
    password: ""
  });

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!loginData.id.trim() || !loginData.password.trim()) {
      alert("Please enter your HoD ID and password.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginData.id.trim(),
          password: loginData.password,
          role: "hod",
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.token) {
        throw new Error(result.message || "Unable to sign in with this HOD account.");
      }

      storeAuthSession(result, "hod");
      navigate("/hod/dashboard");
    } catch (error) {
      alert(error.message || "Unable to connect to the EduLentra backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();

    if (Object.values(signupData).some((value) => !value.trim())) {
      alert("Please fill in all registration details.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/hod/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: signupData.name.trim(),
          hodId: signupData.id.trim(),
          email: signupData.email.trim(),
          department: signupData.department.trim(),
          password: signupData.password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "HOD registration failed. Please try again.");
        return;
      }

      alert(data.message || "HOD registration request sent for approval.");
      setShowLogin(true);
    } catch (error) {
      console.error("HOD signup error:", error);
      alert("Unable to connect to the EduLentra backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="hod-section">
      {showLogin && <PortalBackButton role="hod" fallbackTo="/role" />}

      <div className="hod-title">
        <h1>EduLentra HoD Portal</h1>
        <p>Manage your department with ease.</p>
      </div>

      <div className="hod-container">

        {/* Department File */}
        <div className="department-file">

          <div className="file-tab">
            DEPARTMENT
          </div>

          <div className="file-content">

            <div className="file-heading">
              <span>📁</span>
              <div>
                <h2>Department Office</h2>
                <p>Head of Department</p>
              </div>
            </div>

           <div className="file-items">
    <div>✓ Monitor Department Attendance</div>
    <div>✓ Approve Outpass Requests</div>
    <div>✓ Review Student Complaints & Feedback</div>
    <div>✓ Manage Department Announcements</div>
</div>
            <div className="approval-stamp">
              ✓ APPROVED
            </div>

          </div>

        </div>

        {/* Login Box */}
        <div className="hod-login-box">

          {showLogin ? (
            <>
              <h2>HoD Login</h2>
              <p>Access your department portal</p>

              <form onSubmit={handleLogin}>
                <input
                  type="text"
                  placeholder="HoD ID"
                  value={loginData.id}
                  onChange={(event) =>
                    setLoginData({ ...loginData, id: event.target.value })
                  }
                />

                <input
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  value={loginData.password}
                  onChange={(event) =>
                    setLoginData({ ...loginData, password: event.target.value })
                  }
                />

                <Link
                  className="password-recovery-link"
                  to="/forgot-password?role=hod"
                >
                  Forgot Password?
                </Link>

                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Login"}
                </button>
              </form>

              <span>
                Don't have an account?
                <b onClick={() => setShowLogin(false)}>
                  Sign Up
                </b>
              </span>
            </>
          ) : (
            <>
              <h2>Create HoD Account</h2>
              <p>Register your department account</p>

              <form onSubmit={handleSignup}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={signupData.name}
                  onChange={(event) =>
                    setSignupData({ ...signupData, name: event.target.value })
                  }
                />

                <input
                  type="text"
                  placeholder="HoD ID"
                  value={signupData.id}
                  onChange={(event) =>
                    setSignupData({ ...signupData, id: event.target.value })
                  }
                />

                <input
                  type="text"
                  placeholder="Department"
                  value={signupData.department}
                  onChange={(event) =>
                    setSignupData({ ...signupData, department: event.target.value })
                  }
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={signupData.email}
                  onChange={(event) =>
                    setSignupData({ ...signupData, email: event.target.value })
                  }
                />

                <input
                  type="password"
                  placeholder="Password"
                  minLength={8}
                  autoComplete="new-password"
                  value={signupData.password}
                  onChange={(event) =>
                    setSignupData({ ...signupData, password: event.target.value })
                  }
                />

                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Sign Up"}
                </button>
              </form>

              <button
                className="portal-back-button hod-signup-back"
                type="button"
                onClick={() => setShowLogin(true)}
                aria-label="Back to HOD login"
              >
                <span aria-hidden="true">←</span>
                <span>Back to Login</span>
              </button>
            </>
          )}

        </div>

      </div>

    </section>
  );
}

export default Hod;