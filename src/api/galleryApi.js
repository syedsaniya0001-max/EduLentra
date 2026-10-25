import { API_BASE_URL } from "./config";

async function request(path, options = {}) {
  const token = sessionStorage.getItem("edulentraToken");
  const response = await fetch(`${API_BASE_URL}/api/gallery${path}`, {
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
    throw new Error(result.message || "Gallery service request failed.");
  }
  return result;
}

export const galleryApi = {
  async getAll() {
    const result = await request("");
    if (!Array.isArray(result.posts)) {
      throw new Error("The gallery service returned an invalid response.");
    }
    return result.posts;
  },

  async create(post) {
    const result = await request("", {
      method: "POST",
      body: JSON.stringify(post),
    });
    if (!result.post?.id) {
      throw new Error("The gallery service did not confirm publishing.");
    }
    return result.post;
  },

  async remove(id) {
    return request(`/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};
