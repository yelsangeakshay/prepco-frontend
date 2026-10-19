import { fakerEN_IN as faker } from "@faker-js/faker";
import type { Scenario } from "@/lib/config/scenarios";
import { FUNCTIONS } from "@/features/onboarding/schemas";
import type { FeedbackDetail } from "@/features/feedback/schemas";
import type { Session } from "@/features/runway/schemas";
import { getDb, type Db } from "./db";
import { ARJUN, RIYA } from "./fixtures/personas";
import { readSection, registerSection } from "./persist";
import { getState, type State } from "./state";

/** The wider mock world: 1,000 students, 52 panelists, a season of bookings, ledger, applications. */

export type PlanKey = "none" | "basic" | "premium" | "elite";
export const PLAN_PRICE: Record<Exclude<PlanKey, "none">, number> = {
  basic: 14999,
  premium: 36999,
  elite: 59999,
};
export const PLAN_SEATS: Record<Exclude<PlanKey, "none">, number> = {
  basic: 300,
  premium: 400,
  elite: 50,
};

export interface StudentRec {
  id: string;
  name: string;
  email: string;
  college: string;
  track: string;
  function: string;
  plan: PlanKey;
  readiness: number;
  panelsDone: number;
  noShows: number;
  joinedAt: string;
  background: string;
  cvScore: number;
}

export interface PanelistRec {
  id: string;
  name: string;
  email: string;
  function: string;
  specialty: string;
  company: string;
  role: string;
  bio: string;
  status: "active" | "paused";
  panelsThisSeason: number;
  capacity: number;
  rating: number;
  cancellations: number;
  /** Feedback overdue beyond 48 h; nudging clears it. */
  feedbackOverdue: number;
}

export interface BookingRec {
  id: string;
  studentId: string;
  studentName: string;
  function: string;
  title: string;
  startsAt: string | null;
  status: "upcoming" | "completed" | "no-show" | "cancelled" | "unassigned";
  panelistId: string | null;
  excused: boolean;
  scored: boolean;
  verdict: string | null;
  /** "live" bookings are Riya's real sessions, owned by the student mock state. */
  source: "gen" | "live";
}

export interface ApplicationRec {
  id: string;
  name: string;
  email: string;
  function: string;
  company: string;
  role: string;
  years: number;
  why: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface LedgerRec {
  id: string;
  at: string;
  studentId: string;
  studentName: string;
  description: string;
  amount: number;
  type: "payment" | "refund" | "credit" | "top-up";
  tier: PlanKey;
}

export interface ScoreRec {
  sessionId: string;
  panelistId: string;
  scores: Record<string, number>;
  verdict: string;
  note: string;
  sendBack: boolean;
  scoredAt: string;
  feedbackId: string;
}

interface Mutable {
  panelists: PanelistRec[];
  bookings: BookingRec[];
  applications: ApplicationRec[];
  scores: Record<string, ScoreRec>;
  availability: Record<string, Record<string, boolean>>;
  feedbacks: FeedbackDetail[];
  counter: number;
}

export interface World extends Mutable {
  students: StudentRec[];
  ledger: LedgerRec[];
}

export const HOURS = ["18:00", "19:00", "20:00"] as const;
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const COLLEGES = [
  "SCMHRD Pune",
  "IIM Indore",
  "XLRI Jamshedpur",
  "SPJIMR Mumbai",
  "MDI Gurgaon",
  "IMT Ghaziabad",
  "NMIMS Mumbai",
  "SIBM Pune",
  "FMS Delhi",
  "TAPMI Manipal",
  "IIFT Delhi",
  "Great Lakes Chennai",
];
const COMPANIES = [
  "Northwind Consumer Brands",
  "Contoso Foods",
  "Fabrikam Retail",
  "Tailspin Finance",
  "Adventure Works",
  "Litware Consulting",
  "Proseware Logistics",
  "Wingtip Capital",
];
const SPECIALTY: Record<string, string[]> = {
  "Sales & Marketing": ["Marketing & Brand", "Sales Strategy", "Retail & Distribution"],
  Finance: ["Corporate Finance", "Investment Banking", "Risk"],
  Operations: ["Supply Chain", "Manufacturing", "Procurement"],
  Consulting: ["Strategy", "Operations Consulting", "Digital"],
  HR: ["Talent Acquisition", "HR Business Partner", "L&D"],
  "Product & Analytics": ["Product", "Data Analytics", "Growth"],
};
const TITLES = {
  p1: "P1 first mock panel",
  p2: "P2 external specialist panel",
  p3: "P3 pressure mock",
  dive: "Domain deep-dive",
} as const;

const TODAY_MS = Date.UTC(2026, 9, 5);
const ymd = (offset: number) => new Date(TODAY_MS + offset * 86_400_000).toISOString().slice(0, 10);
const at = (offset: number, hour: number) =>
  `${ymd(offset)}T${String(hour).padStart(2, "0")}:00:00+05:30`;

/** "Mon-18:00" for an ISO time, in IST. */
export function slotKey(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 5.5 * 3_600_000);
  return `${DAYS[(d.getUTCDay() + 6) % 7]}-${String(d.getUTCHours()).padStart(2, "0")}:00`;
}

