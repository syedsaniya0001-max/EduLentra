const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "");

if (!configuredApiUrl && !import.meta.env.DEV) {
  throw new Error("Set VITE_API_BASE_URL to the deployed EduLentra API URL.");
}

export const API_BASE_URL =
  configuredApiUrl || (import.meta.env.DEV ? "http://localhost:5000" : "");
