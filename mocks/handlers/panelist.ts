import { HttpResponse } from "msw";
import { http } from "../http";
import { API_BASE_URL } from "@/lib/api/client";
import type { PanelItem } from "@/features/panelist/schemas";
import type { FeedbackDetail } from "@/features/feedback/schemas";
import { getDb } from "../db";
import { saveSnapshot } from "../persist";
import { ARJUN } from "../fixtures/personas";
import { getState } from "../state";
import { apiError, latency, scenarioOf } from "../utils";
import {
  allBookings,
  allStudents,
  findBooking,
  getWorld,
  slotKey,
  type BookingRec,
} from "../world";
import type { Scenario } from "@/lib/config/scenarios";

const ME = "pn-arjun";
const NOW = "2026-10-05T12:00:00+05:30";
const TODAY = "2026-10-05";

/** IST calendar date of an ISO time. */
const istDate = (iso: string) =>
  new Date(new Date(iso).getTime() + 5.5 * 3_600_000).toISOString().slice(0, 10);

function toItem(
  scenario: Scenario | null,
  x: BookingRec,
  byId: Map<string, ReturnType<typeof allStudents>[number]>,
): PanelItem {
  const s = byId.get(x.studentId);
  return {
    sessionId: x.id,
    studentId: x.studentId,
    studentName: x.studentName,
    plan: s
      ? `${s.plan === "none" ? "Free" : s.plan[0]!.toUpperCase() + s.plan.slice(1)} · ${s.track}`
      : "",
    college: s?.college ?? "",
    target: s?.function ?? x.function,
    title: x.title,
    startsAt: x.startsAt ?? NOW,
    status: x.scored ? "scored" : x.status === "completed" ? "awaiting-score" : "upcoming",
    verdict: x.verdict,
    briefRead: !!getWorld(scenario).briefsRead[x.id],
    dueLabel: x.status === "completed" && !x.scored ? dueLabel(x.startsAt) : null,
  };
}

/** Feedback is due three days after the panel. */
function dueLabel(startsAt: string | null) {
  if (!startsAt) return null;
  const days = Math.round(
    (Date.parse(`${TODAY}T00:00:00Z`) - Date.parse(`${istDate(startsAt)}T00:00:00Z`)) / 86_400_000,
  );
  if (days > 3) return "Overdue";
  if (days === 3) return "Due today";
  if (days === 2) return "Due tomorrow";
  if (days === 1) return "Due in 2 days";
  return "Due in 2 days";
}

function mine(scenario: Scenario | null) {
  const students = new Map(allStudents(scenario).map((s) => [s.id, s]));
  const items = allBookings(scenario)
    .filter((x) => x.panelistId === ME && (x.status === "upcoming" || x.status === "completed"))
    .map((x) => toItem(scenario, x, students));
  return items;
}

const byTime = (a: PanelItem, b: PanelItem) => a.startsAt.localeCompare(b.startsAt);

function brief(scenario: Scenario | null, x: BookingRec) {
  const w = getWorld(scenario);
  const st = getState(scenario);
  const student = allStudents(scenario).find((s) => s.id === x.studentId)!;
  const isRiya = x.source === "live";

  const cvHighlights = isRiya
    ? st.cv.sections
        .flatMap((s) => s.bullets)
        .filter((b) => b.hasNumber && b.hasDecision)
        .slice(0, 3)
        .map((b) => b.text)
    : [
        `${student.background}, then an MBA at ${student.college}`,
        `Targeting ${student.function}`,
        `CV score ${student.cvScore}`,
      ];

  const answersToProbe = isRiya
    ? st.answers
        .filter((a) => a.status === "flagged")
        .slice(0, 3)
        .map((a) => ({ question: a.question, why: a.critique ?? "Flagged for more work." }))
    : [
        { question: "Tell me about a failure", why: "Draft has no number and no lesson." },
        { question: "Why this function?", why: "Motivation reads generic." },
        { question: "Tell me about a trade-off you made", why: "Cost of the choice is missing." },
      ];

  const prev = isRiya
    ? [...w.feedbacks].sort((a, b) => b.startsAt.localeCompare(a.startsAt))[0]
    : undefined;

  return {
    sessionId: x.id,
    title: x.title,
    startsAt: x.startsAt ?? NOW,
    student: {
      id: student.id,
      name: student.name,
      college: student.college,
      track: student.track,
      target: student.function,
      background: student.background,
      readiness: student.readiness,
    },
    cvHighlights,
    answersToProbe,
    previousFeedback: prev
      ? { panelist: prev.panelist, verdict: prev.verdict, headline: prev.headline }
      : null,
    suggestedQuestions: [
      `Why ${student.function} and not another function?`,
      "Walk me through the decision you are proudest of. What did it cost?",
      "What would you do differently in your first 90 days?",
    ],
  };
}