function buildWorld(): World {
  faker.seed(20261109);
  const pick = <T>(arr: readonly T[]) => arr[faker.number.int({ min: 0, max: arr.length - 1 })]!;

  // Panelists: 52 across the six functions, with the three named personas first.
  const panelists: PanelistRec[] = [];
  const mkPanelist = (
    id: string,
    name: string,
    fn: string,
    specialty: string,
    extra: Partial<PanelistRec> = {},
  ): PanelistRec => ({
    id,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@panel.theprep.co.in`,
    function: fn,
    specialty,
    company: pick(COMPANIES),
    role: pick(["Brand Manager", "Regional Head", "Associate Director", "VP", "Senior Manager"]),
    bio: `${faker.number.int({ min: 6, max: 18 })} years in ${specialty.toLowerCase()}. Has interviewed hundreds of MBA graduates.`,
    status: "active",
    panelsThisSeason: faker.number.int({ min: 3, max: 15 }),
    capacity: faker.number.int({ min: 5, max: 8 }),
    rating: Math.round((4.1 + faker.number.float({ min: 0, max: 0.8 })) * 10) / 10,
    cancellations: 0,
    feedbackOverdue: 0,
    ...extra,
  });
  panelists.push(
    mkPanelist("pn-arjun", ARJUN.name, "Sales & Marketing", "Marketing & Brand", {
      company: "Northwind Consumer Brands",
      role: "Brand Manager",
      bio: "Brand manager at a consumer-goods company. Twelve panels this season.",
      panelsThisSeason: ARJUN.panelsThisSeason,
      capacity: 6,
      rating: 4.8,
    }),
    mkPanelist("pn-neha", "Neha Iyer", "Sales & Marketing", "Sales Strategy"),
    mkPanelist("pn-rahul", "Rahul Bose", "Finance", "Corporate Finance"),
    mkPanelist("pn-karan", "Karan Shah", "Sales & Marketing", "Retail & Distribution"),
  );
  let n = 5;
  while (panelists.length < 52) {
    const fn = FUNCTIONS[(panelists.length - 4) % FUNCTIONS.length]!;
    panelists.push(
      mkPanelist(
        `pn-${String(n++).padStart(3, "0")}`,
        faker.person.fullName(),
        fn,
        pick(SPECIALTY[fn]!),
      ),
    );
  }

  // Students: 1,000 with the plan mix the plans page advertises (212 / 312 / 41 paid).
  const planPool: PlanKey[] = [
    ...Array<PlanKey>(212).fill("basic"),
    ...Array<PlanKey>(311).fill("premium"), // Riya is the 312th
    ...Array<PlanKey>(41).fill("elite"),
    ...Array<PlanKey>(435).fill("none"),
  ];
  faker.helpers.shuffle(planPool, { inplace: true });
  const students: StudentRec[] = [
    {
      id: RIYA.id,
      name: RIYA.name,
      email: "riya@scmhrd.edu",
      college: RIYA.college,
      track: RIYA.track,
      function: "Sales & Marketing",
      plan: "premium",
      readiness: RIYA.readiness,
      panelsDone: 1,
      noShows: 0,
      joinedAt: at(-25, 12),
      background: RIYA.background,
      cvScore: RIYA.cv.score,
    },
  ];
  for (let i = 2; i <= 1000; i++) {
    const name = faker.person.fullName();
    const college = pick(COLLEGES);
    students.push({
      id: `st-${String(i).padStart(4, "0")}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@${college.split(" ")[0]!.toLowerCase()}.edu`,
      college,
      track: faker.number.int({ min: 1, max: 10 }) <= 7 ? "Finals" : "Summers",
      function: pick(FUNCTIONS),
      plan: planPool[i - 2]!,
      readiness: faker.number.int({ min: 12, max: 96 }),
      panelsDone: 0,
      noShows: 0,
      joinedAt: at(-faker.number.int({ min: 1, max: 60 }), 12),
      background: `${faker.number.int({ min: 0, max: 4 })} years in ${pick(["FMCG", "IT services", "banking", "manufacturing", "consulting", "e-commerce"])}`,
      cvScore: faker.number.int({ min: 40, max: 92 }),
    });
  }

  // Bookings.
  const bookings: BookingRec[] = [];
  let b = 1;
  const panelistsFor = (fn: string) =>
    panelists.filter((p) => p.function === fn && p.id !== "pn-arjun");
  const newBooking = (s: StudentRec, over: Partial<BookingRec>): BookingRec => ({
    id: `b-${String(b++).padStart(4, "0")}`,
    studentId: s.id,
    studentName: s.name,
    function: s.function,
    title: pick([TITLES.p1, TITLES.p2, TITLES.p3, TITLES.dive]),
    startsAt: null,
    status: "completed",
    panelistId: null,
    excused: false,
    scored: true,
    verdict: pick(["Ready", "Almost There", "Needs Work"]),
    source: "gen",
    ...over,
  });
  const paid = students.filter((s) => s.plan !== "none" && s.id !== RIYA.id);
  for (const s of paid) {
    const done = faker.number.int({ min: 0, max: 2 });
    for (let k = 0; k < done; k++) {
      bookings.push(
        newBooking(s, {
          startsAt: at(
            -faker.number.int({ min: 2, max: 28 }),
            faker.number.int({ min: 18, max: 20 }),
          ),
          panelistId: pick(panelistsFor(s.function)).id,
        }),
      );
    }
    if (faker.number.int({ min: 1, max: 100 }) <= 35) {
      bookings.push(
        newBooking(s, {
          status: "upcoming",
          scored: false,
          verdict: null,
          startsAt: at(
            faker.number.int({ min: 1, max: 27 }),
            faker.number.int({ min: 18, max: 20 }),
          ),
          panelistId: pick(panelistsFor(s.function)).id,
        }),
      );
    }
  }

  // Exactly 7 upcoming panels in the next ten days have no panelist yet.
  const soon = bookings.filter((x) => x.status === "upcoming" && x.startsAt! < at(10, 0));
  for (const x of soon.slice(0, 7)) {
    x.status = "unassigned";
    x.panelistId = null;
  }
  // 18 no-shows and 22 cancellations.
  const completed = bookings.filter((x) => x.status === "completed" && x.startsAt! > at(-14, 0));
  for (const x of completed.slice(0, 18)) {
    x.status = "no-show";
    x.scored = false;
    x.verdict = null;
    const st = students.find((s) => s.id === x.studentId);
    if (st) st.noShows++;
  }
  const upcoming = bookings.filter((x) => x.status === "upcoming");
  for (const x of upcoming.slice(0, 22)) {
    x.status = "cancelled";
    x.scored = false;
    x.verdict = null;
  }

  // Arjun: twelve panels this season (eleven here plus Riya's P1), today's two, three this week, one to score.
  const arjunFn = students.filter(
    (s) => s.function === "Sales & Marketing" && s.plan !== "none" && s.id !== RIYA.id,
  );
  let a = 0;
  const arjunBooking = (over: Partial<BookingRec>) =>
    bookings.push(newBooking(arjunFn[a++ % arjunFn.length]!, { panelistId: "pn-arjun", ...over }));
  for (let k = 0; k < 11; k++) arjunBooking({ startsAt: at(-3 - k * 2, 18 + (k % 3)) });
  arjunBooking({
    status: "upcoming",
    scored: false,
    verdict: null,
    startsAt: at(0, 18),
    title: TITLES.p2,
  });
  arjunBooking({
    status: "upcoming",
    scored: false,
    verdict: null,
    startsAt: at(0, 19),
    title: TITLES.p3,
  });
  arjunBooking({ status: "upcoming", scored: false, verdict: null, startsAt: at(2, 18) });
  arjunBooking({
    status: "upcoming",
    scored: false,
    verdict: null,
    startsAt: at(3, 19),
    title: TITLES.p2,
  });
  arjunBooking({
    status: "upcoming",
    scored: false,
    verdict: null,
    startsAt: at(4, 18),
    title: TITLES.p3,
  });
  arjunBooking({
    status: "completed",
    scored: false,
    verdict: null,
    startsAt: at(-1, 19),
    title: TITLES.p1,
  });

  // A handful of overdue feedback across four other panelists, for the roster health view.
  const overduePool = bookings.filter(
    (x) =>
      x.status === "completed" &&
      x.panelistId &&
      x.panelistId !== "pn-arjun" &&
      x.startsAt! < at(-5, 0),
  );
  const overdueIds = ["pn-006", "pn-011", "pn-017", "pn-023"];
  overdueIds.forEach((pid, i) => {
    const mine = overduePool.filter((x) => x.panelistId === pid).slice(0, i + 1);
    mine.forEach((x) => {
      x.scored = false;
      x.verdict = null;
    });
    const rec = panelists.find((p) => p.id === pid);
    if (rec) rec.feedbackOverdue = mine.length || i + 1;
  });
  // Two panelists with repeated cancellations.
  for (const pid of ["pn-008", "pn-014"]) {
    const rec = panelists.find((p) => p.id === pid);
    if (rec) rec.cancellations = 3;
  }

  // Per-student totals.
  for (const x of bookings) {
    if (x.status === "completed") {
      const st = students.find((s) => s.id === x.studentId);
      if (st) st.panelsDone++;
    }
  }

  // Availability: a weekly pattern per panelist.
  const availability: Record<string, Record<string, boolean>> = {};
  for (const p of panelists) {
    const grid: Record<string, boolean> = {};
    if (p.id === "pn-arjun") {
      for (const k of [
        "Mon-18:00",
        "Mon-19:00",
        "Tue-19:00",
        "Wed-18:00",
        "Wed-19:00",
        "Thu-18:00",
        "Thu-19:00",
        "Fri-18:00",
        "Fri-19:00",
      ]) {
        grid[k] = true;
      }
    } else {
      for (const d of DAYS.slice(0, 5)) {
        for (const h of HOURS)
          if (faker.number.int({ min: 1, max: 100 }) <= 55) grid[`${d}-${h}`] = true;
      }
    }
    availability[p.id] = grid;
  }

  // Ledger: one payment per paid student, a few refunds.
  const ledger: LedgerRec[] = [];
  let l = 1;
  for (const s of students) {
    if (s.plan === "none" || s.id === RIYA.id) continue;
    ledger.push({
      id: `l-${String(l++).padStart(4, "0")}`,
      at: at(-faker.number.int({ min: 2, max: 40 }), 12),
      studentId: s.id,
      studentName: s.name,
      description: `${s.plan[0]!.toUpperCase()}${s.plan.slice(1)} plan`,
      amount: PLAN_PRICE[s.plan],
      type: "payment",
      tier: s.plan,
    });
  }
  for (const e of ledger.filter((x) => x.tier === "basic").slice(0, 8)) {
    ledger.push({
      id: `l-${String(l++).padStart(4, "0")}`,
      at: at(-faker.number.int({ min: 1, max: 10 }), 15),
      studentId: e.studentId,
      studentName: e.studentName,
      description: "Refund · seat released",
      amount: -3000,
      type: "refund",
      tier: "basic",
    });
  }
  ledger.sort((x, y) => y.at.localeCompare(x.at));

  // Applications.
  const applications: ApplicationRec[] = [];
  const mkApp = (i: number, status: ApplicationRec["status"]): ApplicationRec => {
    const name = faker.person.fullName();
    return {
      id: `app-${String(i).padStart(3, "0")}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
      function: pick(FUNCTIONS),
      company: pick(COMPANIES),
      role: pick(["Senior Manager", "Associate Director", "Regional Head", "VP"]),
      years: faker.number.int({ min: 5, max: 20 }),
      why: "I want to help MBA students prepare for the questions I wish someone had drilled me on.",
      submittedAt: at(-faker.number.int({ min: 1, max: 12 }), 11),
      status,
    };
  };
  for (let i = 1; i <= 5; i++) applications.push(mkApp(i, "pending"));
  applications.push(mkApp(6, "approved"), mkApp(7, "approved"), mkApp(8, "rejected"));

  return {
    students,
    ledger,
    panelists,
    bookings,
    applications,
    scores: {},
    availability,
    feedbacks: [P1_FEEDBACK],
    counter: 1,
  };
}

