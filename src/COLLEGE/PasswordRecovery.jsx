import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./PasswordRecovery.css";
import { API_BASE_URL } from "../api/config";

const roles = [
  ["student", "Student"],
  ["faculty", "Faculty"],
  ["hod", "HOD"],
  ["admin", "Admin"],
];

const roleLoginPaths = {
  student: "/student",
  faculty: "/faculty",
  hod: "/hod",
  admin: "/admin",
};

async function sendRequest(path, body) {
  const response = await fetch(`${API_BASE_URL}/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Password recovery request failed.");
  }

  return result;
}

export function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const initialRole = roles.some(([role]) => role === searchParams.get("role"))
    ? searchParams.get("role")
    : "";
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!role) {
      setError("Select the role for the account you want to recover.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await sendRequest("forgot-password", {
        role,
        email: email.trim(),
      });
      setMessage(result.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="password-recovery-page">
      <section className="password-recovery-card">
        <h1>Forgot Password?</h1>
        <p>Enter the email address registered with your EduLentra account.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="recovery-role">Account role</label>
          <select
            id="recovery-role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            required
          >
            <option value="">Select your role</option>
            {roles.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <label htmlFor="recovery-email">Registered email</label>
          <input
            id="recovery-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && <p className="password-recovery-success" role="status">{message}</p>}
        {error && <p className="password-recovery-error" role="alert">{error}</p>}

        <Link
          className="password-recovery-return"
          to={roleLoginPaths[role] || "/role"}
        >
          Return to Login
        </Link>
      </section>
    </main>
  );
}

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const role = searchParams.get("role") || "";
  const validLink =
    /^[a-f0-9]{64}$/i.test(token) && Object.hasOwn(roleLoginPaths, role);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(
    validLink ? "" : "This reset link is missing required information or is malformed.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("Enter and confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("Password must be between 8 and 128 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await sendRequest("reset-password", {
        role,
        token,
        password,
        confirmPassword,
      });
      setMessage(result.message);
      setIsComplete(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="password-recovery-page">
      <section className="password-recovery-card">
        <h1>Reset Password</h1>
        <p>Choose a new password for your EduLentra account.</p>

        {validLink && !isComplete && (
          <form onSubmit={handleSubmit}>
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <label htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />

            <label className="password-recovery-toggle">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={(event) => setShowPasswords(event.target.checked)}
              />
              Show passwords
            </label>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {message && <p className="password-recovery-success" role="status">{message}</p>}
        {error && <p className="password-recovery-error" role="alert">{error}</p>}

        <Link
          className="password-recovery-return"
          to={roleLoginPaths[role] || "/role"}
        >
          {isComplete ? "Return to Login" : "Back to Login"}
        </Link>
      </section>
    </main>
  );
}
