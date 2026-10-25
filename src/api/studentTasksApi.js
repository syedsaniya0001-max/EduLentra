import { API_BASE_URL } from "./config";

async function request(path, options = {}) {
  const token = sessionStorage.getItem("edulentraToken");
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
    throw new Error(result.message || "Planner service request failed.");
  }
  return result;
}

export const studentTasksApi = {
  async getMine() {
    const result = await request("/api/students/tasks");
    if (!Array.isArray(result.tasks)) {
      throw new Error("The planner service returned an invalid response.");
    }
    return result.tasks;
  },

  async create(task) {
    const result = await request("/api/students/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
    if (!result.task?.id) {
      throw new Error("The planner service returned an invalid task.");
    }
    return result.task;
  },

  async setCompletion(taskId, completed) {
    const result = await request(
      `/api/students/tasks/${encodeURIComponent(taskId)}/completion`,
      {
        method: "PATCH",
        body: JSON.stringify({ completed }),
      }
    );
    if (!result.task?.id) {
      throw new Error("The planner service returned an invalid task.");
    }
    return result.task;
  },

  async remove(taskId) {
    return request(`/api/students/tasks/${encodeURIComponent(taskId)}`, {
      method: "DELETE",
    });
  },
};
