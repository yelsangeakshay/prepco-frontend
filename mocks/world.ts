import { fakerEN_IN as faker } from "@faker-js/faker";
import type { Scenario } from "@/lib/config/scenarios";
import { FUNCTIONS, PANEL_FOR_TARGET, PANELIST_FUNCTIONS } from "@/features/onboarding/schemas";
import type { FeedbackDetail } from "@/features/feedback/schemas";
import type { Session } from "@/features/runway/schemas";
import { getDb, type Db } from "./db";
import { ARJUN, RIYA } from "./fixtures/personas";
import { readSection, registerSection } from "./persist";
import { getState, type State } from "./state";

/** The wider mock world: 1,000 students, 52 panelists, a season of bookings, ledger, applications. */

export type PlanKey = "none" | "basic" | "premium" | "elite";
export const PLAN_PRICE: Record<Exclude<PlanKey, "none">, number> = {
  basic: 5999,
  premium: 9999,
  elite: 13999,
};
/** Seats from a01.png and s04.png. */
export const SEATS = {
  finals: { taken: 37, total: 60 },
  summers: { taken: 20, total: 40 },
  elite: { taken: 17, total: 22 },
} as const;

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
  /** Free session: attended (131), booked (29 more), or never booked. */
  freeSession: "none" | "booked" | "attended";
  /** Moved to another function mid-season (a01: Sana Qureshi). */
  targetChange?: string;
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
  /** Session ids whose brief the panelist has opened (p02 READ / NOT READ YET). */
  briefsRead: Record<string, true>;
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
/** "Current role" column on the roster (a06.png). */
const ROLES: Record<string, string[]> = {
  "Consulting & Strategy": ["Engagement Manager", "Principal", "Associate Partner"],
  "Marketing & Brand": ["Brand Manager, consumer goods", "Marketing Director", "Category Head"],
  "Finance & Banking": ["VP, corporate banking", "Equity research analyst", "Investment Associate"],
  "Operations & Supply Chain": ["Supply Chain Manager", "Plant Head", "Operations Lead"],
  "Product & Analytics": ["Product Lead, SaaS", "Data Science Manager", "Growth Lead"],
  "HR & General Management": ["HR Business Partner", "Talent Head", "L&D Lead"],
};
/** Panelists per function (a06.png): 10 + 11 + 9 + 7 + 8 + 7 = 52. */
const PANELISTS_PER_FUNCTION: Record<string, number> = {
  "Consulting & Strategy": 10,
  "Marketing & Brand": 11,
  "Finance & Banking": 9,
  "Operations & Supply Chain": 7,
  "Product & Analytics": 8,
  "HR & General Management": 7,
};
export const panelFunctionFor = (target: string): string =>
  (PANEL_FOR_TARGET as Record<string, string>)[target] ?? "Consulting & Strategy";
const TITLES = {
  p1: "P1: first mock panel",
  p2: "P2: external specialist panel",
  p3: "P3: pressure mock",
  dive: "Domain deep-dive",
} as const;

const TODAY_MS = Date.UTC(2026, 9, 5);
const ymd = (offset: number) => new Date(TODAY_MS + offset * 86_400_000).toISOString().slice(0, 10);
const at = (offset: number, hour: number) =>
  `${ymd(offset)}T${String(hour).padStart(2, "0")}:00:00+05:30`;

const atHM = (offset: number, hour: number, minute: number) =>
  `${ymd(offset)}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+05:30`;
/** Tonight's first panel: its brief is already read (p02). */
const AT_TONIGHT_READ = "b-tonight-1";

/** "Mon-18:00" for an ISO time, in IST. */
export function slotKey(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 5.5 * 3_600_000);
  return `${DAYS[(d.getUTCDay() + 6) % 7]}-${String(d.getUTCHours()).padStart(2, "0")}:00`;
}