/** Riya's P1 note from Arjun (the one the student side has always had). */
export const P1_FEEDBACK: FeedbackDetail = {
  panelId: "p-1001",
  sessionId: "s-1002",
  panelist: ARJUN.name,
  function: ARJUN.function,
  startsAt: "2026-09-21T19:00:00+05:30",
  verdict: "Almost There",
  headline: "Strong structure, thin on the pricing trade-off.",
  note: "You framed the problem well and your FMCG numbers were credible. When I pushed on why the distributor margin should change, you went quiet. Prepare one number you can defend and the trade-off behind it.",
  scores: [
    { label: "Structure", value: 82 },
    { label: "Defensibility", value: 61 },
    { label: "Composure", value: 74 },
  ],
  sentBackToBuilder: true,
};

const cache = new WeakMap<Db, World>();

export function getWorld(scenario: Scenario | null): World {
  const db = getDb(scenario);
  let w = cache.get(db);
  if (!w) {
    w = buildWorld();
    const snap = readSection<Mutable>("world", scenario);
    if (snap) Object.assign(w, snap);
    cache.set(db, w);
    const ref = w;
    registerSection("world", scenario, (): Mutable => ({
      panelists: ref.panelists,
      bookings: ref.bookings,
      applications: ref.applications,
      scores: ref.scores,
      availability: ref.availability,
      feedbacks: ref.feedbacks,
      counter: ref.counter,
    }));
  }
  return w;
}

