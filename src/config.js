// Centralized API configuration
// HTTPS Tunnel URL points securely to AWS EC2 backend (resolving Vercel HTTPS Mixed Content blocking)
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://draft-wash-fees-toolbar.trycloudflare.com";
