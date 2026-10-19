import { ONBOARDED_COOKIE, ROLE_COOKIE, type Role } from "./roles";

/** Mock session cookies. A real backend sets an httpOnly cookie instead; tokens never go in localStorage. */
function write(name: string, value: string | null) {
  document.cookie = value
    ? `${name}=${value}; path=/; SameSite=Lax`
    : `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function startMockSession(role: Role, onboarded: boolean) {
  write(ROLE_COOKIE, role);
  write(ONBOARDED_COOKIE, onboarded ? "1" : "0");
}

export function endMockSession() {
  write(ROLE_COOKIE, null);
  write(ONBOARDED_COOKIE, null);
}

export function markOnboarded() {
  write(ONBOARDED_COOKIE, "1");
}
