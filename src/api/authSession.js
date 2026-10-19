const TOKEN_KEY = "edulentraToken";
const USER_KEY = "edulentraUser";

export function storeAuthSession(result, expectedRole) {
  if (
    !result?.token ||
    !result?.role ||
    !result?.user ||
    (expectedRole && result.role !== expectedRole)
  ) {
    throw new Error("The login response did not include a complete session.");
  }

  localStorage.removeItem("facultyToken");
  sessionStorage.setItem(TOKEN_KEY, result.token);
  sessionStorage.setItem(
    USER_KEY,
    JSON.stringify({ ...result.user, role: result.role })
  );

  if (result.role === "faculty") {
    localStorage.setItem("facultyToken", result.token);
  }
}

export function clearAuthSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem("facultyToken");
}

export function hasRoleSession(role) {
  const token =
    sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem("facultyToken");
  if (!token) return false;

  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY) || "null")?.role === role;
  } catch {
    return false;
  }
}
