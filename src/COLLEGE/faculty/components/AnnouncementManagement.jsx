import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  announcementAudienceLabel,
  announcementsApi,
} from "../../../api/announcementsApi";

export default function AnnouncementManagement({ faculty }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState("");
  const [alertMsg, setAlertMsg] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "Academic",
    priority: "Normal",
    targetRole: "STUDENT",
    date: new Date().toISOString().slice(0, 10),
    message: ""
  });

  const fetchAnnouncements = useCallback(async () => {
    try {
      if (!hasLoaded.current) setLoading(true);
      const data = await announcementsApi.getAll();
      setAnnouncements(data);
    } catch (err) {
      setAlertMsg({
        type: "error",
        text: err.message || "Unable to load announcements."
      });
    } finally {
      hasLoaded.current = true;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
    return announcementsApi.subscribeToAnnouncementUpdates(
      fetchAnnouncements,
      () => {
        setAlertMsg({
          type: "error",
          text: "Live updates are unavailable. Refresh to check for new announcements."
        });
      }
    );
  }, [fetchAnnouncements]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      alert("Please provide both title and message.");
      return;
    }

    try {
      const values = {
        ...formData,
        createdByName: faculty?.name || ""
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
      setAlertMsg({
        type: "success",
        text: editingAnnouncementId
          ? "Announcement updated."
          : "Announcement broadcasted successfully!"
      });
      setShowModal(false);
      setEditingAnnouncementId("");
      setFormData({
        title: "",
        category: "Academic",
        priority: "Normal",
        targetRole: "STUDENT",
        date: new Date().toISOString().slice(0, 10),
        message: ""
      });
      fetchAnnouncements();
      setTimeout(() => setAlertMsg(null), 4000);
    } catch (err) {
      setAlertMsg({
        type: "error",
        text: err.message || "Unable to publish announcement."
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await announcementsApi.remove(id);
      setAlertMsg({ type: "info", text: "Announcement deleted." });
      fetchAnnouncements();
      setTimeout(() => setAlertMsg(null), 3000);
    } catch (err) {
      setAlertMsg({
        type: "error",
        text: err.message || "Unable to delete announcement."
      });
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncementId(announcement.id);
    setFormData({
      title: announcement.title,
      category: announcement.category || "Academic",
      priority: announcement.priority || "Normal",
      targetRole: announcement.targetRole || "STUDENT",
      date: announcement.date || new Date().toISOString().slice(0, 10),
      message: announcement.message,
    });
    setShowModal(true);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>Announcements & Circulars</h2>
          <p style={{ fontSize: "13px", color: "var(--fac-text-muted)", margin: "4px 0 0 0" }}>
            Broadcast academic schedules, test notices, and important department circulars to students.
          </p>
        </div>
        <button className="fac-btn primary" onClick={() => setShowModal(true)}>
          📢 Post Announcement
        </button>
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

      {/* Announcements List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading announcements...</div>
      ) : announcements.length === 0 && alertMsg?.type !== "error" ? (
        <div className="fac-card" style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📢</div>
          <h3 style={{ margin: "0 0 6px 0" }}>No Active Announcements</h3>
          <p style={{ color: "#64748b", margin: 0 }}>Create a new broadcast notice using the button above.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="fac-card"
              style={{
                borderLeft: `5px solid ${
                  ann.priority === "Urgent" ? "#ef4444" : ann.priority === "High" ? "#f59e0b" : "#2563eb"
                }`
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  <span
                    className={`fac-badge ${
                      ann.priority === "Urgent"
                        ? "fac-badge-red"
                        : ann.priority === "High"
                        ? "fac-badge-amber"
                        : "fac-badge-blue"
                    }`}
                  >
                    {ann.priority} Priority
                  </span>
                  <span className="fac-badge fac-badge-purple">{ann.category}</span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Audience: <b>{announcementAudienceLabel(ann)}</b></span>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>{ann.date}</span>
                  {ann.canEdit && (
                    <button
                      className="fac-btn secondary"
                      style={{ padding: "4px 8px", fontSize: "11px" }}
                      onClick={() => handleEdit(ann)}
                      title="Edit announcement"
                    >
                      Edit
                    </button>
                  )}
                  {ann.canDelete && (
                    <button
                      className="fac-btn danger"
                      style={{ padding: "4px 8px", fontSize: "11px" }}
                      onClick={() => handleDelete(ann.id)}
                      title="Delete Announcement"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>

              <h3 style={{ fontSize: "17px", fontWeight: 700, margin: "6px 0 8px 0", color: "#0f172a" }}>
                {ann.title}
              </h3>

              <p style={{ fontSize: "14px", color: "#334155", lineHeight: 1.6, margin: "0 0 12px 0" }}>
                {ann.message}
              </p>

              <div style={{ fontSize: "12px", color: "#64748b", borderTop: "1px solid var(--fac-border)", paddingTop: "8px" }}>
                Broadcasted by: <span style={{ fontWeight: 600, color: "#0f172a" }}>{ann.createdByName || ann.postedBy || "Faculty"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      {showModal && (
        <div className="fac-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="fac-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fac-modal-header">
              <h3 className="fac-modal-title">
                {editingAnnouncementId ? "Edit Announcement" : "Broadcast College Announcement"}
              </h3>
              <button className="fac-modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handlePost}>
              <div className="fac-form-group">
                <label className="fac-form-label">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule for Mid-Term Practical Exams"
                  className="fac-form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="fac-form-group">
                  <label className="fac-form-label">Category</label>
                  <select
                    className="fac-form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Academic">Academic</option>
                    <option value="Exam">Exam / Assessment</option>
                    <option value="Event">Event / Hackathon</option>
                    <option value="General">General Notice</option>
                  </select>
                </div>

                <div className="fac-form-group">
                  <label className="fac-form-label">Priority Level</label>
                  <select
                    className="fac-form-select"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent / Immediate</option>
                  </select>
                </div>
              </div>

              <div className="fac-form-group">
                <label className="fac-form-label">Target Audience</label>
                <select
                  className="fac-form-select"
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                >
                  <option value="STUDENT">Students in my branch</option>
                </select>
              </div>

              <div className="fac-form-group">
                <label className="fac-form-label">Announcement Content / Body *</label>
                <textarea
                  required
                  className="fac-form-textarea"
                  style={{ minHeight: "120px" }}
                  placeholder="Type the full message to be posted across student portals..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <div className="fac-btn-group">
                <button
                  type="button"
                  className="fac-btn secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAnnouncementId("");
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="fac-btn primary">
                  {editingAnnouncementId ? "Save Changes" : "Broadcast Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
