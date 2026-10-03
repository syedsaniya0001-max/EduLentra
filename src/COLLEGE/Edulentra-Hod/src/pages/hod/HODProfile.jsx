import HODLayout from "../../components/hod/HODLayout";
import "../../styles/hod/HODProfile.css";

function HODProfile() {
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

          <button className="edit-profile-btn">
            Edit Profile
          </button>
        </div>

        {/* Profile Overview */}
        <div className="profile-overview">

          <div className="profile-avatar-large">
            H
          </div>

          <div className="profile-main-info">
            <h3>Head of Department</h3>
            <p>Department of CSE - Artificial Intelligence</p>

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

          <div className="profile-details-grid">

            <div className="profile-detail">
              <span>Full Name</span>
              <strong>Head of Department</strong>
            </div>

            <div className="profile-detail">
              <span>HOD ID</span>
              <strong>HOD001</strong>
            </div>

            <div className="profile-detail">
              <span>Email</span>
              <strong>hod@edulentra.edu</strong>
            </div>

            <div className="profile-detail">
              <span>Phone</span>
              <strong>+91 98765 43210</strong>
            </div>

            <div className="profile-detail">
              <span>Department</span>
              <strong>CSE - Artificial Intelligence</strong>
            </div>

            <div className="profile-detail">
              <span>Designation</span>
              <strong>Head of Department</strong>
            </div>

          </div>

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
              <strong>Computer Science & Engineering - AI</strong>
            </div>

            <div className="profile-detail">
              <span>Department Code</span>
              <strong>CSE-AI</strong>
            </div>

            <div className="profile-detail">
              <span>Total Students</span>
              <strong>420</strong>
            </div>

            <div className="profile-detail">
              <span>Total Faculty</span>
              <strong>32</strong>
            </div>

          </div>

        </div>

      </div>

    </HODLayout>
  );
}

export default HODProfile;