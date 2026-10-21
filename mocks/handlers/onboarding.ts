import { HttpResponse } from "msw";
import { http } from "../http";
import { API_BASE_URL } from "@/lib/api/client";
import { getDb, buildSlots } from "../db";
import { latency, scenarioOf } from "../utils";

const SUMMARY = {
  headline: "Strong raw material. Not yet defensible.",
  lede: "Two years of real field work, but your CV describes activity, not decisions. A panel will spend its time asking what you actually did. The fix is in the bullets, not the experience.",
  ledeShort:
    "Your CV describes activity, not decisions. The fix is in the bullets, not the experience.",
  roles: [
    { title: "Sales & Marketing MT", note: "FMCG and consumer durables" },
    { title: "Trade marketing associate", note: "Your outlet-level work fits directly" },
    { title: "Business analytics, retail", note: "Only if you can defend the method" },
  ],
  markups: [
    {
      quote: "Worked on identifying retail expansion opportunities in West Delhi.",
      ask: "how many outlets, what method, and what changed because of it?",
      askShort: "how many outlets, what method, what changed?",
    },
    {
      quote:
        "Worked on a marketing campaign for the flagship product and coordinated with the design team.",
      ask: 'what did you decide? "Coordinated" is not a decision.',
      askShort: 'what did you decide? "Coordinated" is not a decision.',
    },
    {
      quote: "Strong communication and leadership skills.",
      ask: "nothing. They'll skip it. Cut the line.",
      askShort: "nothing. They'll skip it. Cut the line.",
    },
  ],
  answers: [
    {
      question: "Walk me through your profile.",
      verdict: "landed",
      note: "Clear structure. Ran long; cut to 90 seconds and end on why sales.",
    },
    {
      question: "Why Sales & Marketing?",
      verdict: "needs-work",
      note: "Generic. Tie it to the outlet work you already did and what you want to own next.",
    },
  ],
  runway: "Premium, finals track: profiling call and CV lock from Week -8.",
} as const;

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
        reason: "Looks like a photo or scanned page",
        extracted: null,
      });
    }
    return HttpResponse.json({
      status: "done",
      reason: null,
      extracted: { education: 2, workBullets: 4, projects: 2, achievements: 3, score: 46 },
    });
  }),

  http.get(`${API_BASE_URL}/free-session`, async ({ request }) => {
    await latency();
    const db = getDb(scenarioOf(request));
    return HttpResponse.json({
      eligible: !db.freeSessionBookedAt,
      usedAt: db.freeSessionBookedAt,
      summary: db.freeSessionBookedAt ? SUMMARY : null,
      slots: buildSlots("free"),
    });
  }),
];
