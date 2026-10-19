import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isRole, ROLE_COOKIE, ROLE_HOME, SCENARIO_COOKIE, type Role } from "./roles";
import { ROUTES } from "@/lib/config/routes";

/** Server-side mock session: reads the dev `prepco_role` cookie. */
export async function getRole(): Promise<Role | null> {
  const value = (await cookies()).get(ROLE_COOKIE)?.value;
  return isRole(value) ? value : null;
}

export async function getScenario(): Promise<string | null> {
  return (await cookies()).get(SCENARIO_COOKIE)?.value ?? null;
}

/** Role layouts call this again, so a bypassed middleware still cannot leak a screen. */
export async function requireRole(expected: Role): Promise<Role> {
  const role = await getRole();
  if (!role) redirect(ROUTES.signIn);
  if (role !== expected) redirect(ROLE_HOME[role]);
  return role;
}
