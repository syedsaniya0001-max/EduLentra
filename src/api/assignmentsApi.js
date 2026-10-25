import { API_BASE_URL } from "./config";

async function request(path, options = {}) {
  const token =
    sessionStorage.getItem("edulentraToken") ||
    localStorage.getItem("facultyToken");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: ["Bearer", token].join(" ") } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Assignment service request failed.");
  }
  return result;
}

export const assignmentsApi = {
  async getMine() {
    const result = await request("/api/students/assignments");
    if (!Array.isArray(result.assignments)) {
      throw new Error("The assignment service returned an invalid response.");
    }
    return result.assignments;
  },

  async submit(assignmentId, answer, fileUrl = "") {
    const result = await request(
      `/api/students/assignments/${encodeURIComponent(assignmentId)}/submissions`,
      {
        method: "POST",
        body: JSON.stringify({ answer, fileUrl }),
      }
    );
    return result;
  },
};
