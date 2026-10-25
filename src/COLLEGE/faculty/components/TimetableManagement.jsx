import { useCallback, useEffect, useState } from "react";
import { facultyApi } from "../../../api/facultyApi";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const emptyDraft = () => ({
  day: "Monday",
  section: "",
  startTime: "",
  endTime: "",
  room: "",
});

const sortEntries = (entries) =>
  [...entries].sort(
    (first, second) =>
      DAYS.indexOf(first.day) - DAYS.indexOf(second.day) ||
      first.startTime.localeCompare(second.startTime)
  );

export default function TimetableManagement() {
  const [entries, setEntries] = useState([]);
  const [sections, setSections] = useState([]);
  const [subject, setSubject] = useState("");
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadTimetable = useCallback(async () => {
    setError("");
    try {
      const result = await facultyApi.getTimetable();
      setEntries(sortEntries(result.timetable));
      setSections(result.sections);
      setSubject(result.subject || "");
    } catch (loadError) {
      setError(loadError.message || "Unable to load timetable.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTimetable();
  }, [loadTimetable]);

  const resetDraft = () => {
    setDraft(emptyDraft());
    setEditingId("");
  };

  const saveEntry = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      const saved = editingId
        ? await facultyApi.updateTimetableEntry(editingId, draft)
        : await facultyApi.createTimetableEntry(draft);
      setEntries((current) =>
        editingId
          ? sortEntries(
              current.map((entry) => (entry._id === editingId ? saved : entry))
            )
          : sortEntries([...current, saved])
      );
      setMessage(editingId ? "Class updated." : "Class added to your timetable.");
      resetDraft();
    } catch (saveError) {
      setError(saveError.message || "Unable to save timetable entry.");
    } finally {
      setIsSaving(false);
    }
  };

  const editEntry = (entry) => {
    setDraft({
      day: entry.day,
      section: entry.section,
      startTime: entry.startTime,
      endTime: entry.endTime,
      room: entry.room || "",
    });
    setEditingId(entry._id);
    setError("");
    setMessage("");
  };

  const deleteEntry = async (entry) => {
    setError("");
    setMessage("");
    try {
      await facultyApi.deleteTimetableEntry(entry._id);
      setEntries((current) => current.filter((item) => item._id !== entry._id));
      if (editingId === entry._id) resetDraft();
      setMessage("Class removed from your timetable.");
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete timetable entry.");
    }
  };

  return (
    <section className="fac-timetable">
      <header className="fac-timetable-header">
        <div>
          <h2>Weekly Timetable</h2>
          <p>
            Schedule your recurring classes. Subject: {subject || "Not provided"}.
          </p>
        </div>
      </header>

      {error && <p className="fac-timetable-feedback error" role="alert">{error}</p>}
      {message && <p className="fac-timetable-feedback success" role="status">{message}</p>}

      <form className="fac-card fac-timetable-form" onSubmit={saveEntry}>
        <h3>{editingId ? "Edit class" : "Add a weekly class"}</h3>
        <div className="fac-timetable-fields">
          <label>
            Day
            <select
              onChange={(event) => setDraft({ ...draft, day: event.target.value })}
              required
              value={draft.day}
            >
              {DAYS.map((day) => <option key={day}>{day}</option>)}
            </select>
          </label>
          <label>
            Section
            <select
              onChange={(event) => setDraft({ ...draft, section: event.target.value })}
              required
              value={draft.section}
            >
              <option value="">Choose a section</option>
              {sections.map((section) => <option key={section}>{section}</option>)}
            </select>
          </label>
          <label>
            Start time
            <input
              onChange={(event) => setDraft({ ...draft, startTime: event.target.value })}
              required
              type="time"
              value={draft.startTime}
            />
          </label>
          <label>
            End time
            <input
              onChange={(event) => setDraft({ ...draft, endTime: event.target.value })}
              required
              type="time"
              value={draft.endTime}
            />
          </label>
          <label>
            Room (optional)
            <input
              maxLength={80}
              onChange={(event) => setDraft({ ...draft, room: event.target.value })}
              value={draft.room}
            />
          </label>
        </div>
        <div className="fac-timetable-form-actions">
          <button className="fac-btn primary" disabled={isSaving || isLoading || !sections.length} type="submit">
            {isSaving ? "Saving..." : editingId ? "Save class" : "Add class"}
          </button>
          {editingId && (
            <button
              className="fac-btn secondary"
              disabled={isSaving}
              onClick={resetDraft}
              type="button"
            >
              Cancel edit
            </button>
          )}
          {!isLoading && !sections.length && (
            <span>Add active students to a section before scheduling classes.</span>
          )}
        </div>
      </form>

      <div className="fac-card fac-timetable-list">
        <h3>Scheduled Classes</h3>
        {isLoading ? (
          <p role="status">Loading timetable...</p>
        ) : entries.length === 0 ? (
          <p>No weekly classes are scheduled yet.</p>
        ) : (
          <div className="fac-timetable-table-wrap">
            <table className="fac-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Section</th>
                  <th>Room</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry._id}>
                    <td>{entry.day}</td>
                    <td>{entry.startTime}–{entry.endTime}</td>
                    <td>{entry.subject}</td>
                    <td>{entry.section}</td>
                    <td>{entry.room || "Not set"}</td>
                    <td>
                      <div className="fac-timetable-row-actions">
                        <button className="fac-btn secondary" onClick={() => editEntry(entry)} type="button">
                          Edit
                        </button>
                        <button className="fac-btn danger" onClick={() => deleteEntry(entry)} type="button">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
