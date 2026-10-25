import { API_BASE_URL } from "./config";

export const hodReportsApi = {
  async get() {
    const token =
      sessionStorage.getItem("edulentraToken") ||
      localStorage.getItem("facultyToken");
    const response = await fetch(`${API_BASE_URL}/api/hod/reports`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Unable to load department report data.");
    }
    if (
      !result.summary ||
      !Array.isArray(result.students) ||
      !Array.isArray(result.faculty)
    ) {
      throw new Error("The department report service returned an invalid response.");
    }
    return result;
  },
};
