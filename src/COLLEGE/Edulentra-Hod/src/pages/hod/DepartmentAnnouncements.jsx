import { useEffect, useMemo, useState } from "react";
import { announcementAudienceLabel, announcementsApi } from "../../../../../api/announcementsApi";
import HODLayout from "../../components/hod/HODLayout";
import "../../styles/hod/DepartmentAnnouncements.css";

const createDraft = () => ({
  title: "",
  message: "",
  category: "General",
  priority: "Normal",
  targetRole: "STUDENT",
  date: new Date().toISOString().slice(0, 10),
});

function DepartmentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [draft, setDraft] = useState(createDraft);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    let requestId = 0;
    const refreshAnnouncements = async () => {
      const currentRequestId = ++requestId;
      try {
        const items = await announcementsApi.getAll();
        if (!cancelled && currentRequestId === requestId) {
          setAnnouncements(items);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled && currentRequestId === requestId) {
          setError(loadError.message || "Unable to load announcements.");
        }
      } finally {
        if (!cancelled && currentRequestId === requestId) setIsLoading(false);
      }
    };

    const unsubscribe = announcementsApi.subscribeToAnnouncementUpdates(
      () => refreshAnnouncements(),
      () => {
        if (!cancelled) {
          setError("Live updates are unavailable. Refresh to check for new announcements.");
        }
      }
    );
    void refreshAnnouncements();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const filteredAnnouncements = useMemo(
    () =>
      announcements.filter(
        (announcement) =>
          (audienceFilter === "All" ||
            announcement.targetRole === audienceFilter ||
            announcement.targetRole === "ALL") &&
          (categoryFilter === "All" || announcement.category === categoryFilter) &&
          (priorityFilter === "All" || announcement.priority === priorityFilter)
      ),
    [announcements, audienceFilter, categoryFilter, priorityFilter]
  );

  const monthCount = announcements.filter((announcement) => {
    const createdAt = new Date(announcement.createdAt);
    const now = new Date();
    return (
      createdAt.getMonth() === now.getMonth() &&
      createdAt.getFullYear() === now.getFullYear()
    );
  }).length;

  const publishAnnouncement = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const values = {
        ...draft,
        title: draft.title.trim(),
        message: draft.message.trim(),
      };
      const announcement = editingAnnouncementId
        ? await announcementsApi.update(editingAnnouncementId, values)
        : await announcementsApi.create(values);
      setAnnouncements((current) =>
        editingAnnouncementId
          ? current.map((item) =>
              item.id === editingAnnouncementId ? announcement : item
            )
          : [announcement, ...current]
      );
      setEditingAnnouncementId("");
      setDraft(createDraft());
      setShowForm(false);
      setMessage(
        editingAnnouncementId
          ? "Announcement updated."
          : "Announcement published to the selected department audience."
      );
    } catch (publishError) {
      setError(publishError.message || "Unable to publish announcement.");
    }
  };

  const editAnnouncement = (announcement) => {
    setEditingAnnouncementId(announcement.id);
    setDraft({
      title: announcement.title,
      message: announcement.message,
      category: announcement.category || "General",
      priority: announcement.priority || "Normal",
      targetRole: announcement.targetRole,
      date: announcement.date || new Date().toISOString().slice(0, 10),
    });
    setShowForm(true);
    setError("");
    setMessage("");
  };

  const deleteAnnouncement = async (id) => {
    setError("");
    setMessage("");
    try {
      await announcementsApi.remove(id);
      setAnnouncements((current) =>
        current.filter((announcement) => announcement.id !== id)
      );
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete announcement.");
    }
  };

  return (
    <HODLayout>
      <div className="department-announcements">
        <div className="announcement-page-header">
          <div>
            <h2>Department Announcements</h2>
            <p>Create and manage announcements for your department.</p>
          </div>
          <button
            className="create-announcement-btn"
            type="button"
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditingAnnouncementId("");
                setDraft(createDraft());
              } else {
                setShowForm(true);
              }
            }}
          >
            {showForm ? "Cancel" : "+ Create Announcement"}
          </button>
        </div>

        {error && <p className="announcement-feedback error" role="alert">{error}</p>}
        {message && <p className="announcement-feedback" role="status">{message}</p>}

        {showForm && (
          <form className="announcement-editor" onSubmit={publishAnnouncement}>
            <h3>{editingAnnouncementId ? "Edit department announcement" : "New department announcement"}</h3>
            <label>
              Title
              <input
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                required
              />
            </label>
            <div className="announcement-editor-row">
              <label>
                Audience
                <select
                  value={draft.targetRole}
                  onChange={(event) => setDraft({ ...draft, targetRole: event.target.value })}
                >
                  <option value="STUDENT">Students in my department</option>
                  <option value="FACULTY">Faculty in my department</option>
                </select>
              </label>
              <label>
                Category
                <select
                  value={draft.category}
                  onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                >
                  <option>Academic</option>
                  <option>Event</option>
                  <option>Policy</option>
                  <option>General</option>
                </select>
              </label>
              <label>
                Priority
                <select
                  value={draft.priority}
                  onChange={(event) => setDraft({ ...draft, priority: event.target.value })}
                >
                  <option>Normal</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </label>
              <label>
                Date
                <input
                  type="date"
                  value={draft.date}
                  onChange={(event) => setDraft({ ...draft, date: event.target.value })}
                  required
                />
              </label>
            </div>
            <label>
              Announcement details
              <textarea
                value={draft.message}
                onChange={(event) => setDraft({ ...draft, message: event.target.value })}
                required
              />
            </label>
            <button className="create-announcement-btn" type="submit">
              {editingAnnouncementId ? "Save changes" : "Publish announcement"}
            </button>
          </form>
        )}

        <div className="announcement-summary">
          <div className="announcement-summary-card">
            <span>Visible Announcements</span>
            <strong>{announcements.length}</strong>
          </div>
          <div className="announcement-summary-card published-card">
            <span>Faculty Announcements</span>
            <strong>{announcements.filter((announcement) => announcement.targetRole === "FACULTY").length}</strong>
          </div>
          <div className="announcement-summary-card draft-card">
            <span>Student Announcements</span>
            <strong>{announcements.filter((announcement) => announcement.targetRole === "STUDENT").length}</strong>
          </div>
          <div className="announcement-summary-card">
            <span>This Month</span>
            <strong>{monthCount}</strong>
          </div>
        </div>

        <div className="announcement-list-container">
          <div className="announcement-list-header">
            <div>
              <h3>Recent Announcements</h3>
              <p>Department notices and updates</p>
            </div>
            <div className="announcement-filters">
              <select
                aria-label="Filter announcements by audience"
                value={audienceFilter}
                onChange={(event) => setAudienceFilter(event.target.value)}
              >
                <option value="All">All audiences</option>
                <option value="STUDENT">Students</option>
                <option value="FACULTY">Faculty</option>
              </select>
              <select
                aria-label="Filter announcements by category"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="All">All categories</option>
                {[...new Set(announcements.map((announcement) => announcement.category).filter(Boolean))].map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                aria-label="Filter announcements by priority"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
              >
                <option value="All">All priorities</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="announcement-list">
            {isLoading ? (
              <p className="announcement-feedback">Loading announcements...</p>
            ) : filteredAnnouncements.length ? (
              filteredAnnouncements.map((announcement) => (
                <div className="announcement-item" key={announcement.id}>
                  <div className="announcement-icon">📢</div>
                  <div className="announcement-content">
                    <div className="announcement-title-row">
                      <h4>{announcement.title}</h4>
                      <span className="announcement-status published">Published</span>
                    </div>
                    <p>{announcement.message}</p>
                    <div className="announcement-meta">
                      <span>📅 {announcement.date}</span>
                      <span>👥 {announcementAudienceLabel(announcement)}</span>
                      <span>{announcement.category} · {announcement.priority}</span>
                      <span>By {announcement.createdByName || "HOD"}</span>
                    </div>
                  </div>
                  {announcement.canEdit && (
                    <div className="announcement-actions">
                      <button
                        className="edit-announcement-btn"
                        type="button"
                        onClick={() => editAnnouncement(announcement)}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                  {announcement.canDelete && (
                    <div className="announcement-actions">
                      <button
                        className="delete-announcement-btn"
                        type="button"
                        onClick={() => deleteAnnouncement(announcement.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : !error ? (
              <p className="announcement-feedback">No announcements for this audience yet.</p>
            ) : null}
          </div>
        </div>
      </div>
    </HODLayout>
  );
}

export default DepartmentAnnouncements;
