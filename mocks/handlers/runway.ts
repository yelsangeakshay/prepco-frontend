import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/lib/api/client";
import { formatDay, formatSession } from "@/lib/utils/dates";
import type { Runway, Session } from "@/features/runway/schemas";
import { buildSlots, getDb, type Db } from "../db";
import { DAY0_ISO, DAY0_MOVED_ISO, RIYA } from "../fixtures/personas";
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
    title: "Placement day",
    when: formatDay(day0Iso),
    status: "day0",
    sessionId: null,
  });

  const done = sessions.filter((s) => s.status === "completed").length;
  const firstLogin = scenario === "first-login";
  const late = scenario === "late-joiner";

  const next = firstOpen && firstOpen.status !== "unbooked" ? firstOpen : null;

  return {
    student: {
      name: RIYA.name,
      college: RIYA.college,
      plan: firstLogin ? "Free" : RIYA.plan,
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
    banner: firstLogin
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
          {
            id: "t1",
            label: "Rehearse your 4 flagged answers",
            hint: "HR Question Builder",
            done: false,
          },
          {
            id: "t2",
            label: "Read the Marketing & Brand panel feedback",
            hint: "Panel feedback",
            done: true,
          },
          {
            id: "t3",
            label: "Pick a slot for your P2 panel",
            hint: "Slots release every Monday",
            done: false,
          },
        ],
    cv: firstLogin
      ? { version: "V0", locked: false, score: 0 }
      : { version: RIYA.cv.version, locked: RIYA.cv.locked, score: RIYA.cv.score },
    answers: firstLogin
      ? { total: 0, prepared: 0, needWork: 0 }
      : {
          total: RIYA.answers.total,
          prepared: RIYA.answers.prepared,
          needWork: RIYA.answers.needWork,
        },
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
      panelist: s.panelist ?? "Karan Shah",
      panelFunction: s.panelFunction ?? "External specialist",
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
