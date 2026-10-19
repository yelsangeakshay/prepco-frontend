import { redirect } from "next/navigation";
import { ROLE_HOME } from "@/lib/auth/roles";
import { getRole } from "@/lib/auth/session";
import { ROUTES } from "@/lib/config/routes";

/** Middleware normally redirects first; this is the fallback. */
export default async function RootPage() {
  const role = await getRole();
  redirect(role ? ROLE_HOME[role] : ROUTES.signIn);
}
