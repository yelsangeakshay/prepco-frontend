import { NextResponse, type NextRequest } from "next/server";
import {
  isPublicPath,
  isRole,
  ONBOARDED_COOKIE,
  ROLE_COOKIE,
  ROLE_HOME,
  roleForPath,
  SCENARIO_COOKIE,
} from "@/lib/auth/roles";
import { isScenario } from "@/lib/config/scenarios";
import { ROUTES } from "@/lib/config/routes";

/**
 * Mock auth guard (dev only, cookie based).
 * - signed out        -> /sign-in
 * - cross-role route  -> own role home
 * - signed in on sign-in/up -> own role home
 * - first-login       -> /onboarding/1 for students
 * - ?scenario=<name>  -> persisted in the prepco_scenario cookie
 */
export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const cookieRole = req.cookies.get(ROLE_COOKIE)?.value;
  const role = isRole(cookieRole) ? cookieRole : null;

  const param = searchParams.get("scenario");
  const scenario = isScenario(param) ? param : (req.cookies.get(SCENARIO_COOKIE)?.value ?? null);

  const redirect = (to: string) => {
    const res = NextResponse.redirect(new URL(to, req.url));
    if (isScenario(param)) res.cookies.set(SCENARIO_COOKIE, param, { path: "/" });
    return res;
  };

  let res: NextResponse | null = null;

  if (pathname === "/") {
    res = redirect(role ? ROLE_HOME[role] : ROUTES.signIn);
  } else if (role && (pathname === ROUTES.signIn || pathname === ROUTES.signUp)) {
    // Already signed in: the auth pages have nothing to offer.
    res = redirect(ROLE_HOME[role]);
  } else if (!isPublicPath(pathname)) {
    if (!role) {
      res = redirect(ROUTES.signIn);
    } else if (roleForPath(pathname) !== role) {
      res = redirect(ROLE_HOME[role]);
    } else if (
      role === "student" &&
      ((scenario === "first-login" && req.cookies.get(ONBOARDED_COOKIE)?.value !== "1") ||
        req.cookies.get(ONBOARDED_COOKIE)?.value === "0") &&
      !pathname.startsWith("/onboarding")
    ) {
      res = redirect(ROUTES.student.onboarding(1));
    }
  }

  if (!res) {
    res = NextResponse.next();
    if (isScenario(param)) res.cookies.set(SCENARIO_COOKIE, param, { path: "/" });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|mockServiceWorker.js|.*\\..*).*)"],
};
