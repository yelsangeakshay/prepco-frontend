import { HttpResponse } from "msw";
import { http } from "../http";
import { API_BASE_URL } from "@/lib/api/client";
import { formatDay, formatSession } from "@/lib/utils/dates";
import type { Runway, Session } from "@/features/runway/schemas";
import { buildSlots, getDb, type Db } from "../db";
import { DAY0_ISO, DAY0_MOVED_ISO, RIYA } from "../fixtures/personas";
import { answerCounts, getState } from "../state";
import { getWorld } from "../world";
import { apiError, latency, paginate, scenarioOf } from "../utils";

const MS_DAY = 86_400_000;
const TODAY = Date.UTC(2026, 9, 5);

function daysUntil(iso: string) {
  const d = new Date(iso);
  // Compare IST calendar dates.
  const ist = new Date(d.getTime() + 5.5 * 3_600_000);
  return Math.round(
    (Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - TODAY) / MS_DAY,
  );
}

const needsAction = (s: Session) =>
  ["upcoming", "rescheduled", "cancelled", "no-show", "unbooked"].includes(s.status);

export function buildRunway(db: Db): Runway {
  const scenario = db.scenario;
  const moved = scenario === "day0-moved";
  const day0Iso = moved ? DAY0_MOVED_ISO : DAY0_ISO;
  const sessions = db.sessions;
  const firstOpen = sessions.find(needsAction);

  const steps: Runway["steps"] = sessions.map((s) => {
    let status: Runway["steps"][number]["status"] = "locked";
    if (s.status === "completed") status = "done";
    else if (s.status === "unbooked" || s.status === "cancelled" || s.status === "no-show") {
      status = "pick-slot";
    } else if ((s.status === "upcoming" || s.status === "rescheduled") && s === firstOpen) {
      status = "next";
    }
    const when =
      s.status === "cancelled"
        ? "Cancelled"
        : s.status === "no-show"
          ? "Missed"
          : s.startsAt
            ? formatDay(s.startsAt)
            : undefined;
    return { id: s.id, week: s.week, title: s.title, when, status, sessionId: s.id };
  });
  steps.push({
    id: "day0",
    week: "Day 0",
    title: "You're in the room",
    when: formatDay(day0Iso),
    status: "day0",
    sessionId: null,
  });

  const done = sessions.filter((s) => s.status === "completed").length;
  const st = getState(scenario);
  const counts = answerCounts(st);
  const firstLogin = scenario === "first-login";
  const late = scenario === "late-joiner";

  const next = firstOpen && firstOpen.status !== "unbooked" ? firstOpen : null;

  return {
    student: {
      name: RIYA.name,
      college: RIYA.college,
      plan: st.plan.name,
      track: RIYA.track,
      target: RIYA.target,
      readiness: firstLogin ? 0 : late ? 38 : RIYA.readiness,
    },
    day0: {
      iso: day0Iso,
      label: formatDay(day0Iso),
      daysLeft: daysUntil(day0Iso),
      movedFrom: moved ? formatDay(DAY0_ISO) : null,
    },
    banner:
      scenario === "placed"
        ? "placed"
        : scenario === "not-placed"
          ? "not-placed"
          : firstLogin
            ? "first-login"
            : late
              ? "late-joiner"
              : moved
                ? "day0-moved"
                : scenario === "returning-student"
                  ? "returning-student"
                  : null,
    steps,
    doneCount: done,
    totalCount: sessions.length,
    nextSession: next,
    tasks: firstLogin
      ? [
          { id: "t1", label: "Book your free session", hint: "Takes 2 minutes", done: false },
          { id: "t2", label: "Upload your CV", hint: "PDF or DOCX, up to 5 MB", done: false },
        ]
      : [
          { id: "t1", label: "Book your deep-dive slot", hint: "Wed 7 Oct · 7:00 PM", done: true },
          {
            id: "t2",
            label: 'Redraft "Why should we hire you as an MT?"',
            hint: "Flagged at P1 · lead with the trade-off, then the number",
            done: false,
          },
          {
            id: "t3",
            label: 'Draft "You mention 400+ outlets. What exactly did you analyse?"',
            hint: "Not drafted · a panel will pull on this bullet",
            done: false,
          },
          {
            id: "t4",
            label: "Pick your P2 slot",
            hint: "Priority booking open until Wed · Premium",
            done: false,
          },
        ],
    cv: firstLogin
      ? { version: "V0", locked: false, score: 0, impact: 0, clarity: 0, defensibility: 0 }
      : {
          version: st.cv.lockedVersion ?? "V0",
          locked: !!st.cv.lockedVersion,
          score: st.cv.lockedScores?.overall ?? 0,
          impact: st.cv.lockedScores?.impact ?? 0,
          clarity: st.cv.lockedScores?.clarity ?? 0,
          defensibility: st.cv.lockedScores?.defensibility ?? 0,
        },
    answers: {
      total: counts.all,
      prepared: counts.rehearsed,
      needWork: counts.flagged,
      flagged:
        (
          st.answers.find((a) => a.status === "flagged" && a.question.includes("MT")) ??
          st.answers.find((a) => a.status === "flagged")
        )?.question ?? null,
    },
    latestPanel: latestPanel(db, scenario),
  };
}

