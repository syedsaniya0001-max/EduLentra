import { API_BASE_URL } from "./config";

async function request(path, options = {}) {
  const token =
    sessionStorage.getItem("edulentraToken") ||
    localStorage.getItem("facultyToken");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Suggestion request failed.");
  }

  return result;
}

export const suggestionsApi = {
  async create(message) {
    const result = await request("/api/students/suggestions", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    if (!result.suggestion) {
      throw new Error("The suggestion service did not confirm submission.");
    }
    return result.suggestion;
  },

  async getMine() {
    const result = await request("/api/students/suggestions");
    if (!Array.isArray(result.suggestions)) {
      throw new Error("The suggestion service returned an invalid response.");
    }
    return result.suggestions;
  },

  async getDepartment() {
    const result = await request("/api/hod/suggestions");
    if (!Array.isArray(result.suggestions)) {
      throw new Error("The suggestion service returned an invalid response.");
    }
    return result.suggestions;
  },

  async update(id, { status, response }) {
    const result = await request(
      `/api/hod/suggestions/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, response }),
      }
    );
    if (!result.suggestion) {
      throw new Error("The suggestion service did not confirm the update.");
    }
    return result.suggestion;
  },
};