export const panelistHandlers = [
  http.get(`${API_BASE_URL}/panelist/today`, async ({ request }) => {
    await latency();
    const scenario = scenarioOf(request);
    const w = getWorld(scenario);
    const me = w.panelists.find((p) => p.id === ME)!;
    const items = mine(scenario);
    const today = items
      .filter((i) => i.status === "upcoming" && istDate(i.startsAt) === TODAY)
      .sort(byTime);
    const upcoming = items
      .filter((i) => i.status === "upcoming" && istDate(i.startsAt) > TODAY)
      .sort(byTime);
    const awaitingScore = items.filter((i) => i.status === "awaiting-score").sort(byTime);
    return HttpResponse.json({
      panelist: {
        name: me.name,
        function: me.function,
        specialty: me.specialty,
        panelsThisSeason: items.filter((i) => i.status === "scored").length,
      },
      today,
      upcoming: upcoming.slice(0, 10),
      awaitingScore,
      stats: {
        rating: me.rating,
        feedbackOnTimePct: awaitingScore.length ? 88 : 100,
        unscored: awaitingScore.length,
      },
    });
  }),

  http.get(`${API_BASE_URL}/panelist/briefs`, async ({ request }) => {
    await latency();
    const items = mine(scenarioOf(request))
      .filter((i) => i.status === "upcoming")
      .sort(byTime);
    return HttpResponse.json({ items });
  }),

  http.get(`${API_BASE_URL}/briefs/:sessionId`, async ({ request, params }) => {
    await latency();
    const scenario = scenarioOf(request);
    const x = findBooking(scenario, String(params.sessionId));
    if (!x || x.panelistId !== ME) {
      return apiError(404, "brief_not_found", "We could not find a brief for that session.");
    }
    getWorld(scenario).briefsRead[x.id] = true;
    saveSnapshot();
    return HttpResponse.json(brief(scenario, x));
  }),

  http.get(`${API_BASE_URL}/panelist/scoring`, async ({ request }) => {
    await latency();
    const items = mine(scenarioOf(request));
    return HttpResponse.json({
      awaiting: items
        .filter(
          (i) =>
            i.status === "awaiting-score" ||
            (i.status === "upcoming" && istDate(i.startsAt) <= TODAY),
        )
        .sort(byTime),
      done: items
        .filter((i) => i.status === "scored")
        .sort((a, b) => byTime(b, a))
        .slice(0, 15),
    });
  }),

  http.post(`${API_BASE_URL}/scores/:sessionId`, async ({ request, params }) => {
    await latency();
    const scenario = scenarioOf(request);
    const w = getWorld(scenario);
    const x = findBooking(scenario, String(params.sessionId));
    if (!x || x.panelistId !== ME) {
      return apiError(403, "not_your_panel", "You can only score panels assigned to you.");
    }
    if (x.scored) return apiError(409, "already_scored", "This panel is already scored.");

    const body = (await request.json()) as {
      scores: Record<string, number>;
      verdict: string;
      note: string;
      sendBack: boolean;
    };
    w.counter += 1;
    const feedbackId = `p-${1001 + w.counter}`;
    w.scores[x.id] = {
      sessionId: x.id,
      panelistId: ME,
      scores: body.scores,
      verdict: body.verdict,
      note: body.note,
      sendBack: body.sendBack,
      scoredAt: NOW,
      feedbackId,
    };

    if (x.source === "live") {
      const db = getDb(scenario);
      const st = getState(scenario);
      const s = db.sessions.find((y) => y.id === x.id)!;
      Object.assign(s, { status: "completed", feedbackId });
      const fb: FeedbackDetail = {
        panelId: feedbackId,
        sessionId: x.id,
        panelist: ARJUN.name,
        function: ARJUN.function,
        startsAt: x.startsAt ?? NOW,
        verdict: body.verdict,
        headline: body.note.split(/[.!?]/)[0]!.slice(0, 90),
        note: body.note,
        scores: Object.entries(body.scores).map(([label, v]) => ({ label, value: v * 20 })),
        sentBackToBuilder: body.sendBack,
      };
      w.feedbacks.push(fb);
      if (body.sendBack) {
        let n = 0;
        for (const a of st.answers) {
          if (n >= 2) break;
          if (a.status === "rehearsed") {
            a.status = "flagged";
            a.critique = `${ARJUN.name} sent this back: rework it before your next panel.`;
            n++;
          }
        }
      }
      st.notifications.unshift({
        id: `n-fb-${feedbackId}`,
        kind: "feedback",
        title: `${ARJUN.name} sent your feedback`,
        body: body.sendBack
          ? "He sent you back to the builders. Check your flagged answers."
          : fb.headline,
        at: NOW,
        read: false,
        href: `/feedback/${feedbackId}`,
      });
    } else {
      x.scored = true;
      x.verdict = body.verdict;
      x.status = "completed";
    }
    return HttpResponse.json({ ok: true, feedbackId, sentBack: body.sendBack });
  }),

  http.get(`${API_BASE_URL}/availability`, async ({ request }) => {
    await latency();
    const scenario = scenarioOf(request);
    const w = getWorld(scenario);
    const booked = allBookings(scenario)
      .filter((x) => x.panelistId === ME && x.status === "upcoming" && x.startsAt)
      .map((x) => slotKey(x.startsAt!));
    // A booked panel always counts as an open slot, so the grid never contradicts the calendar.
    const slots = {
      ...(w.availability[ME] ?? {}),
      ...Object.fromEntries(booked.map((k) => [k, true])),
    };
    return HttpResponse.json({ slots, booked: [...new Set(booked)] });
  }),

  http.put(`${API_BASE_URL}/availability`, async ({ request }) => {
    await latency();
    const scenario = scenarioOf(request);
    const w = getWorld(scenario);
    const body = (await request.json()) as { slots: Record<string, boolean> };
    const booked = new Set(
      allBookings(scenario)
        .filter((x) => x.panelistId === ME && x.status === "upcoming" && x.startsAt)
        .map((x) => slotKey(x.startsAt!)),
    );
    for (const k of booked) {
      if (!body.slots[k]) {
        return apiError(
          409,
          "slot_booked",
          `${k.replace("-", " ")} has a panel booked. Ask ops to move it first.`,
        );
      }
    }
    w.availability[ME] = Object.fromEntries(Object.entries(body.slots).filter(([, v]) => v));
    return HttpResponse.json({ slots: w.availability[ME], booked: [...booked] });
  }),

  http.post(`${API_BASE_URL}/panelist/applications`, async ({ request }) => {
    await latency();
    const w = getWorld(scenarioOf(request));
    const b = (await request.json()) as {
      name: string;
      email: string;
      function: string;
      company: string;
      role: string;
      years: number;
      why: string;
    };
    if (w.applications.some((a) => a.email.toLowerCase() === b.email.toLowerCase())) {
      return apiError(409, "already_applied", "An application with this email already exists.");
    }
    const id = `app-${String(w.applications.length + 1).padStart(3, "0")}`;
    w.applications.unshift({
      id,
      name: b.name,
      email: b.email,
      function: b.function,
      company: b.company,
      role: b.role,
      years: Number(b.years),
      why: b.why,
      submittedAt: NOW,
      status: "pending",
    });
    return HttpResponse.json({ id, status: "received" });
  }),

  http.get(`${API_BASE_URL}/panelist/profile`, async ({ request }) => {
    await latency();
    const me = getWorld(scenarioOf(request)).panelists.find((p) => p.id === ME)!;
    return HttpResponse.json({
      name: me.name,
      email: me.email,
      function: me.function,
      specialty: me.specialty,
      company: me.company,
      role: me.role,
      bio: me.bio,
    });
  }),

  http.put(`${API_BASE_URL}/panelist/profile`, async ({ request }) => {
    await latency();
    const me = getWorld(scenarioOf(request)).panelists.find((p) => p.id === ME)!;
    Object.assign(me, await request.json());
    return HttpResponse.json({ ok: true });
  }),
];
