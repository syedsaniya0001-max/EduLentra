import { useEffect, useMemo, useState } from "react";
import { suggestionsApi } from "../../../../../api/suggestionsApi";
import HODLayout from "../../components/hod/HODLayout";

const statusLabels = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
};

function SuggestionManagement() {
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("UNDER_REVIEW");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    suggestionsApi.getDepartment()
      .then((items) => {
        if (!cancelled) setSuggestions(items);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message || "Unable to load department suggestions.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const pendingCount = useMemo(
    () => suggestions.filter((item) => ["SUBMITTED", "UNDER_REVIEW"].includes(item.status)).length,
    [suggestions]
  );

  const openSuggestion = (item) => {
    setSelected(item);
    setStatus(item.status === "SUBMITTED" ? "UNDER_REVIEW" : item.status);
    setResponse(item.response || "");
    setError("");
    setNotice("");
  };

  const saveReview = async (event) => {
    event.preventDefault();
    if (!selected || isSaving) return;
    if (status !== "UNDER_REVIEW" && !response.trim()) {
      setError("Add a response before accepting or declining a suggestion.");
      return;
    }

    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      const updated = await suggestionsApi.update(selected._id, { status, response });
      setSuggestions((items) => items.map((item) => item._id === updated._id ? updated : item));
      setSelected(updated);
      setNotice("Suggestion review saved.");
    } catch (requestError) {
      setError(requestError.message || "Unable to save this suggestion review.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <HODLayout>
      <section style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
        <header style={{ marginBottom: "20px" }}>
          <h2 style={{ marginBottom: "6px" }}>Suggestion Management</h2>
          <p style={{ margin: 0, color: "#64748b" }}>
            Review student ideas for your department. {pendingCount} need attention.
          </p>
        </header>

        {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
        {notice && <p role="status" style={{ color: "#15803d" }}>{notice}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
          {suggestions.map((item) => (
            <article
              key={item._id}
              style={{ padding: "18px", border: "1px solid #dbe2ea", borderRadius: "10px", background: "#fff" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
                <strong>{item.student?.name || "Student"} · {item.student?.rollNumber || "—"}</strong>
                <span>{statusLabels[item.status] || item.status}</span>
              </div>
              <p style={{ whiteSpace: "pre-wrap" }}>{item.message}</p>
              <small style={{ color: "#64748b" }}>
                {new Date(item.createdAt).toLocaleDateString()}
              </small>
              <div style={{ marginTop: "14px" }}>
                <button type="button" onClick={() => openSuggestion(item)}>
                  Review
                </button>
              </div>
            </article>
          ))}
        </div>

        {!isLoading && suggestions.length === 0 && (
          <p>No suggestions have been submitted for your department.</p>
        )}
        {isLoading && <p>Loading suggestions...</p>}

        {selected && (
          <form
            onSubmit={saveReview}
            style={{ marginTop: "24px", padding: "20px", border: "1px solid #dbe2ea", borderRadius: "10px", background: "#fff" }}
          >
            <h3>Review suggestion from {selected.student?.name || "Student"}</h3>
            <p style={{ whiteSpace: "pre-wrap" }}>{selected.message}</p>
            <label htmlFor="suggestion-status">Review status</label>
            <select
              id="suggestion-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              style={{ display: "block", margin: "6px 0 14px", padding: "8px", minWidth: "220px" }}
            >
              <option value="UNDER_REVIEW">Under review</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="DECLINED">Declined</option>
            </select>
            <label htmlFor="suggestion-response">Response to student</label>
            <textarea
              id="suggestion-response"
              value={response}
              onChange={(event) => setResponse(event.target.value)}
              maxLength={3000}
              rows={4}
              style={{ display: "block", width: "100%", margin: "6px 0 14px" }}
            />
            <button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save review"}
            </button>
          </form>
        )}
      </section>
    </HODLayout>
  );
}

export default SuggestionManagement;
