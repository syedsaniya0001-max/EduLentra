import React, { useEffect, useState } from "react";
import { facultyApi } from "../../../api/facultyApi";

export default function NotesManagement() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [sections, setSections] = useState([]);
  const [branch, setBranch] = useState("");
  const [facultySubject, setFacultySubject] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    section: "*",
    unit: "Unit 1",
    description: "",
    fileUrl: "",
    fileName: "",
  });

  useEffect(() => {
    fetchNotes();
  }, [search, selectedSubject]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const result = await facultyApi.getNotes(search, selectedSubject);
      setNotes(result.materials);
      setSections(result.sections);
      setBranch(result.branch);
      setFacultySubject(result.subject);
    } catch (err) {
      setAlertMsg({ type: "error", text: err.message || "Unable to load study materials." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setAlertMsg({ type: "error", text: "Enter a material title." });
      return;
    }
    if (!formData.fileUrl.trim() || !formData.fileName.trim()) {
      setAlertMsg({ type: "error", text: "Enter the document link and file name before publishing." });
      return;
    }

    try {
      await facultyApi.uploadNote({
        title: formData.title.trim(),
        section: formData.section,
        unit: formData.unit,
        description: formData.description.trim(),
        fileUrl: formData.fileUrl.trim(),
        fileName: formData.fileName.trim(),
      });

      setAlertMsg({ type: "success", text: "Lecture note uploaded and shared with students!" });
      setShowUploadModal(false);
      setFormData({
        title: "",
        section: "*",
        unit: "Unit 1",
        description: "",
        fileUrl: "",
        fileName: "",
      });
      await fetchNotes();
      setTimeout(() => setAlertMsg(null), 4000);
    } catch (err) {
      setAlertMsg({ type: "error", text: err.message || "Failed to publish study material." });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this study material?")) return;

    try {
      await facultyApi.deleteNote(id);
      setAlertMsg({ type: "info", text: "Study material deleted." });
      fetchNotes();
      setTimeout(() => setAlertMsg(null), 3000);
    } catch (err) {
      setAlertMsg({ type: "error", text: err.message || "Failed to delete study material." });
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>Notes Upload & Study Materials</h2>
          <p style={{ fontSize: "13px", color: "var(--fac-text-muted)", margin: "4px 0 0 0" }}>
            Publish unit-wise lecture notes, slides, and syllabus references for your enrolled students.
          </p>
        </div>
        <button className="fac-btn primary" onClick={() => setShowUploadModal(true)}>
          ➕ Upload New Material
        </button>
      </div>

      {alertMsg && (
        <div className={`fac-alert-banner ${alertMsg.type}`} role={alertMsg.type === "error" ? "alert" : "status"}>
          <span>{alertMsg.text}</span>
          <button
            onClick={() => setAlertMsg(null)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="fac-filter-bar">
        <input
          type="text"
          className="fac-search-input"
          placeholder="🔍 Search notes by title, topic, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="fac-select-input"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="All">All Subjects</option>
          {facultySubject && <option value={facultySubject}>{facultySubject}</option>}
        </select>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="fac-card" style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📚</div>
          <h3 style={{ margin: "0 0 6px 0" }}>No Study Materials Found</h3>
          <p style={{ color: "#64748b", margin: 0 }}>Click "Upload New Material" above to post your first lecture notes.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {notes.map((note) => (
            <div key={note.id} className="fac-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <span className="fac-badge fac-badge-purple">{note.unit}</span>
                  <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>{note.uploadedDate}</span>
                </div>

                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px 0", color: "#0f172a", lineHeight: 1.3 }}>
                  {note.title}
                </h3>

                <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600, marginBottom: "8px" }}>
                  {note.subject} • {note.branch} • {note.section === "*" ? "All sections" : note.section}
                </div>

                <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.5, margin: 0 }}>
                  {note.description || "No specific module description provided."}
                </p>
              </div>

              <div
                style={{
                  marginTop: "18px",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--fac-border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>📄 {note.fileName}</span>
                  {note.fileSize && <span>({note.fileSize})</span>}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <a
                    href={note.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="fac-btn secondary"
                    style={{ padding: "6px 12px", fontSize: "12px", textDecoration: "none" }}
                  >
                    View / Download
                  </a>
                  <button
                    className="fac-btn danger"
                    style={{ padding: "6px 10px", fontSize: "12px" }}
                    onClick={() => handleDelete(note.id)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fac-modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="fac-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fac-modal-header">
              <h3 className="fac-modal-title">Upload New Study Material</h3>
              <button className="fac-modal-close" onClick={() => setShowUploadModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleUpload}>
              <div className="fac-form-group">
                <label className="fac-form-label">Material / Chapter Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3: Dynamic Programming Algorithms & Code"
                  className="fac-form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="fac-form-group">
                  <label className="fac-form-label">Branch</label>
                  <input className="fac-form-input" value={branch || "Loading..."} readOnly />
                </div>

                <div className="fac-form-group">
                  <label className="fac-form-label">Subject</label>
                  <input className="fac-form-input" value={facultySubject || "Loading..."} readOnly />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="fac-form-group">
                  <label className="fac-form-label" htmlFor="material-target-section">Target Section</label>
                  <select
                    id="material-target-section"
                    className="fac-form-select"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  >
                    <option value="*">All sections</option>
                    {sections.map((section) => (
                      <option key={section} value={section}>
                        {section === "__unassigned__" ? "Unassigned section" : `Section ${section}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="fac-form-group">
                  <label className="fac-form-label">Unit / Module</label>
                  <select
                    className="fac-form-select"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="Unit 1">Unit 1</option>
                    <option value="Unit 2">Unit 2</option>
                    <option value="Unit 3">Unit 3</option>
                    <option value="Unit 4">Unit 4</option>
                    <option value="Unit 5">Unit 5</option>
                  </select>
                </div>
              </div>

              <div className="fac-form-group">
                <label className="fac-form-label">Notes Description & Topic Summary</label>
                <textarea
                  className="fac-form-textarea"
                  placeholder="Outline key topics, algorithms covered, or revision hints..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="fac-form-group">
                <label className="fac-form-label" htmlFor="material-document-url">Document URL *</label>
                <input
                  id="material-document-url"
                  type="url"
                  required
                  placeholder="https://..."
                  className="fac-form-input"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                />
                <span style={{ fontSize: "11.5px", color: "#64748b", marginTop: "4px", display: "block" }}>
                  Provide an accessible HTTP/HTTPS link to a PDF or document. The portal stores and shares the link.
                </span>
              </div>

              <div className="fac-form-group">
                <label className="fac-form-label" htmlFor="material-file-name">Document file name *</label>
                <input
                  id="material-file-name"
                  type="text"
                  required
                  maxLength={255}
                  placeholder="e.g. Unit-1-Notes.pdf"
                  className="fac-form-input"
                  value={formData.fileName}
                  onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                />
              </div>

              <div className="fac-btn-group">
                <button type="button" className="fac-btn secondary" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="fac-btn primary">
                  Publish Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
