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
    throw new Error(result.message || "Complaint request failed.");
  }

  return result;
}

export const complaintsApi = {
  async create({ subject, description }) {
    const result = await request("/api/students/complaints", {
      method: "POST",
      body: JSON.stringify({ subject, description }),
    });
    if (!result.complaint) {
      throw new Error("The complaint service did not confirm submission.");
    }
    return result.complaint;
  },

  async getMine() {
    const result = await request("/api/students/complaints");
    if (!Array.isArray(result.complaints)) {
      throw new Error("The complaint service returned an invalid response.");
    }
    return result.complaints;
  },

  async getDepartment() {
    const result = await request("/api/hod/complaints");
    if (!Array.isArray(result.complaints)) {
      throw new Error("The complaint service returned an invalid response.");
    }
    return result.complaints;
  },

  async update(id, { status, response }) {
    const result = await request(
      `/api/hod/complaints/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, response }),
      }
    );
    if (!result.complaint) {
      throw new Error("The complaint service did not confirm the update.");
    }
    return result.complaint;
  },
};
