import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Hod.css";

function Hod() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(true);
  const [loginData, setLoginData] = useState({ id: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    id: "",
    department: "",
    email: "",
    password: ""
  });

  const handleLogin = (event) => {
    event.preventDefault();

    if (!loginData.id.trim() || !loginData.password.trim()) {
      alert("Please enter your HoD ID and password.");
      return;
    }

    navigate("/hod/dashboard");
  };

  const handleSignup = (event) => {
    event.preventDefault();

    if (Object.values(signupData).some((value) => !value.trim())) {
      alert("Please fill in all registration details.");
      return;
    }

    alert("HOD registration request sent for approval.");
    setShowLogin(true);
  };

  return (
    <section className="hod-section">

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
                  value={loginData.password}
                  onChange={(event) =>
                    setLoginData({ ...loginData, password: event.target.value })
                  }
                />

                <button type="submit">Login</button>
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
                  value={signupData.password}
                  onChange={(event) =>
                    setSignupData({ ...signupData, password: event.target.value })
                  }
                />

                <button type="submit">Sign Up</button>
              </form>

              <span>
                Already have an account?
                <b onClick={() => setShowLogin(true)}>
                  Login
                </b>
              </span>
            </>
          )}

        </div>

      </div>

    </section>
  );
}

export default Hod;