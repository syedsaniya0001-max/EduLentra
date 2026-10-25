import { API_BASE_URL } from "./config";

async function request(path, options = {}) {
  const token = sessionStorage.getItem("edulentraToken");
  const response = await fetch(`${API_BASE_URL}/api/notifications${path}`, {
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
    throw new Error(result.message || "Notification service request failed.");
  }
  return result;
}

export const notificationsApi = {
  async getMine() {
    const result = await request("");
    if (!Array.isArray(result.notifications)) {
      throw new Error("The notification service returned an invalid response.");
    }
    return result.notifications;
  },

  markAllRead() {
    return request("/read", { method: "PATCH", body: JSON.stringify({}) });
  },
};
