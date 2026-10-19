import { HttpResponse } from "msw";
import { http } from "../http";
import { API_BASE_URL } from "@/lib/api/client";
import { SCENARIO_HEADER } from "@/lib/config/scenarios";
import { apiError, latency, scenarioOf } from "../utils";
import { getDb } from "../db";

const ROLE_ME = {
  student: { id: "st-riya", role: "student", name: "Riya Kulkarni", initials: "RK" },
  panelist: { id: "pn-arjun", role: "panelist", name: "Arjun Mehta", initials: "AM" },
  ops: { id: "ops-1", role: "ops", name: "Ops team", initials: "OP" },
} as const;

function roleFromCookie(header: string | null): keyof typeof ROLE_ME {
  const m = header?.match(/prepco_role=(student|panelist|ops)/);
  return (m?.[1] as keyof typeof ROLE_ME | undefined) ?? "student";
}

const isGmail = (email: string) => /@gmail\.com$/i.test(email);

export const authHandlers = [
  http.get(`${API_BASE_URL}/me`, ({ request }) => {
    const role = roleFromCookie(request.headers.get("cookie"));
    const scenario = request.headers.get(SCENARIO_HEADER);
    return HttpResponse.json({ ...ROLE_ME[role], onboarded: scenario !== "first-login" });
  }),

  http.post(`${API_BASE_URL}/auth/sign-in`, async ({ request }) => {
    await latency();
    const { email, password } = (await request.json()) as { email: string; password: string };
    const scenario = scenarioOf(request);
    const e = email.trim().toLowerCase();

    if (e.includes("wrong") || e.startsWith("nobody")) {
      return apiError(404, "no_account", "We could not find an account with that email.");
    }
    if (password === "wrong") {
      return apiError(401, "invalid_credentials", "That password is not right.");
    }
    if (scenario === "gmail-unverified" && isGmail(e)) {
      return apiError(403, "email_unverified", "Verify your email to continue.");
    }
    if (e.startsWith("arjun") || e.startsWith("panelist")) {
      return HttpResponse.json({ role: "panelist", onboarded: true });
    }
    if (e.startsWith("ops")) return HttpResponse.json({ role: "ops", onboarded: true });
    return HttpResponse.json({ role: "student", onboarded: scenario !== "first-login" });
  }),

  http.post(`${API_BASE_URL}/auth/sign-up`, async ({ request }) => {
    await latency();
    const { email } = (await request.json()) as { email: string };
    const scenario = scenarioOf(request);
    const db = getDb(scenario);
    const e = email.trim().toLowerCase();
    if (db.signedUpEmails.has(e) || e === "riya@scmhrd.edu") {
      return apiError(
        409,
        "email_taken",
        "An account with this email already exists. Sign in instead.",
      );
    }
    db.signedUpEmails.add(e);
    return HttpResponse.json({
      role: "student",
      onboarded: false,
      verifyRequired: scenario === "gmail-unverified" && isGmail(e),
    });
  }),

  http.post(`${API_BASE_URL}/auth/forgot`, async () => {
    await latency();
    // Always succeeds so account existence is not revealed.
    return HttpResponse.json({ ok: true });
  }),

  http.post(`${API_BASE_URL}/auth/reset`, async ({ request }) => {
    await latency();
    const { token } = (await request.json()) as { token: string };
    if (token === "expired") {
      return apiError(410, "token_expired", "This reset link has expired. Request a new one.");
    }
    return HttpResponse.json({ ok: true });
  }),
];
