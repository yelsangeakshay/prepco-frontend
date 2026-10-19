import type { Scenario } from "@/lib/config/scenarios";
import { formatSession } from "@/lib/utils/dates";
import type { Session, SlotDto } from "@/features/runway/schemas";
import type { Checkout } from "@/features/plans/schemas";
import { ARJUN } from "./fixtures/personas";

const at = (day: string, hour: number) =>
  `2026-${day}T${String(hour).padStart(2, "0")}:00:00+05:30`;

const PANELISTS = [`${ARJUN.name}`, "Neha Iyer", "Rahul Bose"];

function base(): Session[] {
  return [
    {
      id: "s-1001",
      title: "Profiling call + CV lock",
      week: "Week -8",
      kind: "profiling",
      startsAt: at("09-14", 19),
      status: "completed",
      panelist: "Ops team",
      panelFunction: null,
      feedbackId: null,
    },
    {
      id: "s-1002",
      title: "P1 first mock panel",
      week: "Week -7",
      kind: "panel",
      startsAt: at("09-21", 19),
      status: "completed",
      panelist: ARJUN.name,
      panelFunction: ARJUN.function,
      feedbackId: "p-1001",
    },
    {
      id: "s-1003",
      title: "Domain deep-dive",
      week: "Week -5",
      kind: "deep-dive",
      startsAt: at("10-07", 19),
      status: "upcoming",
      panelist: "Neha Iyer",
      panelFunction: "Sales & Marketing",
      freeRescheduleUntil: at("10-06", 19),
      feedbackId: null,
    },
    {
      id: "s-1004",
      title: "P2 external specialist panel",
      week: "Week -4",
      kind: "panel",
      startsAt: null,
      status: "unbooked",
      panelist: null,
      panelFunction: null,
      feedbackId: null,
    },
    {
      id: "s-1005",
      title: "Group positioning session",
      week: "Week -2",
      kind: "group",
      startsAt: at("10-26", 19),
      status: "locked",
      panelist: null,
      panelFunction: null,
      feedbackId: null,
    },
    {
      id: "s-1006",
      title: "P3 pressure mock",
      week: "Week -1",
      kind: "panel",
      startsAt: at("11-02", 19),
      status: "locked",
      panelist: null,
      panelFunction: null,
      feedbackId: null,
    },
  ];
}

export function buildSessions(scenario: Scenario | null): Session[] {
  const s = base();
  const deepDive = s.find((x) => x.id === "s-1003")!;
  switch (scenario) {
    case "first-login":
      return s.map((x, i) => ({
        ...x,
        status: i === 0 ? "unbooked" : "locked",
        startsAt: i === 0 ? null : x.startsAt,
        panelist: null,
        panelFunction: null,
        feedbackId: null,
      }));
    case "late-joiner":
      // Compressed runway: only the last three sessions remain.
      return s.slice(3).map((x, i) => (i === 0 ? { ...x, status: "unbooked" as const } : x));
    case "panelist-cancelled":
      Object.assign(deepDive, {
        status: "cancelled",
        note: "Your panelist can no longer make this slot. Pick a new one, no charge.",
      });
      break;
    case "student-reschedule":
      Object.assign(deepDive, {
        status: "rescheduled",
        previousStartsAt: deepDive.startsAt,
        startsAt: at("10-08", 19),
        note: "You moved this session. Reschedule is free until 24 hours before the start.",
      });
      break;
    case "no-show":
      Object.assign(deepDive, {
        status: "no-show",
        startsAt: at("10-04", 19),
        note: "You missed this session. Your first no-show is free: rebook without losing a credit.",
      });
      break;
    default:
  }
  return s;
}

export function buildSlots(sessionId: string): SlotDto[] {
  const windows: Record<string, string[]> = {
    "s-1004": ["10-12", "10-13", "10-14", "10-15", "10-16"],
    "s-1003": ["10-08", "10-09", "10-12"],
    "s-1001": ["10-08", "10-09", "10-12"],
    free: ["10-06", "10-07", "10-08", "10-09"],
  };
  const days = windows[sessionId] ?? windows["s-1004"]!;
  const out: SlotDto[] = [];
  days.forEach((d, i) => {
    [18, 19, 20].forEach((h) => {
      const startsAt = at(d, h);
      out.push({
        id: `${sessionId}-${d}-${h}`,
        startsAt,
        label: formatSession(startsAt),
        // Deterministic "already taken" slots.
        taken: (i + h) % 5 === 0,
      });
    });
  });
  // One slot that looks free but loses a race exactly once.
  const raceDay = days[1] ?? days[0]!;
  const race = out.find((s) => s.id === `${sessionId}-${raceDay}-19`);
  if (race) {
    race.id = `${sessionId}-race`;
    race.taken = false;
  }
  return out;
}

export interface Db {
  scenario: Scenario | null;
  sessions: Session[];
  raceHit: boolean;
  checkouts: Map<string, Checkout>;
  waitlistCount: number;
  freeSessionBookedAt: string | null;
  signedUpEmails: Set<string>;
}

let db: Db | null = null;

/** Shared mock state. Rebuilt whenever the scenario changes. */
export function getDb(scenario: Scenario | null): Db {
  if (!db || db.scenario !== scenario) {
    db = {
      scenario,
      sessions: buildSessions(scenario),
      raceHit: false,
      checkouts: new Map(),
      waitlistCount: 41,
      freeSessionBookedAt: scenario === "returning-student" ? at("09-02", 19) : null,
      signedUpEmails: new Set(),
    };
  }
  return db;
}

export function resetDb() {
  db = null;
}

export const PANELIST_POOL = PANELISTS;
