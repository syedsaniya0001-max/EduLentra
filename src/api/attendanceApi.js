import { API_BASE_URL } from "./config";

async function request(path) {
  const token =
    sessionStorage.getItem("edulentraToken") ||
    localStorage.getItem("facultyToken");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: ["Bearer", token].join(" ") } : {},
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Unable to load attendance.");
  }
  return result;
}

export const attendanceApi = {
  async getMine() {
    const result = await request("/api/students/attendance");
    if (!result.summary || !Array.isArray(result.subjects) || !Array.isArray(result.records)) {
      throw new Error("The student attendance service returned an invalid response.");
    }
    return result;
  },

  async getDepartment() {
    const result = await request("/api/hod/attendance");
    if (!result.summary || !Array.isArray(result.students)) {
      throw new Error("The department attendance service returned an invalid response.");
    }
    return result;
  },
};
