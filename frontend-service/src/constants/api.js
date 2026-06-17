// API endpoints
export const API_ENDPOINTS = {
  DEVICES: "/api/devices",
  TELEMETRY: "/api/telemetry",
  RULES: "/api/rules",
  ALERTS: "/api/alerts",
};

// Default API configuration
export const DEFAULT_API_URL =
  process.env.VITE_API_URL || "http://localhost:3000";
