const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

/** Origin only (no trailing slash, no `/api`). Avoids `.../api/api/...` when paths include `/api`. */
function normalizeApiOrigin(url: string): string {
  return url.replace(/\/+$/, "").replace(/\/api\/?$/i, "");
}

export const API_BASE_URL =
  rawApiBaseUrl && rawApiBaseUrl.length > 0
    ? normalizeApiOrigin(rawApiBaseUrl)
    : "http://localhost:5000";

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
