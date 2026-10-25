import { API_BASE_URL } from "./config";

export const hodProfileApi = {
  async update(profile) {
    const token = sessionStorage.getItem("edulentraToken");
    const response = await fetch(`${API_BASE_URL}/api/hod/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(profile),
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Unable to update your HOD profile.");
    }
    if (
      !result.user?.name ||
      !result.user?.username ||
      typeof result.user.email !== "string" ||
      typeof result.user.department !== "string"
    ) {
      throw new Error("The profile service returned an invalid response.");
    }
    return result;
  },
};
