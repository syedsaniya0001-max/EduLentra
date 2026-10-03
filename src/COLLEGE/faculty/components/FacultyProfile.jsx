import React, { useState } from "react";
import { facultyApi } from "../../../api/facultyApi";

export default function FacultyProfile({ faculty, onUpdateFaculty }) {
  const [profile, setProfile] = useState(faculty || facultyApi.getCurrentUser());
  const [newSubject, setNewSubject] = useState("");
  const [newClass, setNewClass] = useState("");
  const [alertMsg, setAlertMsg] = useState(null);

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
    try {
      const res = await facultyApi.updateProfile(profile);
      setAlertMsg({ type: "success", text: "Faculty profile updated successfully!" });
      if (onUpdateFaculty) onUpdateFaculty(res.faculty || profile);
      setTimeout(() => setAlertMsg(null), 4000);
    } catch (err) {
      setAlertMsg({ type: "error", text: "Failed to update profile." });
    }
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    const current = profile.subjects || [];
    if (!current.includes(newSubject.trim())) {
      setProfile({ ...profile, subjects: [...current, newSubject.trim()] });
    }
    setNewSubject("");
  };

  const handleRemoveSubject = (sub) => {
    setProfile({
      ...profile,
      subjects: (profile.subjects || []).filter((s) => s !== sub)
    });
  };

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClass.trim()) return;
    const current = profile.classes || [];
    if (!current.includes(newClass.trim())) {
      setProfile({ ...profile, classes: [...current, newClass.trim()] });
    }
    setNewClass("");
  };

  const handleRemoveClass = (cls) => {
    setProfile({
      ...profile,
      classes: (profile.classes || []).filter((c) => c !== cls)
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    if (passData.newPassword.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }

    try {
      await facultyApi.changePassword(passData.currentPassword, passData.newPassword);
      setAlertMsg({ type: "success", text: "Account password changed successfully!" });
      setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setAlertMsg(null), 4000);
    } catch (err) {
      setAlertMsg({ type: "error", text: "Failed to update password. Verify current password." });
    }
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>Faculty Profile & Settings</h2>
        <p style={{ fontSize: "13px", color: "var(--fac-text-muted)", margin: "4px 0 0 0" }}>
          Manage your personal details, teaching allocations, cabin office info, and credentials.
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
          <img
            src={profile.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
            alt={profile.name}
            style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "3px solid #2563eb" }}
          />

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>{profile.name}</h3>
              <span className="fac-badge fac-badge-green">Verified Faculty</span>
              <span className="fac-badge fac-badge-blue">ID: {profile.id || "FAC-2024-001"}</span>
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
              <label className="fac-form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="fac-form-input"
                value={profile.name || ""}
                onChange={handleProfileChange}
              />
            </div>

            <div className="fac-form-group">
              <label className="fac-form-label">Email Address (Official)</label>
              <input
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
              <label className="fac-form-label">Contact Phone</label>
              <input
                type="text"
                name="phone"
                className="fac-form-input"
                value={profile.phone || ""}
                onChange={handleProfileChange}
              />
            </div>

            <div className="fac-form-group">
              <label className="fac-form-label">Office / Cabin Location</label>
              <input
                type="text"
                name="office"
                className="fac-form-input"
                value={profile.office || ""}
                onChange={handleProfileChange}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="fac-form-group">
              <label className="fac-form-label">Designation / Role</label>
              <input
                type="text"
                name="designation"
                className="fac-form-input"
                value={profile.designation || ""}
                onChange={handleProfileChange}
              />
            </div>

            <div className="fac-form-group">
              <label className="fac-form-label">Highest Academic Degree</label>
              <input
                type="text"
                name="qualification"
                className="fac-form-input"
                value={profile.qualification || ""}
                onChange={handleProfileChange}
              />
            </div>
          </div>

          {/* Subjects Handled */}
          <div className="fac-form-group" style={{ marginTop: "10px" }}>
            <label className="fac-form-label">Subjects Handled (Active Syllabus)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
              {(profile.subjects || []).map((sub) => (
                <span
                  key={sub}
                  className="fac-badge fac-badge-blue"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px" }}
                >
                  {sub}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(sub)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#1e40af", fontWeight: "bold" }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Add new subject handled..."
                className="fac-form-input"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
              <button type="button" className="fac-btn secondary" onClick={handleAddSubject}>
                + Add
              </button>
            </div>
          </div>

          {/* Classes Handled */}
          <div className="fac-form-group" style={{ marginTop: "14px" }}>
            <label className="fac-form-label">Classes & Branches Allocated</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
              {(profile.classes || []).map((cls) => (
                <span
                  key={cls}
                  className="fac-badge fac-badge-green"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px" }}
                >
                  {cls}
                  <button
                    type="button"
                    onClick={() => handleRemoveClass(cls)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#166534", fontWeight: "bold" }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Add branch / class allocation..."
                className="fac-form-input"
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
              />
              <button type="button" className="fac-btn secondary" onClick={handleAddClass}>
                + Add
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
            <button type="submit" className="fac-btn primary" style={{ padding: "10px 24px" }}>
              💾 Save Profile Details
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
              <label className="fac-form-label">Current Password</label>
              <input
                type="password"
                required
                placeholder="Current password"
                className="fac-form-input"
                value={passData.currentPassword}
                onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
              />
            </div>

            <div className="fac-form-group">
              <label className="fac-form-label">New Password</label>
              <input
                type="password"
                required
                placeholder="New password (min 6 chars)"
                className="fac-form-input"
                value={passData.newPassword}
                onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
              />
            </div>

            <div className="fac-form-group">
              <label className="fac-form-label">Confirm New Password</label>
              <input
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
