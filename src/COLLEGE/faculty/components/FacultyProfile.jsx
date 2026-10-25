import React, { useEffect, useState } from "react";
import { facultyApi } from "../../../api/facultyApi";

export default function FacultyProfile({ faculty, onUpdateFaculty }) {
  const [profile, setProfile] = useState(faculty || facultyApi.getCurrentUser());
  const [alertMsg, setAlertMsg] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (faculty) setProfile(faculty);
  }, [faculty]);

  // Password state
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await facultyApi.updateProfile(profile);
      setAlertMsg({ type: "success", text: "Faculty profile updated successfully!" });
      setProfile(res.faculty);
      if (onUpdateFaculty) onUpdateFaculty(res.faculty);
      setTimeout(() => setAlertMsg(null), 4000);
    } catch (err) {
      setAlertMsg({
        type: "error",
        text: err.message || "Failed to update profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      setAlertMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (passData.newPassword.length < 8) {
      setAlertMsg({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }

    try {
      await facultyApi.changePassword(passData.currentPassword, passData.newPassword);
      setAlertMsg({ type: "success", text: "Account password changed successfully!" });
      setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setAlertMsg(null), 4000);
    } catch (error) {
      setAlertMsg({
        type: "error",
        text: error.message || "Failed to update password. Verify current password.",
      });
    }
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>Faculty Profile & Settings</h2>
        <p style={{ fontSize: "13px", color: "var(--fac-text-muted)", margin: "4px 0 0 0" }}>
          Manage your personal details and credentials. Department, subject, and branch allocations are managed by your institution.
        </p>
      </div>

      {alertMsg && (
        <div className={`fac-alert-banner ${alertMsg.type}`}>
          <span>{alertMsg.text}</span>
          <button
            onClick={() => setAlertMsg(null)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="fac-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
          {profile.image || profile.avatar ? (
            <img
              src={profile.image || profile.avatar}
              alt={profile.name}
              style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "3px solid #2563eb" }}
            />
          ) : (
            <div
              aria-label={`${profile.name || "Faculty"} profile`}
              style={{ width: "80px", height: "80px", borderRadius: "50%", border: "3px solid #2563eb", display: "grid", placeItems: "center", fontSize: "28px", fontWeight: 800, color: "#1d4ed8" }}
            >
              {(profile.name || "F").charAt(0).toUpperCase()}
            </div>
          )}

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>{profile.name}</h3>
              <span className="fac-badge fac-badge-green">Verified Faculty</span>
              <span className="fac-badge fac-badge-blue">ID: {profile.id || "—"}</span>
            </div>

            <div style={{ fontSize: "13.5px", color: "#64748b", marginTop: "4px" }}>
              {profile.designation} • {profile.department}
            </div>
            <div style={{ fontSize: "12.5px", color: "#94a3b8", marginTop: "2px" }}>
              {profile.qualification} • {profile.experience} Experience
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <div className="fac-card" style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0", borderBottom: "1px solid var(--fac-border)", paddingBottom: "10px" }}>
          Personal & Department Information
        </h3>

        <form onSubmit={handleSaveProfile}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="fac-form-group">
              <label className="fac-form-label" htmlFor="faculty-profile-name">Full Name</label>
              <input
                id="faculty-profile-name"
                type="text"
                name="name"
                className="fac-form-input"
                required
                minLength={2}
                maxLength={100}
                value={profile.name || ""}
                onChange={handleProfileChange}
              />
            </div>

            <div className="fac-form-group">
              <label className="fac-form-label" htmlFor="faculty-profile-email">Email Address (Official)</label>
              <input
                id="faculty-profile-email"
                type="email"
                disabled
                className="fac-form-input"
                style={{ background: "#f8fafc", cursor: "not-allowed" }}
                value={profile.email || ""}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="fac-form-group">
              <label className="fac-form-label" htmlFor="faculty-profile-phone">Contact Phone</label>
              <input
                id="faculty-profile-phone"
                name="phone"
                className="fac-form-input"
                type="tel"
                maxLength={30}
                value={profile.phone || ""}
                onChange={handleProfileChange}
              />
            </div>

            <div className="fac-form-group">
              <label className="fac-form-label" htmlFor="faculty-profile-office">Office / Cabin Location</label>
              <input
                id="faculty-profile-office"
                type="text"
                name="office"
                className="fac-form-input"
                maxLength={120}
                value={profile.office || ""}
                onChange={handleProfileChange}
              />
            </div>
          </div>

          <div className="fac-form-group">
            <label className="fac-form-label" htmlFor="faculty-profile-experience">Teaching Experience</label>
            <input
              id="faculty-profile-experience"
              type="text"
              name="experience"
              className="fac-form-input"
              maxLength={80}
              value={profile.experience || ""}
              onChange={handleProfileChange}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="fac-form-group">
              <label className="fac-form-label" htmlFor="faculty-profile-designation">Designation / Role</label>
              <input
                id="faculty-profile-designation"
                type="text"
                name="designation"
                className="fac-form-input"
                maxLength={100}
                value={profile.designation || ""}
                onChange={handleProfileChange}
              />
            </div>

            <div className="fac-form-group">
              <label className="fac-form-label" htmlFor="faculty-profile-qualification">Highest Academic Degree</label>
              <input
                id="faculty-profile-qualification"
                type="text"
                name="qualification"
                className="fac-form-input"
                maxLength={120}
                value={profile.qualification || ""}
                onChange={handleProfileChange}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="fac-form-group">
              <label className="fac-form-label" htmlFor="faculty-profile-department">Department</label>
              <input id="faculty-profile-department" className="fac-form-input" value={profile.department || ""} disabled />
            </div>
            <div className="fac-form-group">
              <label className="fac-form-label" htmlFor="faculty-profile-subject">Assigned Subject</label>
              <input id="faculty-profile-subject" className="fac-form-input" value={profile.subject || ""} disabled />
            </div>
          </div>
          <div className="fac-form-group">
            <label className="fac-form-label" htmlFor="faculty-profile-branch">Assigned Branch</label>
            <input id="faculty-profile-branch" className="fac-form-input" value={profile.branch || ""} disabled />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
            <button type="submit" className="fac-btn primary" disabled={isSaving} style={{ padding: "10px 24px" }}>
              {isSaving ? "Saving..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Card */}
      <div className="fac-card">
        <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0", borderBottom: "1px solid var(--fac-border)", paddingBottom: "10px" }}>
          Security & Password Change
        </h3>

        <form onSubmit={handleChangePassword}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            <div className="fac-form-group">
              <label className="fac-form-label" htmlFor="faculty-current-password">Current Password</label>
              <input
                id="faculty-current-password"
                type="password"
                required
                placeholder="Current password"
                className="fac-form-input"
                value={passData.currentPassword}
                onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
              />
            </div>

            <div className="fac-form-group">
              <label className="fac-form-label" htmlFor="faculty-new-password">New Password</label>
              <input
                id="faculty-new-password"
                type="password"
                required
                minLength={8}
                maxLength={128}
                placeholder="New password (min 8 chars)"
                className="fac-form-input"
                value={passData.newPassword}
                onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
              />
            </div>

            <div className="fac-form-group">
              <label className="fac-form-label" htmlFor="faculty-confirm-password">Confirm New Password</label>
              <input
                id="faculty-confirm-password"
                type="password"
                required
                placeholder="Confirm password"
                className="fac-form-input"
                value={passData.confirmPassword}
                onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
            <button type="submit" className="fac-btn secondary">
              🔒 Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
