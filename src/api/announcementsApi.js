import { API_BASE_URL } from "./config";
import { io } from "socket.io-client";

async function request(path, options = {}) {
  const token =
    sessionStorage.getItem("edulentraToken") ||
    localStorage.getItem("facultyToken");
  const response = await fetch(`${API_BASE_URL}/api/announcements${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Announcement request failed.");
  }

  return result;
}

function subscribeToAnnouncementUpdates(onChange, onError) {
  if (typeof onChange !== "function") {
    throw new TypeError("An announcement update callback is required.");
  }

  const token =
    sessionStorage.getItem("edulentraToken") ||
    localStorage.getItem("facultyToken");
  if (!token) {
    onError?.(new Error("Authentication is required for live announcement updates."));
    return () => {};
  }

  const socket = io(API_BASE_URL, {
    autoConnect: false,
    auth: { token },
  });
  socket.on("announcements:changed", onChange);
  if (onError) socket.on("connect_error", onError);
  const refreshTimer = window.setInterval(onChange, 60_000);
  socket.connect();

  return () => {
    socket.off("announcements:changed", onChange);
    if (onError) socket.off("connect_error", onError);
    window.clearInterval(refreshTimer);
    socket.disconnect();
  };
}

const serializeAnnouncement = (announcement) => {
  const { publishAt, expiresAt, ...fields } = announcement;
  return {
    ...fields,
    publishAt: publishAt ? new Date(publishAt).toISOString() : null,
    expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
  };
};

export function toLocalDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

export const announcementsApi = {
  subscribeToAnnouncementUpdates,

  async getAll() {
    const result = await request("");
    if (!Array.isArray(result.announcements)) {
      throw new Error("The announcement service returned an invalid response.");
    }
    return result.announcements;
  },

  async create(announcement) {
    const result = await request("", {
      method: "POST",
      body: JSON.stringify(serializeAnnouncement(announcement)),
    });
    if (!result.announcement) {
      throw new Error("The announcement service did not confirm publishing.");
    }
    return result.announcement;
  },

  async update(id, announcement) {
    const result = await request(`/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(serializeAnnouncement(announcement)),
    });
    if (!result.announcement) {
      throw new Error("The announcement service did not confirm the update.");
    }
    return result.announcement;
  },

  async remove(id) {
    return request(`/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};

export function announcementAudienceLabel(announcement) {
  const roleLabels = {
    ALL: "Everyone",
    STUDENT: "Students",
    FACULTY: "Faculty",
    HOD: "HODs",
    ADMIN: "Admins",
  };
  const audience = roleLabels[announcement.targetRole] || "Selected audience";
  return announcement.targetDepartment
    ? `${audience} · ${announcement.targetDepartment}`
    : audience;
}
