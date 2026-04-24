// ── Token ──────────────────────────────────────────────────────────────────
export const saveToken = (token: string): void => {
  localStorage.setItem("carelink_token", token);
};

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("carelink_token");
};

export const removeToken = (): void => {
  localStorage.removeItem("carelink_token");
};

// ── Role ───────────────────────────────────────────────────────────────────
export const saveRole = (role: string): void => {
  localStorage.setItem("carelink_role", role);
};

export const getRole = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("carelink_role");
};

export const removeRole = (): void => {
  localStorage.removeItem("carelink_role");
};

// ── Profile ────────────────────────────────────────────────────────────────
export const saveProfile = (profile: Record<string, unknown>): void => {
  localStorage.setItem("carelink_profile", JSON.stringify(profile));
};

export const getProfile = (): Record<string, unknown> | null => {
  if (typeof window === "undefined") return null;
  const p = localStorage.getItem("carelink_profile");
  return p ? JSON.parse(p) : null;
};

export const removeProfile = (): void => {
  localStorage.removeItem("carelink_profile");
};

// ── Helpers ────────────────────────────────────────────────────────────────
export const isLoggedIn = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!getToken();
};

export const clearAuth = (): void => {
  removeToken();
  removeRole();
  removeProfile();
};

// ── Used for every authenticated API call ──────────────────────────────────
export const getAuthHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken() ?? ""}`,
});