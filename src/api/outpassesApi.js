import { API_BASE_URL } from "./config";

async function request(path, options = {}) {
  const token =
    sessionStorage.getItem("edulentraToken") || localStorage.getItem("facultyToken");

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
    throw new Error(result.message || "Outpass request failed.");
  }

  return result;
}

export const outpassesApi = {
  async create({ reason, destination, fromDate, toDate }) {
    const result = await request("/api/students/outpasses", {
      method: "POST",
      body: JSON.stringify({ reason, destination, fromDate, toDate }),
    });

    if (!result.outpass) {
      throw new Error("The outpass service did not confirm submission.");
    }

    return result.outpass;
  },

  async getMine() {
    const result = await request("/api/students/outpasses");
    if (!Array.isArray(result.outpasses)) {
      throw new Error("The outpass service returned an invalid response.");
    }
    return result.outpasses;
  },

  async getAll() {
    const result = await request("/api/faculty/outpasses");
    if (!Array.isArray(result.outpasses)) {
      throw new Error("The outpass service returned an invalid response.");
    }
    return result.outpasses;
  },

  async getDepartment() {
    const result = await request("/api/hod/outpasses");
    if (!Array.isArray(result.outpasses)) {
      throw new Error("The outpass service returned an invalid response.");
    }
    return result.outpasses;
  },

  async update(id, { status, remarks }) {
    const result = await request(`/api/faculty/outpasses/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status, remarks }),
    });

    if (!result.outpass) {
      throw new Error("The outpass service did not confirm the update.");
    }

    return result.outpass;
  },

  async updateDepartment(id, { status, remarks }) {
    const result = await request(`/api/hod/outpasses/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status, remarks }),
    });
    if (!result.outpass) {
      throw new Error("The outpass service did not confirm the update.");
    }
    return result.outpass;
  },
};
