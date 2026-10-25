import { useEffect, useState } from "react";
import { getAuthUser, updateAuthUser } from "../../../../../api/authSession";
import { hodProfileApi } from "../../../../../api/hodProfileApi";
import { hodReportsApi } from "../../../../../api/hodReportsApi";
import HODLayout from "../../components/hod/HODLayout";
import "../../styles/hod/HODProfile.css";

function HODProfile() {
  const [hod, setHod] = useState(() => getAuthUser() || {});
  const [draft, setDraft] = useState({ name: "", email: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [departmentStats, setDepartmentStats] = useState(null);
  const [statsError, setStatsError] = useState("");
  const displayName = hod?.name || hod?.username || "HOD";

  useEffect(() => {
    let isCurrent = true;
    hodReportsApi
      .get()
      .then((report) => {
        if (isCurrent) {
          setDepartmentStats(report.summary);
        }
      })
      .catch((loadError) => {
        if (isCurrent) {
          setStatsError(loadError.message || "Unable to load department totals.");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const startEditing = () => {
    setDraft({ name: hod.name || "", email: hod.email || "" });
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setError("");
    setIsEditing(false);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await hodProfileApi.update(draft);
      const updatedHod = updateAuthUser(result.user);
      setHod(updatedHod);
      setIsEditing(false);
      setSuccess("Your profile was updated successfully.");
    } catch (saveError) {
      setError(saveError.message || "Unable to update your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <HODLayout>

      <div className="hod-profile">

        {/* Page Header */}
        <div className="profile-page-header">
          <div>
            <h2>HOD Profile</h2>
            <p>
              View and manage your department profile information.
            </p>
          </div>

          {!isEditing && (
            <button className="edit-profile-btn" onClick={startEditing}>
              Edit Profile
            </button>
          )}
        </div>

        {error && <p className="profile-form-message error" role="alert">{error}</p>}
        {success && <p className="profile-form-message success" role="status">{success}</p>}
        {statsError && (
          <p className="profile-form-message error" role="alert">
            Department totals unavailable: {statsError}
          </p>
        )}

        {/* Profile Overview */}
        <div className="profile-overview">

          <div className="profile-avatar-large">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div className="profile-main-info">
            <h3>{displayName}</h3>
            <p>{hod?.department || "Head of Department"}</p>

            <span className="profile-active-status">
              ● Active
            </span>
          </div>

        </div>

        {/* Personal Information */}
        <div className="profile-section">

          <div className="profile-section-header">
            <div>
              <h3>Personal Information</h3>
              <p>Basic information about the HOD</p>
            </div>
          </div>

          {isEditing ? (
            <form className="profile-details-grid" onSubmit={saveProfile}>
              <label className="profile-detail profile-edit-field">
                <span>Full Name</span>
                <input
                  autoComplete="name"
                  maxLength={100}
                  minLength={2}
                  name="name"
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  required
                  value={draft.name}
                />
              </label>
              <label className="profile-detail profile-edit-field">
                <span>Email</span>
                <input
                  autoComplete="email"
                  name="email"
                  onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                  required
                  type="email"
                  value={draft.email}
                />
              </label>
              <div className="profile-detail">
                <span>HOD ID</span>
                <strong>{hod?.username || "Not provided"}</strong>
              </div>
              <div className="profile-detail">
                <span>Department</span>
                <strong>{hod?.department || "Not provided"}</strong>
              </div>
              <div className="profile-edit-actions">
                <button className="edit-profile-btn" disabled={isSaving} type="submit">
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  className="cancel-profile-btn"
                  disabled={isSaving}
                  onClick={cancelEditing}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details-grid">
              <div className="profile-detail">
                <span>Full Name</span>
                <strong>{displayName}</strong>
              </div>
              <div className="profile-detail">
                <span>HOD ID</span>
                <strong>{hod?.username || "Not provided"}</strong>
              </div>
              <div className="profile-detail">
                <span>Email</span>
                <strong>{hod?.email || "Not provided"}</strong>
              </div>
              <div className="profile-detail">
                <span>Phone</span>
                <strong>Not provided</strong>
              </div>
              <div className="profile-detail">
                <span>Department</span>
                <strong>{hod?.department || "Not provided"}</strong>
              </div>
              <div className="profile-detail">
                <span>Designation</span>
                <strong>Head of Department</strong>
              </div>
            </div>
          )}

        </div>

        {/* Department Information */}
        <div className="profile-section">

          <div className="profile-section-header">
            <div>
              <h3>Department Information</h3>
              <p>Current department details</p>
            </div>
          </div>

          <div className="profile-details-grid">

            <div className="profile-detail">
              <span>Department</span>
              <strong>{hod?.department || "Not provided"}</strong>
            </div>

            <div className="profile-detail">
              <span>Department Code</span>
              <strong>{hod?.department || "Not provided"}</strong>
            </div>

            <div className="profile-detail">
              <span>Total Students</span>
              <strong>{departmentStats?.studentCount ?? (statsError ? "Unavailable" : "Loading...")}</strong>
            </div>

            <div className="profile-detail">
              <span>Total Faculty</span>
              <strong>{departmentStats?.facultyCount ?? (statsError ? "Unavailable" : "Loading...")}</strong>
            </div>

          </div>

        </div>

      </div>

    </HODLayout>
  );
}

export default HODProfile;