export type Role = "student" | "panelist" | "ops";

export const ROLE_COOKIE = "prepco_role";
export const SCENARIO_COOKIE = "prepco_scenario";

export const ROLES: readonly Role[] = ["student", "panelist", "ops"];

export const ROLE_HOME: Record<Role, string> = {
  student: "/home",
  panelist: "/panelist/today",
  ops: "/ops",
};

export const ROLE_LABEL: Record<Role, string> = {
  student: "Student · Riya",
  panelist: "Panelist · Arjun",
  ops: "Ops",
};

export function isRole(value: unknown): value is Role {
  return value === "student" || value === "panelist" || value === "ops";
}

/** Public routes need no session. */
export const PUBLIC_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/panelist/apply",
  "/maintenance",
] as const;

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Which role owns a (non-public) pathname. */
export function roleForPath(pathname: string): Role {
  if (pathname === "/panelist" || pathname.startsWith("/panelist/")) return "panelist";
  if (pathname === "/ops" || pathname.startsWith("/ops/")) return "ops";
  return "student";
}
