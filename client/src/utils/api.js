export const API_ORIGIN =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:5000`;
export const API_BASE = `${API_ORIGIN}/api`;

export const apiUrl = (path) => `${API_BASE}${path}`;

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/420x560?text=No+Image";

export const assetUrl = (path) => {
  if (!path || typeof path !== "string") return PLACEHOLDER_IMAGE;
  const normalized = path.trim();
  if (normalized === "") return PLACEHOLDER_IMAGE;
  if (normalized.startsWith("/uploads") || normalized.includes("/uploads/")) {
    return `${API_ORIGIN}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
  }
  return normalized;
};
