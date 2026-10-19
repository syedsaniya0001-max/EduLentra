const productionApiUrl = "https://lms-backend-01-yn35.onrender.com";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : productionApiUrl);