// ---------------------------------------------------------------------------
// Live view of Riya's real sessions as bookings
// ---------------------------------------------------------------------------

function panelistByName(w: World, name: string | null) {
  return name ? w.panelists.find((p) => p.name === name) : undefined;
}

function liveBookings(w: World, db: Db): BookingRec[] {
  const out: BookingRec[] = [];
  for (const s of db.sessions) {
    if (s.status === "unbooked" || s.status === "locked") continue;
    if (s.kind === "profiling" || s.kind === "free") continue;
    const p = panelistByName(w, s.panelist);
    const status: BookingRec["status"] =
      s.status === "completed"
        ? "completed"
        : s.status === "cancelled"
          ? "cancelled"
          : s.status === "no-show"
            ? "no-show"
            : p
              ? "upcoming"
              : "unassigned";
    out.push({
      id: s.id,
      studentId: RIYA.id,
      studentName: RIYA.name,
      function: "Sales & Marketing",
      title: s.title,
      startsAt: s.startsAt,
      status,
      panelistId: p?.id ?? null,
      excused: false,
      scored: s.status === "completed" && !!s.feedbackId,
      verdict: w.feedbacks.find((f) => f.panelId === s.feedbackId)?.verdict ?? null,
      source: "live",
    });
  }
  return out;
}

