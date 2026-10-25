import { API_BASE_URL } from "./config";

export const hodDashboardApi = {
  async get() {
    const token =
      sessionStorage.getItem("edulentraToken") ||
      localStorage.getItem("facultyToken");
    const response = await fetch(`${API_BASE_URL}/api/hod/dashboard`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Unable to load department dashboard.");
    }

    if (
      !result.statistics ||
      !Array.isArray(result.recentActivities)
    ) {
      throw new Error("The dashboard service returned an invalid response.");
    }

    return result;
  },
};
