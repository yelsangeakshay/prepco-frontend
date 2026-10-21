import type { Scenario } from "@/lib/config/scenarios";
import { formatSession } from "@/lib/utils/dates";
import type { Session, SlotDto } from "@/features/runway/schemas";
import type { Checkout } from "@/features/plans/schemas";
import { ARJUN } from "./fixtures/personas";
import { readSection, registerSection } from "./persist";

const at = (day: string, hour: number) =>
  `2026-${day}T${String(hour).padStart(2, "0")}:00:00+05:30`;

const PANELISTS = [`${ARJUN.name}`, "Vikram Sethi", "Rahul Bose"];

function base(): Session[] {
  return [
    {
      id: "s-1001",
      blurb: "We read the profile and named what you actually need.",
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
      blurb: "External industry expert · your baseline",
      title: "P1: first mock panel",
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
      blurb: "run by a practitioner in Marketing & Brand",
      title: "Domain deep-dive",
      week: "Week -5",
      kind: "deep-dive",
      startsAt: at("10-07", 19),
      status: "upcoming",
      panelist: "Vikram Sethi",
      panelFunction: "Marketing & Brand",
      freeRescheduleUntil: at("10-06", 19),
      feedbackId: null,
    },
    {
      id: "s-1004",
      blurb: "Industry expert on the panel, one of us co-interviewing",
      title: "P2: external specialist panel",
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
      blurb: "how you read against the rest of the shortlist",
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
      blurb: "full simulation, seven days out",
      title: "P3: pressure mock",
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
  if (sessionId === "s-1004") {
    // s09.png draws exactly these four P2 slots.
    return (
      [
        ["10-12", 18, 0],
        ["10-12", 19, 30],
        ["10-13", 18, 30],
        ["10-14", 20, 0],
      ] as const
    ).map(([d, h, m]) => {
      const startsAt = `2026-${d}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00+05:30`;
      // The Tue 13 Oct slot looks free but loses a race exactly once.
      const id = d === "10-13" ? `${sessionId}-race` : `${sessionId}-${d}-${h}${m || ""}`;
      return { id, startsAt, label: formatSession(startsAt) };
    });
  }
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
interface DbSnapshot extends Omit<Db, "checkouts" | "signedUpEmails"> {
  checkouts: [string, Checkout][];
  signedUpEmails: string[];
}

function serialize(d: Db): DbSnapshot {
  return {
    ...d,
    checkouts: [...d.checkouts.entries()],
    signedUpEmails: [...d.signedUpEmails],
  };
}

/** Shared mock state. Rebuilt whenever the scenario changes; restored from the saved snapshot on reload. */
export function getDb(scenario: Scenario | null): Db {
  if (!db || db.scenario !== scenario) {
    const fresh: Db = {
      scenario,
      sessions: buildSessions(scenario),
      raceHit: false,
      checkouts: new Map(),
      waitlistCount: 41,
      freeSessionBookedAt: scenario === "returning-student" ? "2026-09-08T18:30:00+05:30" : null,
      signedUpEmails: new Set(),
    };
    const snap = readSection<DbSnapshot>("db", scenario);
    if (snap) {
      Object.assign(fresh, snap, {
        checkouts: new Map(snap.checkouts),
        signedUpEmails: new Set(snap.signedUpEmails),
      });
    }
    db = fresh;
    const ref = fresh;
    registerSection("db", scenario, () => serialize(ref));
  }
  return db;
}

export function resetDb() {
  db = null;
}

export const PANELIST_POOL = PANELISTS;
