import { API_BASE_URL } from "./config";

export const studentApi = {
  async getProfile() {
    const token =
      sessionStorage.getItem("edulentraToken") ||
      localStorage.getItem("facultyToken");
    const response = await fetch(`${API_BASE_URL}/api/students/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Unable to load your student profile.");
    }
    if (!result.student || typeof result.student !== "object") {
      throw new Error("The student profile service returned an invalid response.");
    }

    return result.student;
  },
};
