import { API_BASE_URL } from "./config";

async function request(path, options = {}) {
  const token = sessionStorage.getItem("edulentraToken");
  const response = await fetch(`${API_BASE_URL}/api/hod/notifications${path}`, {
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
    throw new Error(result.message || "HOD notification request failed.");
  }
  return result;
}

export const hodNotificationsApi = {
  async getMine() {
    const result = await request("");
    if (
      !Array.isArray(result.notifications) ||
      result.notifications.some(
        (notification) =>
          !notification.id ||
          !notification.title ||
          !notification.text ||
          !notification.target?.startsWith("/hod/")
      )
    ) {
      throw new Error("The HOD notification service returned an invalid response.");
    }
    return result.notifications;
  },

  markRead(id) {
    return request(`/${encodeURIComponent(id)}/read`, { method: "PATCH" });
  },

  markAllRead() {
    return request("/read", { method: "PATCH" });
  },
};
