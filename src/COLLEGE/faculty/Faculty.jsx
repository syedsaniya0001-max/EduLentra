import React, { useEffect, useState } from "react";
import "./Faculty.css";
import FacultyDashboard from "./FacultyDashboard";
import { facultyApi } from "../../api/facultyApi";

function Faculty() {
  const message = "Welcome Faculty";

  const [text, setText] = useState(message);
  const [moveDuster, setMoveDuster] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [page, setPage] = useState("portal"); // "portal", "login", "signup", "dashboard"
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [signupData, setSignupData] = useState({
    name: "",
    id: "",
    email: "",
    department: "Computer Science & Engineering",
    subject: "Data Structures & Algorithms",
    branch: "CSE - 3rd Year (Section A)",
    phone: "",
    qualification: "Ph.D. in Computer Science",
    password: ""
  });

  // Check if session token already exists
  useEffect(() => {
    const token = localStorage.getItem("facultyToken");
    if (token) {
      // User is already logged in
      setPage("dashboard");
    }
  }, []);

  // Blackboard animation
  useEffect(() => {
    if (page === "dashboard") return;

    const startTimer = setTimeout(() => {
      setMoveDuster(true);
      let index = 0;
      const eraseTimer = setInterval(() => {
        index++;
        setText(message.substring(index));

        if (index >= message.length) {
          clearInterval(eraseTimer);
          setTimeout(() => {
            setShowPortal(true);
          }, 400);
        }
      }, 110);
    }, 1800);

    return () => clearTimeout(startTimer);
  }, [page]);

  // Fast skip blackboard
  const skipBlackboard = () => {
    setShowPortal(true);
  };

  // Quick fill demo credentials
  const fillDemoCredentials = () => {
    setLoginData({
      email: "faculty@edulentra.edu",
      password: "Faculty@123"
    });
    setErrorMessage("");
  };

  // LOGIN
  async function handleLogin(e) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!loginData.email.trim() || !loginData.password.trim()) {
      setErrorMessage("Please enter both faculty email and password.");
      return;
    }

    try {
      const res = await facultyApi.login(loginData.email, loginData.password);
      setSuccessMessage(res.message || "Login successful! Entering portal...");
      setTimeout(() => {
        setPage("dashboard");
      }, 600);
    } catch (err) {
      setErrorMessage(err.message || "Login failed. Verify credentials.");
    }
  }

  // SIGN UP
  async function handleSignup(e) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (
      !signupData.name ||
      !signupData.id ||
      !signupData.email ||
      !signupData.department ||
      !signupData.subject ||
      !signupData.branch ||
      !signupData.password
    ) {
      setErrorMessage("Please fill all mandatory registration fields.");
      return;
    }

    try {
      const res = await facultyApi.signup(signupData);
      setSuccessMessage(res.message || "Registration request submitted! Welcome to EduLentra.");
      setTimeout(() => {
        setPage("dashboard");
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message || "Registration failed. Try again.");
    }
  }

  // Logout callback
  const handleLogout = () => {
    facultyApi.logout();
    setPage("portal");
    setShowPortal(true);
  };

  // If in dashboard mode, render the full Member 2 Faculty Dashboard!
  if (page === "dashboard") {
    return <FacultyDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="faculty-page">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "850px", maxWidth: "90%", marginBottom: "15px" }}>
        <h1 className="faculty-title" style={{ margin: 0 }}>
          EduLentra Faculty Portal
        </h1>

        {!showPortal && (
          <button
            onClick={skipBlackboard}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "7px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Skip Intro ⏩
          </button>
        )}
      </div>

      <div className="faculty-blackboard">
        {!showPortal ? (
          <>
            <div className="faculty-chalk-text">{text}</div>

            <div className={`faculty-duster ${moveDuster ? "move" : ""}`}></div>

            <div className="faculty-chalk-tray">
              <div className="faculty-chalk"></div>
            </div>
          </>
        ) : (
          <>
            {/* MAIN ACCESS PORTAL */}
            {page === "portal" && (
              <div className="faculty-portal">
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#86efac",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "8px"
                  }}
                >
                  Member 2 • Teaching Authority
                </span>
                <h2>Faculty Access</h2>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                  <button className="faculty-portal-btn" onClick={() => setPage("login")}>
                    🔑 Faculty Login
                  </button>

                  <button className="faculty-portal-btn" onClick={() => setPage("signup")}>
                    📝 Faculty Registration
                  </button>
                </div>

                <div style={{ marginTop: "18px" }}>
                  <button
                    onClick={() => setPage("dashboard")}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.3)",
                      padding: "8px 20px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >
                    ⚡ Direct Enter (Demo Dashboard)
                  </button>
                </div>
              </div>
            )}

            {/* LOGIN PAGE */}
            {page === "login" && (
              <div className="faculty-portal">
                <h2>Faculty Login</h2>

                {errorMessage && (
                  <div
                    style={{
                      background: "#fee2e2",
                      color: "#b91c1c",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      marginBottom: "10px",
                      maxWidth: "320px",
                      textAlign: "center"
                    }}
                  >
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div
                    style={{
                      background: "#dcfce7",
                      color: "#15803d",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      marginBottom: "10px",
                      maxWidth: "320px",
                      textAlign: "center"
                    }}
                  >
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleLogin} style={{ textAlign: "center" }}>
                  <input
                    type="email"
                    placeholder="Faculty Email (e.g. faculty@edulentra.edu)"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  />

                  <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "4px" }}>
                    <button className="faculty-portal-btn" type="submit" style={{ width: "160px" }}>
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={fillDemoCredentials}
                      style={{
                        background: "#38bdf8",
                        color: "#0f172a",
                        border: "none",
                        padding: "10px 14px",
                        borderRadius: "24px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        margin: "10px 0"
                      }}
                    >
                      Fill Demo
                    </button>
                  </div>
                </form>

                <p className="faculty-switch-text">
                  Don't have an account?
                  <button className="faculty-link-btn" onClick={() => setPage("signup")}>
                    Sign Up
                  </button>
                </p>

                <button className="faculty-back-btn" onClick={() => setPage("portal")}>
                  ← Back to Portal Home
                </button>
              </div>
            )}

            {/* SIGN UP / REGISTRATION PAGE */}
            {page === "signup" && (
              <div className="faculty-portal signup-portal">
                <h2 style={{ marginBottom: "14px", fontSize: "26px" }}>Faculty Registration</h2>

                {errorMessage && (
                  <div
                    style={{
                      gridColumn: "1 / 3",
                      background: "#fee2e2",
                      color: "#b91c1c",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      marginBottom: "6px",
                      textAlign: "center"
                    }}
                  >
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div
                    style={{
                      gridColumn: "1 / 3",
                      background: "#dcfce7",
                      color: "#15803d",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      marginBottom: "6px",
                      textAlign: "center"
                    }}
                  >
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleSignup}>
                  <input
                    type="text"
                    placeholder="Faculty Full Name *"
                    required
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  />

                  <input
                    type="text"
                    placeholder="Faculty ID * (e.g. FAC-2024-08)"
                    required
                    value={signupData.id}
                    onChange={(e) => setSignupData({ ...signupData, id: e.target.value })}
                  />

                  <input
                    type="email"
                    placeholder="Official Email *"
                    required
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  />

                  <input
                    type="text"
                    placeholder="Department (e.g. Computer Science)"
                    value={signupData.department}
                    onChange={(e) => setSignupData({ ...signupData, department: e.target.value })}
                  />

                  <input
                    type="text"
                    placeholder="Subject / Subjects Handled *"
                    required
                    value={signupData.subject}
                    onChange={(e) => setSignupData({ ...signupData, subject: e.target.value })}
                  />

                  <input
                    type="text"
                    placeholder="Class / Branch Handled *"
                    required
                    value={signupData.branch}
                    onChange={(e) => setSignupData({ ...signupData, branch: e.target.value })}
                  />

                  <input
                    type="text"
                    placeholder="Qualification (e.g. M.Tech, Ph.D)"
                    value={signupData.qualification}
                    onChange={(e) => setSignupData({ ...signupData, qualification: e.target.value })}
                  />

                  <input
                    type="password"
                    placeholder="Create Password *"
                    required
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  />

                  <button className="faculty-portal-btn" type="submit" style={{ gridColumn: "1 / 3" }}>
                    Submit Registration & Access Portal
                  </button>
                </form>

                <p className="faculty-switch-text">
                  Already have an account?
                  <button className="faculty-link-btn" onClick={() => setPage("login")}>
                    Login
                  </button>
                </p>

                <button className="faculty-back-btn" onClick={() => setPage("portal")}>
                  ← Back to Portal Home
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Faculty;
