import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/lib/api/client";
import { getDb, buildSlots } from "../db";
import { latency, scenarioOf } from "../utils";

export const onboardingHandlers = [
  http.put(`${API_BASE_URL}/students/me/profile`, async () => {
    await latency();
    return HttpResponse.json({ ok: true });
  }),

  http.post(`${API_BASE_URL}/students/me/cv`, async ({ request }) => {
    // CV reading takes a visible moment.
    await latency();
    await latency();
    if (scenarioOf(request) === "cv-upload-failed") {
      return HttpResponse.json({
        status: "failed",
        reason: "We could not read this file. Try a text-based PDF or a DOCX.",
        extracted: null,
      });
    }
    return HttpResponse.json({
      status: "done",
      reason: null,
      extracted: { roles: 2, bullets: 9, education: "SCMHRD Pune, MBA 2025–27" },
    });
  }),

  http.get(`${API_BASE_URL}/free-session`, async ({ request }) => {
    await latency();
    const db = getDb(scenarioOf(request));
    return HttpResponse.json({
      eligible: !db.freeSessionBookedAt,
      usedAt: db.freeSessionBookedAt,
      slots: buildSlots("free"),
    });
  }),
];
