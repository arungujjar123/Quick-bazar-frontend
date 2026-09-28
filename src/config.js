// Centralized API configuration
// In production (Vercel), set REACT_APP_API_BASE_URL environment variable to your EC2 backend URL
// In development, defaults to localhost:5000
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "http://51.20.181.12:5000"
    : "http://localhost:5000");
