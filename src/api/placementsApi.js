import { API_BASE_URL } from "./config";

async function request(path, options = {}) {
  const token =
    sessionStorage.getItem("edulentraToken") ||
    localStorage.getItem("facultyToken");
  const response = await fetch(`${API_BASE_URL}/api/placements${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: ["Bearer", token].join(" ") } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Placement service request failed.");
  }
  return result;
}

const mapPlacement = (placement) => ({
  ...placement,
  id: placement._id || placement.id,
  company: placement.companyName || placement.company || "",
  role: placement.jobRole || placement.role || "",
  branch: placement.branch || "All",
  location: placement.location || "",
  package: placement.package || "",
  deadline: placement.applicationDeadline
    ? new Date(placement.applicationDeadline).toISOString().slice(0, 10)
    : placement.deadline || "",
});

export const placementsApi = {
  async getAll() {
    const result = await request("");
    if (!Array.isArray(result.placements)) {
      throw new Error("The placement service returned an invalid response.");
    }
    return result.placements.map(mapPlacement);
  },

  async create(placement) {
    const result = await request("", {
      method: "POST",
      body: JSON.stringify(placement),
    });
    if (!result.placement) {
      throw new Error("The placement service did not confirm publishing.");
    }
    return mapPlacement(result.placement);
  },

  async remove(id) {
    return request(`/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};