/** Newest feedback note that is visible in this scenario (s05.png). */
function latestPanel(db: Db, scenario: Db["scenario"]) {
  const w = getWorld(scenario);
  const visible = w.feedbacks
    .filter((f) => db.sessions.find((x) => x.id === f.sessionId)?.status === "completed")
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))[0];
  if (!visible) return null;
  const d = new Date(new Date(visible.startsAt).getTime() + 5.5 * 3_600_000);
  const date = `${d.getUTCDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()]}`;
  return {
    feedbackId: visible.panelId,
    label: visible.sessionId === "s-1002" ? "P1" : "Panel",
    date,
    quote: visible.headline,
    panelistLine: `${visible.function} panelist${visible.sentBackToBuilder ? " · 2 answers sent to your builder" : ""}`,
    sentBack: visible.sentBackToBuilder ? 2 : 0,
  };
}

function findSession(db: Db, id: string) {
  return db.sessions.find((s) => s.id === id);
}

export const runwayHandlers = [
  http.get(`${API_BASE_URL}/students/me/runway`, async ({ request }) => {
    await latency();
    return HttpResponse.json(buildRunway(getDb(scenarioOf(request))));
  }),

  http.get(`${API_BASE_URL}/sessions`, async ({ request }) => {
    await latency();
    const db = getDb(scenarioOf(request));
    return HttpResponse.json(paginate(db.sessions, new URL(request.url)));
  }),

  http.get(`${API_BASE_URL}/sessions/:id`, async ({ request, params }) => {
    await latency();
    const s = findSession(getDb(scenarioOf(request)), String(params.id));
    if (!s) return apiError(404, "session_not_found", "We could not find that session.");
    return HttpResponse.json(s);
  }),

  http.get(`${API_BASE_URL}/sessions/:id/slots`, async ({ params }) => {
    await latency();
    return HttpResponse.json({ items: buildSlots(String(params.id)) });
  }),

  http.post(`${API_BASE_URL}/sessions/:id/book`, async ({ request, params }) => {
    await latency();
    const db = getDb(scenarioOf(request));
    const id = String(params.id);
    const { slotId } = (await request.json()) as { slotId: string };
    const slot = buildSlots(id).find((s) => s.id === slotId);
    if (!slot || slot.taken) return apiError(409, "slot_taken", "That slot was just taken.");
    if (slotId.endsWith("-race") && !db.raceHit) {
      db.raceHit = true;
      return apiError(409, "slot_taken", "That slot was just taken.");
    }

    if (id === "free") {
      db.freeSessionBookedAt = slot.startsAt;
      const s: Session = {
        id: "free",
        title: "Free session",
        week: "Free",
        kind: "free",
        startsAt: slot.startsAt,
        status: "upcoming",
        panelist: "Ops team",
        panelFunction: null,
      };
      return HttpResponse.json(s);
    }

    const s = findSession(db, id);
    if (!s) return apiError(404, "session_not_found", "We could not find that session.");
    Object.assign(s, {
      startsAt: slot.startsAt,
      status: "upcoming",
      panelist: s.panelist,
      panelFunction: s.panelFunction,
      note: null,
      freeRescheduleUntil: new Date(
        new Date(slot.startsAt).getTime() - 24 * 3_600_000,
      ).toISOString(),
    });
    return HttpResponse.json(s);
  }),

  http.post(`${API_BASE_URL}/sessions/:id/reschedule`, async ({ request, params }) => {
    await latency();
    const db = getDb(scenarioOf(request));
    const s = findSession(db, String(params.id));
    if (!s) return apiError(404, "session_not_found", "We could not find that session.");
    const { slotId } = (await request.json()) as { slotId: string };
    const slot = buildSlots(s.id).find((x) => x.id === slotId);
    if (!slot || slot.taken) return apiError(409, "slot_taken", "That slot was just taken.");
    Object.assign(s, {
      previousStartsAt: s.startsAt,
      startsAt: slot.startsAt,
      status: "rescheduled",
      note: `Moved to ${formatSession(slot.startsAt)}.`,
    });
    return HttpResponse.json(s);
  }),

  http.post(`${API_BASE_URL}/sessions/:id/cancel`, async ({ request, params }) => {
    await latency();
    const s = findSession(getDb(scenarioOf(request)), String(params.id));
    if (!s) return apiError(404, "session_not_found", "We could not find that session.");
    Object.assign(s, {
      status: "cancelled",
      note: "You cancelled this session. Your credit is kept.",
    });
    return HttpResponse.json(s);
  }),
];
