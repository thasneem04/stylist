export const API_ORIGIN = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
export const API_BASE = `${API_ORIGIN}/api`;

export const apiUrl = (path) => `${API_BASE}${path}`;

export const assetUrl = (path) => (
  path?.startsWith('/uploads') ? `${API_ORIGIN}${path}` : path
);
