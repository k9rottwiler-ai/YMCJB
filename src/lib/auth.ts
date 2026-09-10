const AUTH_SESSION_KEY = "bidsheet-site-auth-v1";

/** App unlock password (baked at build time). Empty disables the in-app gate. */
export function getConfiguredPassword(): string {
  return String(import.meta.env.VITE_APP_PASSWORD ?? "").trim();
}

export function isAppPasswordEnabled(): boolean {
  return getConfiguredPassword().length > 0;
}

export function isAuthenticated(): boolean {
  if (!isAppPasswordEnabled()) return true;
  try {
    return sessionStorage.getItem(AUTH_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAuthSession(): void {
  sessionStorage.setItem(AUTH_SESSION_KEY, "1");
}

export function clearAuthSession(): void {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}

export function verifyPassword(candidate: string): boolean {
  const expected = getConfiguredPassword();
  if (!expected) return true;
  return candidate === expected;
}

export { AUTH_SESSION_KEY };
