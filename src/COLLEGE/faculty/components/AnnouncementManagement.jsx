import React, { useEffect, useState } from "react";
import { facultyApi } from "../../../api/facultyApi";

export default function AnnouncementManagement({ faculty }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "Academic",
    priority: "Normal",
    targetAudience: "All Students",
    message: ""
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await facultyApi.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error("Announcements error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      alert("Please provide both title and message.");
      return;
    }

    try {
      await facultyApi.postAnnouncement({
        ...formData,
        postedBy: faculty?.name || "Dr. Ramesh Sharma"
      });

      setAlertMsg({ type: "success", text: "Announcement broadcasted successfully!" });
      setShowModal(false);
      setFormData({
        title: "",
        category: "Academic",
        priority: "Normal",
        targetAudience: "All Students",
        message: ""
      });
      fetchAnnouncements();
      setTimeout(() => setAlertMsg(null), 4000);
    } catch (err) {
      setAlertMsg({ type: "error", text: "Failed to broadcast announcement." });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await facultyApi.deleteAnnouncement(id);
      setAlertMsg({ type: "info", text: "Announcement deleted." });
      fetchAnnouncements();
      setTimeout(() => setAlertMsg(null), 3000);
    } catch (err) {
      alert("Failed to delete.");
    }
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
      ) : announcements.length === 0 ? (
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
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Audience: <b>{ann.targetAudience}</b></span>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>{ann.date}</span>
                  <button
                    className="fac-btn danger"
                    style={{ padding: "4px 8px", fontSize: "11px" }}
                    onClick={() => handleDelete(ann.id)}
                    title="Delete Announcement"
                  >
                    🗑
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: "17px", fontWeight: 700, margin: "6px 0 8px 0", color: "#0f172a" }}>
                {ann.title}
              </h3>

              <p style={{ fontSize: "14px", color: "#334155", lineHeight: 1.6, margin: "0 0 12px 0" }}>
                {ann.message}
              </p>

              <div style={{ fontSize: "12px", color: "#64748b", borderTop: "1px solid var(--fac-border)", paddingTop: "8px" }}>
                Broadcasted by: <span style={{ fontWeight: 600, color: "#0f172a" }}>{ann.postedBy}</span>
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
              <h3 className="fac-modal-title">Broadcast College Announcement</h3>
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
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                >
                  <option value="All Students">All Students</option>
                  <option value="CSE - 3rd Year (Section A)">CSE - 3rd Year (Section A)</option>
                  <option value="CSE - 2nd Year (Section B)">CSE - 2nd Year (Section B)</option>
                  <option value="AIML - 3rd Year">AIML - 3rd Year</option>
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
                <button type="button" className="fac-btn secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="fac-btn primary">
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
