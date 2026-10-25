import { API_BASE_URL } from "./config";

async function request(path, options = {}) {
  const token = sessionStorage.getItem("edulentraToken");
  const response = await fetch(`${API_BASE_URL}/api/events${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Event service request failed.");
  }
  return result;
}

export const eventsApi = {
  async getAll() {
    const result = await request("");
    if (!Array.isArray(result.events)) {
      throw new Error("The event service returned an invalid response.");
    }
    return result.events;
  },

  async create(event) {
    const result = await request("", {
      method: "POST",
      body: JSON.stringify(event),
    });
    if (!result.event?.id) {
      throw new Error("The event service did not confirm publishing.");
    }
    return result.event;
  },

  async remove(id) {
    return request(`/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};
