import { API_BASE_URL } from "./config";

const getToken = () =>
  sessionStorage.getItem("edulentraToken") ||
  localStorage.getItem("facultyToken");

const request = async (path, options = {}) => {
  const token = getToken();
  if (!token) {
    throw new Error("Please sign in with an authorized account to review requests.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Unable to process the approval request.");
  }

  return result;
};

const queuePaths = {
  student: "/api/students/requests",
  faculty: "/api/faculty-approval/requests",
  hod: "/api/hod-approval/requests",
};

const directoryPaths = {
  students: "/api/students",
  faculty: "/api/faculty",
  hod: "/api/hod",
};

export const roleApprovalApi = {
  list: (role) => request(queuePaths[role]),

  directory: (role) => request(directoryPaths[role]),

  decide: (role, requestId, decision, rejectionReason = "") => {
    const action = decision === "APPROVED" ? "approve" : "reject";
    return request(`${queuePaths[role]}/${requestId}/${action}`, {
      method: "PUT",
      body: JSON.stringify({ rejectionReason }),
    });
  },
};
