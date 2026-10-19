import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/lib/api/client";
import { SCENARIO_HEADER } from "@/lib/config/scenarios";

const ROLE_ME = {
  student: { id: "st-riya", role: "student", name: "Riya Kulkarni", initials: "RK" },
  panelist: { id: "pn-arjun", role: "panelist", name: "Arjun Mehta", initials: "AM" },
  ops: { id: "ops-1", role: "ops", name: "Ops team", initials: "OP" },
} as const;

function roleFromCookie(header: string | null): keyof typeof ROLE_ME {
  const m = header?.match(/prepco_role=(student|panelist|ops)/);
  return (m?.[1] as keyof typeof ROLE_ME | undefined) ?? "student";
}

export const authHandlers = [
  http.get(`${API_BASE_URL}/me`, ({ request }) => {
    const role = roleFromCookie(request.headers.get("cookie"));
    const scenario = request.headers.get(SCENARIO_HEADER);
    return HttpResponse.json({ ...ROLE_ME[role], onboarded: scenario !== "first-login" });
  }),
];
