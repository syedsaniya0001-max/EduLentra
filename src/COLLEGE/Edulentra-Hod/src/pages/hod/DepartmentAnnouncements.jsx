import HODLayout from "../../components/hod/HODLayout";
import "../../styles/hod/DepartmentAnnouncements.css";

function DepartmentAnnouncements() {
  const announcements = [
    {
      id: "ANN001",
      title: "Internal Assessment Schedule",
      description: "Internal assessment examinations will begin from 10 October.",
      date: "02 Oct 2026",
      audience: "Students & Faculty",
      status: "Published",
    },
    {
      id: "ANN002",
      title: "Faculty Meeting",
      description: "Department faculty meeting scheduled for Monday at 11:00 AM.",
      date: "01 Oct 2026",
      audience: "Faculty",
      status: "Published",
    },
    {
      id: "ANN003",
      title: "Project Review",
      description: "Third year project review will be conducted next week.",
      date: "30 Sep 2026",
      audience: "3rd Year Students",
      status: "Published",
    },
    {
      id: "ANN004",
      title: "Holiday Notice",
      description: "Department holiday notification for the upcoming festival.",
      date: "28 Sep 2026",
      audience: "All",
      status: "Draft",
    },
  ];

  return (
    <HODLayout>

      <div className="department-announcements">

        {/* Page Header */}
        <div className="announcement-page-header">

          <div>
            <h2>Department Announcements</h2>
            <p>
              Create and manage announcements for students and faculty.
            </p>
          </div>

          <button className="create-announcement-btn">
            + Create Announcement
          </button>

        </div>

        {/* Summary Cards */}
        <div className="announcement-summary">

          <div className="announcement-summary-card">
            <span>Total Announcements</span>
            <strong>18</strong>
          </div>

          <div className="announcement-summary-card published-card">
            <span>Published</span>
            <strong>15</strong>
          </div>

          <div className="announcement-summary-card draft-card">
            <span>Drafts</span>
            <strong>3</strong>
          </div>

          <div className="announcement-summary-card">
            <span>This Month</span>
            <strong>7</strong>
          </div>

        </div>

        {/* Announcements List */}
        <div className="announcement-list-container">

          <div className="announcement-list-header">

            <div>
              <h3>Recent Announcements</h3>
              <p>Department notices and updates</p>
            </div>

            <select>
              <option>All Announcements</option>
              <option>Published</option>
              <option>Draft</option>
            </select>

          </div>

          <div className="announcement-list">

            {announcements.map((announcement) => (

              <div
                className="announcement-item"
                key={announcement.id}
              >

                <div className="announcement-icon">
                  📢
                </div>

                <div className="announcement-content">

                  <div className="announcement-title-row">

                    <h4>{announcement.title}</h4>

                    <span
                      className={`announcement-status ${announcement.status.toLowerCase()}`}
                    >
                      {announcement.status}
                    </span>

                  </div>

                  <p>{announcement.description}</p>

                  <div className="announcement-meta">

                    <span>
                      📅 {announcement.date}
                    </span>

                    <span>
                      👥 {announcement.audience}
                    </span>

                  </div>

                </div>

                <div className="announcement-actions">

                  <button className="edit-announcement-btn">
                    Edit
                  </button>

                  <button className="delete-announcement-btn">
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </HODLayout>
  );
}

export default DepartmentAnnouncements;