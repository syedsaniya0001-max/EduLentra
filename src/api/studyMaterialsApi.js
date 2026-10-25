import { API_BASE_URL } from "./config";

export const studyMaterialsApi = {
  async getMine() {
    const token =
      sessionStorage.getItem("edulentraToken") ||
      localStorage.getItem("facultyToken");
    const response = await fetch(`${API_BASE_URL}/api/students/materials`, {
      headers: token ? { Authorization: ["Bearer", token].join(" ") } : {},
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Unable to load study materials.");
    }
    if (!Array.isArray(result.materials)) {
      throw new Error("The study material service returned an invalid response.");
    }
    return result.materials;
  },
};