/** First and last name only (the generator also offers Mr., Mrs., Dr.). */
const personName = () => `${faker.person.firstName()} ${faker.person.lastName()}`;

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
    role: pick(ROLES[fn] ?? ROLES["Consulting & Strategy"]!),
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
    mkPanelist("pn-arjun", ARJUN.name, "Marketing & Brand", "Marketing & Brand", {
      company: "Northwind Consumer Brands",
      role: "Brand Manager, consumer goods",
      bio: "Brand manager at a consumer-goods company. Twelve panels this season.",
      panelsThisSeason: ARJUN.panelsThisSeason,
      capacity: 6,
      rating: 4.8,
    }),
    mkPanelist("pn-neha", "Vikram Sethi", "Marketing & Brand", "Marketing & Brand"),
    mkPanelist("pn-rahul", "Rahul Bose", "Finance & Banking", "Finance & Banking"),
    mkPanelist("pn-karan", "Kiran Malhotra", "Marketing & Brand", "Marketing & Brand"),
  );
  let n = 5;
  const have: Record<string, number> = {};
  for (const p of panelists) have[p.function] = (have[p.function] ?? 0) + 1;
  for (const fn of PANELIST_FUNCTIONS) {
    while ((have[fn] ?? 0) < PANELISTS_PER_FUNCTION[fn]!) {
      panelists.push(mkPanelist(`pn-${String(n++).padStart(3, "0")}`, personName(), fn, fn));
      have[fn] = (have[fn] ?? 0) + 1;
    }
  }

  // 1,000 sign-ups. Exactly 57 are paid (a01.png): Basic 14, Premium 26 (Riya is one), Elite 17.
  const planPool: PlanKey[] = [
    ...Array<PlanKey>(14).fill("basic"),
    ...Array<PlanKey>(25).fill("premium"), // Riya is the 26th
    ...Array<PlanKey>(17).fill("elite"),
    ...Array<PlanKey>(943).fill("none"),
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
      freeSession: "attended",
    },
  ];
  for (let i = 2; i <= 1000; i++) {
    const name = personName();
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
      freeSession: "none",
    });
  }

  // Named students that appear in the mockups (p02, a01).
  const used = new Set<string>([RIYA.id]);
  const persona = (
    name: string,
    plan: PlanKey,
    track: "Finals" | "Summers",
    fn: string,
    extra: Partial<StudentRec> = {},
  ) => {
    const s0 = students.find((x) => x.plan === plan && !used.has(x.id))!;
    used.add(s0.id);
    Object.assign(s0, {
      name,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@scmhrd.edu`,
      college: "SCMHRD Pune",
      track,
      function: fn,
      ...extra,
    });
    return s0;
  };
  const aditya = persona("Aditya Rao", "premium", "Finals", "Sales & Marketing");
  const nehaS = persona("Neha Iyer", "elite", "Summers", "Sales & Marketing");
  const ishaan = persona("Ishaan Verma", "premium", "Finals", "Sales & Marketing");
  const meera = persona("Meera Pillai", "premium", "Finals", "Sales & Marketing");
  const rohan = persona("Rohan Desai", "premium", "Finals", "Sales & Marketing");
  const karanS = persona("Karan Shah", "basic", "Finals", "Sales & Marketing");
  const sana = persona("Sana Qureshi", "premium", "Finals", "Finance", {
    targetChange: "Finance & Banking",
  });

  // Tracks of paid students: Finals 37, Summers 20 (Riya is Finals).
  const paidAll = students.filter((x) => x.plan !== "none");
  let finals = paidAll.filter((x) => x.track === "Finals").length;
  for (const x of paidAll) {
    if (used.has(x.id)) continue;
    if (finals > 37 && x.track === "Finals") {
      x.track = "Summers";
      finals--;
    } else if (finals < 37 && x.track === "Summers") {
      x.track = "Finals";
      finals++;
    }
  }

  // Free sessions: 131 attended (all 57 paid plus 74 free), 29 more booked: 160 in all (a01).
  for (const x of paidAll) x.freeSession = "attended";
  const free = students.filter((x) => x.plan === "none");
  free.slice(0, 74).forEach((x) => (x.freeSession = "attended"));
  free.slice(74, 103).forEach((x) => (x.freeSession = "booked"));

  // Bookings.
  const bookings: BookingRec[] = [];
  let b = 1;
  const pinned = new Set<string>();
  const panelistsFor = (fn: string) =>
    panelists.filter(
      (p) => p.function === panelFunctionFor(fn) && p.id !== "pn-arjun" && p.status === "active",
    );
  const newBooking = (s0: StudentRec, over: Partial<BookingRec>): BookingRec => ({
    id: `b-${String(b++).padStart(4, "0")}`,
    studentId: s0.id,
    studentName: s0.name,
    function: s0.function,
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
  // Panelists who take panels this season: 31 of 52 (a01). The rest are paused.
  // Spread evenly through every function so each still has active panelists to assign.
  {
    const eligible = panelists.filter(
      (p) => !["pn-arjun", "pn-neha", "pn-rahul", "pn-karan", "pn-008", "pn-014"].includes(p.id),
    );
    eligible.forEach((p, k) => {
      if (Math.floor(((k + 1) * 21) / eligible.length) > Math.floor((k * 21) / eligible.length))
        p.status = "paused";
    });
  }

  const special = new Set([aditya, nehaS, ishaan, meera, rohan, karanS, sana].map((x) => x.id));
  for (const s0 of paidAll) {
    if (s0.id === RIYA.id || special.has(s0.id)) continue;
    const maxDone = s0.plan === "basic" ? 1 : 3;
    const done = faker.number.int({ min: s0.plan === "basic" ? 1 : 0, max: maxDone });
    for (let k = 0; k < done; k++) {
      bookings.push(
        newBooking(s0, {
          startsAt: at(
            -faker.number.int({ min: 2, max: 28 }),
            faker.number.int({ min: 18, max: 20 }),
          ),
          panelistId: pick(panelistsFor(s0.function)).id,
        }),
      );
    }
    if (s0.plan !== "basic") {
      const ahead = faker.number.int({ min: 1, max: 3 });
      for (let k = 0; k < ahead; k++) {
        bookings.push(
          newBooking(s0, {
            status: "upcoming",
            scored: false,
            verdict: null,
            startsAt: at(
              faker.number.int({ min: 0, max: 27 }),
              faker.number.int({ min: 18, max: 20 }),
            ),
            panelistId: pick(panelistsFor(s0.function)).id,
          }),
        );
      }
    }
  }
  for (const s0 of paidAll) {
    if (s0.plan === "basic" || s0.id === RIYA.id || special.has(s0.id)) continue;
    const mine = bookings.filter((x) => x.studentId === s0.id);
    if (!mine.some((x) => /^P2/.test(x.title)) && mine[0]) mine[0].title = TITLES.p2;
  }
  // P1 done for the named students who are not on tonight's list.
  for (const s0 of [rohan, karanS]) {
    bookings.push(
      newBooking(s0, {
        title: TITLES.p1,
        startsAt: at(-12, 19),
        panelistId: pick(panelistsFor(s0.function)).id,
      }),
    );
  }
  karanS.panelsDone = 0;

  // Exactly 3 upcoming panels have no panelist (a01): Sana Qureshi's, plus two others.
  const sanaBooking = newBooking(sana, {
    title: TITLES.p2,
    status: "unassigned",
    scored: false,
    verdict: null,
    startsAt: at(6, 19),
    panelistId: null,
  });
  bookings.push(sanaBooking);
  pinned.add(sanaBooking.id);
  const soon = bookings.filter(
    (x) =>
      x.status === "upcoming" &&
      x.startsAt! > at(2, 0) &&
      x.startsAt! < at(10, 0) &&
      !pinned.has(x.id),
  );
  for (const x of soon.slice(0, 2)) {
    x.status = "unassigned";
    x.panelistId = null;
    pinned.add(x.id);
  }

  // One no-show this week: a free session on Sun 4 Oct (a01).
  const noShowStudent = free.find((x) => x.freeSession === "booked")!;
  const noShow = newBooking(noShowStudent, {
    title: "Free session",
    status: "no-show",
    scored: false,
    verdict: null,
    startsAt: at(-1, 19),
    panelistId: null,
  });
  bookings.push(noShow);
  noShowStudent.noShows++;
  // A few cancellations.
  for (const x of bookings
    .filter((y) => y.status === "upcoming" && !pinned.has(y.id))
    .slice(0, 6)) {
    x.status = "cancelled";
    x.scored = false;
    x.verdict = null;
  }

  // Arjun: twelve panels this season (eleven here plus Riya's P1), three tonight, three this week,
  // and two feedback notes due.
  const arjunFn = students.filter(
    (x) =>
      x.function === "Sales & Marketing" &&
      x.plan !== "none" &&
      x.id !== RIYA.id &&
      !special.has(x.id),
  );
  let a = 0;
  const arjunBooking = (s0: StudentRec | undefined, over: Partial<BookingRec>) => {
    const bk = newBooking(s0 ?? arjunFn[a++ % arjunFn.length]!, {
      panelistId: "pn-arjun",
      ...over,
    });
    bookings.push(bk);
    pinned.add(bk.id);
    return bk;
  };
  for (let k = 0; k < 11; k++) arjunBooking(undefined, { startsAt: at(-3 - k * 2, 18 + (k % 3)) });
  const open = { status: "upcoming" as const, scored: false, verdict: null };
  arjunBooking(aditya, { ...open, startsAt: atHM(0, 18, 0), title: TITLES.p2 }).id =
    AT_TONIGHT_READ;
  arjunBooking(undefined, { ...open, startsAt: atHM(0, 19, 30), title: TITLES.p2 });
  arjunBooking(nehaS, { ...open, startsAt: atHM(0, 21, 0), title: TITLES.dive });
  arjunBooking(undefined, { ...open, startsAt: at(2, 18), title: TITLES.p1 });
  arjunBooking(undefined, { ...open, startsAt: at(3, 19), title: TITLES.p2 });
  arjunBooking(undefined, { ...open, startsAt: at(4, 18), title: TITLES.p3 });
  const done0 = { status: "completed" as const, scored: false, verdict: null, title: TITLES.p1 };
  arjunBooking(meera, { ...done0, startsAt: at(-3, 19) });
  arjunBooking(ishaan, { ...done0, startsAt: at(-2, 19) });

  // Sessions this week (Mon 5 to Sun 11 Oct): 46 in all (a01). Riya's own deep-dive is one of them.
  const weekLo = at(0, 0);
  const weekHi = at(7, 0);
  const inWeek = () =>
    bookings.filter(
      (x) =>
        (x.status === "upcoming" || x.status === "unassigned") &&
        x.startsAt! >= weekLo &&
        x.startsAt! < weekHi,
    );
  const loose = (x: BookingRec) => !pinned.has(x.id);
  const wanted = 45 - inWeek().filter((x) => !loose(x)).length;
  let looseWeek = inWeek().filter(loose);
  for (const x of looseWeek.slice(Math.max(wanted, 0)))
    x.startsAt = at(14 + faker.number.int({ min: 0, max: 6 }), 19);
  looseWeek = inWeek().filter(loose);
  const later = bookings.filter(
    (x) => x.status === "upcoming" && loose(x) && x.startsAt! >= weekHi,
  );
  for (const x of later.slice(0, Math.max(0, wanted - looseWeek.length))) {
    x.startsAt = at(faker.number.int({ min: 1, max: 6 }), faker.number.int({ min: 18, max: 20 }));
  }

  // Two panelists with repeated cancellations (the roster flags them). Feedback is never overdue by default.
  for (const pid of ["pn-008", "pn-014"]) {
    const rec = panelists.find((p) => p.id === pid);
    if (rec) rec.cancellations = 3;
  }

  // Per-student totals.
  for (const x of bookings) {
    if (x.status === "completed" && x.scored) {
      const st = students.find((y) => y.id === x.studentId);
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

  // Ledger (a01): Basic 14 x 5,999, Premium 26 x 9,999 (Riya's is added live), Elite 17 x 13,999,
  // top-ups 41,350. Season to date 6,23,293.
  const ledger: LedgerRec[] = [];
  let l = 1;
  const entry = (
    s0: StudentRec,
    description: string,
    amount: number,
    type: LedgerRec["type"],
    tier: PlanKey,
  ) =>
    ledger.push({
      id: `l-${String(l++).padStart(4, "0")}`,
      at: at(-faker.number.int({ min: 2, max: 40 }), 12),
      studentId: s0.id,
      studentName: s0.name,
      description,
      amount,
      type,
      tier,
    });
  for (const s0 of paidAll) {
    if (s0.id === RIYA.id) continue;
    entry(
      s0,
      `${s0.plan[0]!.toUpperCase()}${s0.plan.slice(1)} plan`,
      PLAN_PRICE[s0.plan as Exclude<PlanKey, "none">],
      "payment",
      s0.plan,
    );
  }
  const topUps: [number, number][] = [
    [1799, 10],
    [1299, 12],
    [999, 7],
    [779, 1],
  ];
  const topTargets = paidAll.filter((x) => x.id !== RIYA.id);
  let ti = 0;
  for (const [amt, count] of topUps) {
    for (let k = 0; k < count; k++) {
      const s0 = topTargets[ti++ % topTargets.length]!;
      entry(s0, amt === 779 ? "Extra answer review" : "Top-up mock", amt, "top-up", s0.plan);
    }
  }
  ledger.sort((x, y) => y.at.localeCompare(x.at));

  // Applications.
  const applications: ApplicationRec[] = [];
  const mkApp = (i: number, status: ApplicationRec["status"]): ApplicationRec => {
    const name = personName();
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
  for (let i = 1; i <= 3; i++) applications.push(mkApp(i, "pending"));
  applications.push(mkApp(4, "approved"), mkApp(5, "approved"), mkApp(6, "rejected"));

  return {
    students,
    ledger,
    panelists,
    bookings,
    applications,
    scores: {},
    availability,
    feedbacks: [P1_FEEDBACK],
    briefsRead: { [AT_TONIGHT_READ]: true },
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
  headline:
    "Strong on the numbers, weak on the why. Every answer should name the trade-off you owned.",
  note: "You framed the problem well and your FMCG numbers were credible. When I pushed on why the distributor margin should change, you went quiet. Prepare one number you can defend and the trade-off behind it.",
  scores: [
    { label: "Structure", value: 82 },
    { label: "Defensibility", value: 61 },
    { label: "Composure", value: 74 },
  ],
  sentBackToBuilder: true,
  label: "P1 · First mock panel",
  badge: "Baseline",
  title: "Where you are before anyone coaches you.",
  panelistBlurb:
    "Marketing & Brand panel · brand manager at a consumer-goods company, currently working in the function",
  readiness: 64,
  readinessNote: "Measured again at P2 and P3, so you can see the line move.",
  questions: [
    {
      question: "Walk me through your profile.",
      rating: "strong",
      comment: "Tight and in order. 90 seconds, ends on why sales. Keep it exactly like this.",
      tags: [],
      answerId: null,
    },
    {
      question: "You already have experience. Why should we hire you as an MT?",
      rating: "flagged",
      comment:
        "You name the experience but never say what changes for us. Lead with what an MT track gives you that your last role could not.",
      short: "Say what changes for us. Sent to your builder.",
      tags: ["situation", "decision", "result"],
      answerId: "a-1009",
    },
    {
      question: "Why did you cut those three channels?",
      rating: "flagged",
      comment:
        "Your answer explains what happened but never says why you chose it. Lead with the trade-off you accepted, then the number.",
      short: "Lead with the trade-off, then the number.",
      tags: ["situation", "decision", "result"],
      answerId: "a-1005",
    },
    {
      question: "Why Sales & Marketing?",
      rating: "okay",
      comment: "Better than the free session. Now tie it to one outlet you changed, by name.",
      tags: [],
      answerId: null,
    },
  ],
  fixBefore: "Mon 12 Oct",
  fixes: [
    "Every answer names the trade-off you owned.",
    "Redraft both flagged answers and send them for review.",
    "Draft the 400+ outlets answer. Expect it at P2.",
  ],
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
      briefsRead: ref.briefsRead,
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