export function allBookings(scenario: Scenario | null): BookingRec[] {
  const w = getWorld(scenario);
  const db = getDb(scenario);
  return [...liveBookings(w, db), ...w.bookings];
}

export function findBooking(scenario: Scenario | null, id: string) {
  return allBookings(scenario).find((x) => x.id === id);
}

/** Students with Riya's plan, readiness and counts read live from the student mock state. */
export function allStudents(scenario: Scenario | null): StudentRec[] {
  const w = getWorld(scenario);
  const st = getState(scenario);
  const db = getDb(scenario);
  const planId = st.plan.id === "free" ? "none" : st.plan.id;
  const riya = w.students[0]!;
  const live: StudentRec = {
    ...riya,
    plan: planId,
    readiness: scenario === "first-login" ? 0 : scenario === "late-joiner" ? 38 : RIYA.readiness,
    panelsDone: db.sessions.filter((s) => s.status === "completed" && s.kind === "panel").length,
    noShows: db.sessions.filter((s) => s.status === "no-show").length,
    cvScore: st.cv.lockedScores?.overall ?? 0,
    function: st.target.function,
    name: st.profile.name,
    college: st.profile.college,
  };
  return [live, ...w.students.slice(1)];
}

export function studentStatus(s: StudentRec): "active" | "at-risk" | "unpaid" {
  if (s.plan === "none") return "unpaid";
  if (s.readiness < 40 || s.noShows > 0) return "at-risk";
  return "active";
}

export function ledgerAll(scenario: Scenario | null): LedgerRec[] {
  const w = getWorld(scenario);
  const st = getState(scenario);
  const riyaEntries: LedgerRec[] = st.invoices.map((inv, i) => ({
    id: `l-riya-${i + 1}`,
    at: inv.at,
    studentId: RIYA.id,
    studentName: RIYA.name,
    description: inv.description,
    amount: inv.amount,
    type: inv.description.startsWith("Upgrade") ? "top-up" : "payment",
    tier: inv.description.startsWith("Upgrade")
      ? "elite"
      : st.plan.id === "free"
        ? "none"
        : st.plan.id === "elite"
          ? "premium"
          : st.plan.id,
  }));
  return [...riyaEntries, ...w.ledger].sort((x, y) => y.at.localeCompare(x.at));
}

export function panelistLoad(scenario: Scenario | null, panelistId: string) {
  // Panels in the current week (Mon 5 to Sun 11 Oct).
  const lo = at(0, 0);
  const hi = at(7, 0);
  return allBookings(scenario).filter(
    (x) =>
      x.panelistId === panelistId &&
      x.status === "upcoming" &&
      x.startsAt! >= lo &&
      x.startsAt! < hi,
  ).length;
}

export type { State, Session };
