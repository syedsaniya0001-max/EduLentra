
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Faculty.css";
import FacultyDashboard from "./faculty/FacultyDashboard";
import { facultyApi } from "../api/facultyApi";
import PortalBackButton from "./PortalBackButton";

function Faculty() {
  const message = "Welcome Faculty";

  const [text, setText] = useState(message);
  const [moveDuster, setMoveDuster] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [page, setPage] = useState("portal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [signupData, setSignupData] = useState({
    name: "",
    id: "",
    email: "",
    department: "",
    subject: "",
    branch: "",
    password: ""
  });

  // Blackboard animation
  useEffect(() => {
    let eraseTimer;
    let revealTimer;

    const startTimer = setTimeout(() => {
      setMoveDuster(true);

      let index = 0;

      eraseTimer = setInterval(() => {
        index++;
        setText(message.substring(index));

        if (index >= message.length) {
          clearInterval(eraseTimer);

          revealTimer = setTimeout(() => {
            setShowPortal(true);
          }, 500);
        }
      }, 120);
    }, 2000);

    return () => {
      clearTimeout(startTimer);
      clearInterval(eraseTimer);
      clearTimeout(revealTimer);
    };
  }, []);

  // FACULTY LOGIN
  async function handleLogin(e) {
    e.preventDefault();

    if (isSubmitting) return;

    const identifier = loginData.email.trim();

    if (!identifier || !loginData.password) {
      alert("Please enter your Faculty ID/email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      await facultyApi.login(identifier, loginData.password);

      setPage("dashboard");
    } catch (error) {
      alert(error.message || "Login failed. Check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // FACULTY SIGNUP
  async function handleSignup(e) {
    e.preventDefault();

    if (isSubmitting) return;

    if (
      !signupData.name.trim() ||
      !signupData.id.trim() ||
      !signupData.email.trim() ||
      !signupData.department.trim() ||
      !signupData.subject.trim() ||
      !signupData.branch.trim() ||
      !signupData.password
    ) {
      alert("Please fill all the details.");
      return;
    }

    if (signupData.password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      await facultyApi.signup({
        name: signupData.name.trim(),
        id: signupData.id.trim(),
        email: signupData.email.trim(),
        department: signupData.department.trim(),
        subject: signupData.subject.trim(),
        branch: signupData.branch.trim(),
        password: signupData.password
      });

      alert(
        "Faculty registration request submitted. Please wait for HOD approval."
      );

      setSignupData({
        name: "",
        id: "",
        email: "",
        department: "",
        subject: "",
        branch: "",
        password: ""
      });

      setPage("portal");
    } catch (error) {
      alert(error.message || "Unable to submit Faculty registration.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    facultyApi.logout();
    setLoginData({ email: "", password: "" });
    setPage("portal");
  }

  return page === "dashboard" ? (
    <FacultyDashboard onLogout={handleLogout} />
  ) : (
    <div className="faculty-page">
      <PortalBackButton
        role="faculty"
        fallbackTo="/role"
        show={page === "portal"}
      />
      <h1 className="faculty-title">EduLentra Faculty Portal</h1>

      <div className="faculty-blackboard">
        {!showPortal ? (
          <>
            <div className="faculty-chalk-text">{text}</div>

            <div
              className={`faculty-duster ${moveDuster ? "move" : ""}`}
            />

            <div className="faculty-chalk-tray">
              <div className="faculty-chalk" />
            </div>
          </>
        ) : (
          <>
            {/* MAIN ACCESS */}
            {page === "portal" && (
              <div className="faculty-portal">
                <h2>Faculty Access</h2>

                <button
                  type="button"
                  className="faculty-portal-btn"
                  onClick={() => setPage("login")}
                >
                  Login
                </button>

                <button
                  type="button"
                  className="faculty-portal-btn"
                  onClick={() => setPage("signup")}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* LOGIN */}
            {page === "login" && (
              <div className="faculty-portal">
                <h2>Faculty Login</h2>

                <form onSubmit={handleLogin}>
                  <input
                    type="text"
                    placeholder="Faculty ID"
                    autoComplete="username"
                    value={loginData.email}
                    required
                    onChange={(e) =>
                      setLoginData({
                        ...loginData,
                        email: e.target.value
                      })
                    }
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={loginData.password}
                    required
                    onChange={(e) =>
                      setLoginData({
                        ...loginData,
                        password: e.target.value
                      })
                    }
                  />

                  <Link
                    className="password-recovery-link"
                    to="/forgot-password?role=faculty"
                  >
                    Forgot Password?
                  </Link>

                  <button
                    className="faculty-portal-btn"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Logging in..." : "Login"}
                  </button>
                </form>

                <p className="faculty-switch-text">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="faculty-link-btn"
                    onClick={() => setPage("signup")}
                  >
                    Sign Up
                  </button>
                </p>

                <button
                  type="button"
                  className="faculty-back-btn portal-back-button"
                  onClick={() => setPage("portal")}
                >
                  ← Back
                </button>
              </div>
            )}

            {/* SIGNUP */}
            {page === "signup" && (
              <div className="faculty-portal signup-portal">
                <h2>Faculty Registration</h2>

                <form onSubmit={handleSignup}>
                  <input
                    type="text"
                    placeholder="Faculty Name"
                    autoComplete="name"
                    value={signupData.name}
                    required
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        name: e.target.value
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Faculty ID"
                    value={signupData.id}
                    required
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        id: e.target.value
                      })
                    }
                  />

                  <input
                    type="email"
                    placeholder="Faculty Email"
                    autoComplete="email"
                    value={signupData.email}
                    required
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        email: e.target.value
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Department"
                    value={signupData.department}
                    required
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        department: e.target.value
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Subject / Subjects Handled"
                    value={signupData.subject}
                    required
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        subject: e.target.value
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Class / Branch Handled"
                    value={signupData.branch}
                    required
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        branch: e.target.value
                      })
                    }
                  />

                  <input
                    type="password"
                    placeholder="Create Password (minimum 8 characters)"
                    autoComplete="new-password"
                    minLength={8}
                    value={signupData.password}
                    required
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        password: e.target.value
                      })
                    }
                  />

                  <button
                    className="faculty-portal-btn"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Send Request"}
                  </button>

                  <button
                    type="button"
                    className="faculty-back-btn portal-back-button"
                    onClick={() => setPage("login")}
                  >
                    ← Back to Login
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Faculty;
