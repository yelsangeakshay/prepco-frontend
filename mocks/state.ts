import type { Bullet, CvScores, CvVersion } from "@/features/cv-builder/schemas";
import { scoreBulletText } from "@/features/cv-builder/schemas";
import type { AnswerDetail } from "@/features/answer-bank/schemas";
import type { QuickSwitchPrefs } from "@/features/journey/schemas";
import type { Notification } from "@/features/notifications/schemas";
import type { Billing } from "@/features/billing/schemas";
import type { Outcome } from "@/features/outcome/schemas";
import { getDb, type Db } from "./db";
import type { Scenario } from "@/lib/config/scenarios";
import { readSection, registerSection } from "./persist";

/** Mock state for Phase 4 features. Rebuilt whenever the scenario (and so the Db) changes. */

export interface CvSectionState {
  id: string;
  title: string;
  bullets: Bullet[];
}

export interface State {
  cv: {
    lockedVersion: string | null;
    lockedAt: string | null;
    lockedScores: CvScores | null;
    sections: CvSectionState[];
    baseline: { sum: number; sumDecision: number; sumTradeoff: number; n: number };
    versions: CvVersion[];
    relock: { status: "none" | "pending"; requestedAt: string | null; reason: string | null };
  };
  answers: AnswerDetail[];
  /** Quick Switch agent (s13.png): preferences and the listings saved from the digest. */
  quickSwitch: { prefs: QuickSwitchPrefs; saved: string[] };
  notifications: Notification[];
  plan: Billing["plan"];
  credits: Billing["credits"];
  invoices: Omit<Billing["invoices"][number], "status">[];
  upgradeAttempts: number;
  /** Top-up mocks bought this season; they count toward an upgrade. */
  topUps: { label: string; amount: number; at: string }[];
  outcome: Outcome;
  target: { function: string; role: string };
  targetChange: { changedAt: string; from: string; answersToRework: number } | null;
  profile: {
    name: string;
    college: string;
    batch: string;
    workExperience: string;
    phone: string;
  };
}

const at = (day: string, hour = 19) => `2026-${day}T${String(hour).padStart(2, "0")}:00:00+05:30`;

const BULLETS: [string, string, string][] = [
  [
    "exp",
    "b1",
    "Led pricing review across 14 distributors, cutting trade-spend 8% instead of reducing the SKU range",
  ],
  ["exp", "b2", "Built a weekly sales dashboard used by 6 regional managers"],
  ["exp", "b3", "Prioritised 3 modern-trade accounts, lifting category share by 2.1 points"],
  ["exp", "b4", "Supported the launch of a 250 ml pack in Pune and Nashik"],
  ["edu", "b5", "Top 5% of the cohort in Marketing Management at SCMHRD Pune"],
  ["lead", "b6", "Elected placement committee lead for a batch of 40 students"],
  ["lead", "b7", "Negotiated a sponsor tie-up for the college fest despite a tight budget"],
];

function bullet(id: string, text: string): Bullet {
  return { id, text, ...scoreBulletText(text) };
}

function sum(sections: CvSectionState[]) {
  const all = sections.flatMap((s) => s.bullets);
  return {
    sum: all.filter((b) => b.hasNumber).length,
    sumDecision: all.filter((b) => b.hasDecision).length,
    sumTradeoff: all.filter((b) => b.hasTradeoff).length,
    n: all.length,
  };
}

/** Base scores are Riya's: Impact 88, Clarity 82, Defensibility 81. Edits move them by the change in the three tests. */
export function computeScores(s: State["cv"]): CvScores {
  const cur = sum(s.sections);
  const base = s.baseline;
  const n = Math.max(1, cur.n);
  const impact =
    88 + Math.round(((cur.sum - base.sum + cur.sumDecision - base.sumDecision) / (2 * n)) * 40);
  const defensibility =
    81 +
    Math.round(
      ((cur.sumTradeoff - base.sumTradeoff + cur.sumDecision - base.sumDecision) / (2 * n)) * 40,
    );
  const clarity = 82;
  const c = (v: number) => Math.max(0, Math.min(100, v));
  const i = c(impact);
  const d = c(defensibility);
  return { impact: i, clarity, defensibility: d, overall: Math.round((i + clarity + d) / 3) };
}

const QUESTIONS: [string, string, string][] = [
  [
    "Walk me through your profile.",
    "Opening",
    "I spent two years as an FMCG sales analyst, which taught me that distributor margins decide shelf presence. I now want a Management Trainee role where I own those calls.",
  ],
  [
    "Why Sales & Marketing?",
    "Motivation",
    "Because I have seen how one pricing decision changes a region's numbers, and I want to make those decisions myself.",
  ],
  [
    "Why MBA, and why now?",
    "Motivation",
    "I want to move from reporting on decisions to making them. The MBA is the shortest route to a Management Trainee role.",
  ],
  [
    "Walk me through a time you led without authority",
    "Leadership",
    "As placement lead I got 40 peers to submit on time by publishing a daily tracker.",
  ],
  [
    "Why did you cut those three channels?",
    "Analytical",
    "I cut three of five channels after week two to protect the budget.",
  ],
  [
    "Describe a conflict with a teammate",
    "Behavioural",
    "A colleague and I disagreed on promo depth. I ran both options on last year's data.",
  ],
  [
    "What is your biggest strength?",
    "Self",
    "Turning messy sales data into one decision a manager can act on.",
  ],
  [
    "What is your biggest weakness?",
    "Self",
    "I over-prepare numbers and under-prepare the story. I now write the headline first.",
  ],
  [
    "You already have experience. Why should we hire you as an MT?",
    "Pitch",
    "Two years as a sales analyst covering 400+ outlets in West Delhi. I could see the numbers but not set the plan. I chose the MBA to move from reporting on decisions to making them.",
  ],
  [
    "Why should we hire you over others?",
    "Pitch",
    "I bring two years of ground sales data and the habit of testing decisions before defending them.",
  ],
  [
    "Tell me about a time you used data to decide",
    "Analytical",
    "I moved trade-spend from 14 low-yield distributors to 3 modern-trade accounts and share rose 2.1 points.",
  ],
  [
    "How do you handle pressure?",
    "Self",
    "I list what is in my control, do the first small step, and tell my manager early.",
  ],
  [
    "Describe your ideal manager",
    "Fit",
    "Someone who gives me a clear target and asks for my reasoning.",
  ],
  [
    "Tell me about a time you persuaded someone",
    "Influence",
    "I persuaded a sceptical distributor to stock a new pack by showing his own sell-through data.",
  ],
  ["You mention 400+ outlets. What exactly did you analyse?", "Analytical", ""],
  ["Walk me through a time you were wrong.", "Behavioural", ""],
  [
    "Tell me about a trade-off you made",
    "Analytical",
    "I cut SKUs in two stores to protect shelf space for the top three sellers.",
  ],
  [
    "How do you prioritise competing tasks?",
    "Self",
    "Impact first, deadline second, effort third.",
  ],
];

const FLAGGED = new Set([4, 5, 8, 16]);
/** The four CV deep-dive questions; the other fourteen are the fit round (s08.png). */
const CV_ROUND = new Set([10, 13, 16, 17]);
/** List order on the answer bank (s08.png): the drawn rows first, the rest in order. */
const DISPLAY_FIRST = [0, 2, 1, 8, 4, 14, 15];
const NOTE_TAGS: Record<number, AnswerDetail["noteTags"]> = {
  4: ["situation", "decision", "result"],
  5: ["decision"],
  8: ["situation", "decision", "result"],
  16: ["result"],
};

/** First sentence is the situation, the second the decision, the rest the result. */
function splitParts(draft: string): AnswerDetail["parts"] {
  const sentences =
    draft.match(/[^.!?]+[.!?]+(s|$)/g)?.map((s) => s.trim()) ?? (draft ? [draft] : []);
  return {
    situation: sentences[0] ?? "",
    decision: sentences[1] ?? "",
    result: sentences.slice(2).join(" "),
  };
}
const CRITIQUE: Record<number, { critique: string; inline: { quote: string; note: string }[] }> = {
  4: {
    critique:
      "Your answer explains what happened but never says why you chose it. Lead with the trade-off you accepted, then the number.",
    inline: [
      { quote: "cut three of five channels", note: "Say what you gave up to do it." },
      { quote: "after week two", note: "What did week two show you?" },
    ],
  },
  5: {
    critique: "Sounds like blame-free storytelling. Show your part in the disagreement.",
    inline: [{ quote: "ran both options", note: "Which one won, and what did you give up?" }],
  },
  8: {
    critique:
      "You name the experience but never say what changes for us. Lead with what an MT track gives you that your last role could not.",
    inline: [
      {
        quote: "I chose the MBA",
        note: "What does the MT track give you that the MBA alone does not?",
      },
    ],
  },
  16: {
    critique: "Trade-off is there, but the cost is missing.",
    inline: [{ quote: "protect shelf space", note: "What did the two stores lose?" }],
  },
};

function buildAnswers(scenario: Scenario | null): AnswerDetail[] {
  const reworked = scenario === "target-change";
  const list = QUESTIONS.map(([question, category, draft], i): AnswerDetail => {
    const id = `a-${1001 + i}`;
    let status: AnswerDetail["status"] = draft ? "rehearsed" : "not-drafted";
    if (FLAGGED.has(i) || (reworked && draft && i % 2 === 1 && i < 14)) status = "flagged";
    const c = CRITIQUE[i];
    return {
      id,
      question,
      category,
      status,
      snippet: draft ? draft.slice(0, 120) : null,
      critique:
        status === "flagged"
          ? (c?.critique ?? "Your target changed: reframe this for the new role.")
          : null,
      draft,
      round: CV_ROUND.has(i) ? "cv" : "fit",
      noteTags: status === "flagged" ? (NOTE_TAGS[i] ?? ["situation"]) : [],
      parts:
        i === 8
          ? {
              situation:
                "Two years as a sales analyst covering 400+ outlets in West Delhi. I could see the numbers but not set the plan.",
              decision: "I chose the MBA to move from reporting on decisions to making them.",
              result: "",
            }
          : splitParts(draft),
      inlineCritique: status === "flagged" ? (c?.inline ?? []) : [],
      flaggedAt:
        status === "flagged" ? (FLAGGED.has(i) ? "P1 · 21 Sep" : "Target change · 5 Oct") : null,
      draftNo: i === 8 ? 3 : draft ? 1 + (i % 3) : 0,
      savedLabel: i === 8 ? "2 min ago" : null,
      rehearseNext: i === 8,
      nextPanel: "P2 · Mon 12 Oct",
    };
  });
  const rank = (a: AnswerDetail) => {
    const i = Number(a.id.slice(2)) - 1001;
    const first = DISPLAY_FIRST.indexOf(i);
    return first >= 0 ? first : DISPLAY_FIRST.length + i;
  };
  return list.sort((a, b) => rank(a) - rank(b));
}

function buildNotifications(db: Db): Notification[] {
  const s = db.scenario;
  const list: Notification[] = [];
  const add = (n: Omit<Notification, "read"> & { read?: boolean }) =>
    list.push({ read: false, ...n });

  if (s === "first-login") {
    add({
      id: "n-welcome",
      kind: "system",
      title: "Welcome to The Prep Co",
      body: "Book your free session to start.",
      at: at("10-05", 9),
      href: "/free-session",
    });
    return list;
  }
  if (s === "panelist-cancelled")
    add({
      id: "n-x1",
      kind: "session",
      title: "Your panelist cancelled",
      body: "Pick a new slot for your domain deep-dive. No charge.",
      at: at("10-05", 11),
      href: "/sessions/s-1003",
    });
  if (s === "student-reschedule")
    add({
      id: "n-x2",
      kind: "session",
      title: "Your session was moved to Thu 8 Oct",
      body: "You can still reschedule for free until 24 hours before.",
      at: at("10-05", 11),
      href: "/sessions/s-1003",
    });
  if (s === "no-show")
    add({
      id: "n-x3",
      kind: "session",
      title: "You missed your deep-dive",
      body: "Your first no-show is free. Rebook now.",
      at: at("10-05", 8),
      href: "/sessions/s-1003",
    });
  if (s === "day0-moved")
    add({
      id: "n-x4",
      kind: "runway",
      title: "Day 0 moved to Mon 16 Nov",
      body: "Your remaining sessions still fit.",
      at: at("10-05", 10),
      href: "/journey",
    });
  if (s === "placed" || s === "not-placed")
    add({
      id: "n-x5",
      kind: "runway",
      title: "Day 0 results are open",
      body: "Tell us how it went.",
      at: at("10-05", 10),
      href: "/outcome",
    });
  if (s === "basic-ended")
    add({
      id: "n-x6",
      kind: "billing",
      title: "Your Basic plan has ended",
      body: "Upgrade to keep your runway going.",
      at: at("10-05", 9),
      href: "/billing/upgrade",
    });

  add({
    id: "n-1",
    kind: "session",
    title: "Your deep-dive is Wed 7 Oct · 7:00 PM IST",
    body: "Read your brief the evening before.",
    at: at("10-04", 18),
    href: "/sessions/s-1003",
  });
  add({
    id: "n-2",
    kind: "feedback",
    title: "Arjun Mehta sent your P1 feedback",
    body: "Strong on the numbers, weak on the why. Every answer should name the trade-off you owned.",
    at: at("09-22", 9),
    href: "/feedback/p-1001",
  });
  add({
    id: "n-3",
    kind: "runway",
    title: "Slots for your P2 panel open Monday",
    body: null,
    at: at("10-02", 10),
    href: "/sessions/s-1004",
    read: true,
  });
  add({
    id: "n-4",
    kind: "billing",
    title: "Payment received: Premium",
    body: "Receipt PC-2026-4102",
    at: at("09-10", 12),
    href: "/billing",
    read: true,
  });
  add({
    id: "n-5",
    kind: "system",
    title: "Welcome to Season 1",
    body: null,
    at: at("09-10", 9),
    href: null,
    read: true,
  });
  return list;
}

function buildState(db: Db): State {
  const s = db.scenario;
  const firstLogin = s === "first-login";

  const sections: CvSectionState[] = firstLogin
    ? []
    : [
        { id: "exp", title: "Experience", bullets: [] },
        { id: "edu", title: "Education", bullets: [] },
        { id: "lead", title: "Leadership", bullets: [] },
      ].map((sec) => ({
        ...sec,
        bullets: BULLETS.filter(([g]) => g === sec.id).map(([, id, text]) => bullet(id, text)),
      }));

  const cv: State["cv"] = {
    lockedVersion: firstLogin ? null : "V4",
    lockedAt: firstLogin ? null : at("09-14", 20),
    lockedScores: null,
    sections,
    baseline: sum(sections),
    versions: firstLogin
      ? []
      : [
          {
            id: "v1",
            version: "V1",
            createdAt: at("08-12", 12),
            score: 58,
            locked: false,
            current: false,
            note: "First upload",
          },
          {
            id: "v2",
            version: "V2",
            createdAt: at("08-28", 12),
            score: 69,
            locked: false,
            current: false,
            note: "Added numbers to experience",
          },
          {
            id: "v3",
            version: "V3",
            createdAt: at("09-10", 12),
            score: 77,
            locked: false,
            current: false,
            note: "Rewrote leadership bullets",
          },
          {
            id: "v4",
            version: "V4",
            createdAt: at("09-14", 20),
            score: 84,
            locked: true,
            current: true,
            note: "Locked at profiling call",
          },
        ],
    relock: { status: "none", requestedAt: null, reason: null },
  };
  cv.lockedScores = firstLogin ? null : { overall: 84, impact: 88, clarity: 82, defensibility: 81 };

  const answers = buildAnswers(s);

  const basicEnded = s === "basic-ended";
  const plan: State["plan"] = firstLogin
    ? { id: "free", name: "Free", paid: 0, status: "active", endedAt: null }
    : basicEnded
      ? { id: "basic", name: "Basic", paid: 5999, status: "ended", endedAt: at("10-01", 23) }
      : { id: "premium", name: "Premium", paid: 9999, status: "active", endedAt: null };

  const outcome: Outcome =
    s === "placed"
      ? {
          state: "placed",
          company: "Northwind Consumer Brands",
          role: "Management Trainee, Sales",
          ctc: 1200000,
          creditCarried: null,
          day0Label: "Mon 9 Nov",
        }
      : s === "not-placed"
        ? {
            state: "not-placed",
            company: null,
            role: null,
            ctc: null,
            creditCarried: 9999,
            day0Label: "Mon 9 Nov",
          }
        : {
            state: "pending",
            company: null,
            role: null,
            ctc: null,
            creditCarried: null,
            day0Label: "Mon 9 Nov",
          };

  const changed = s === "target-change";

  return {
    cv,
    answers,
    quickSwitch: {
      prefs: {
        enabled: true,
        roles: "Sales & Marketing, Strategy, Business Analytics",
        locations: "Mumbai, Pune, Bengaluru",
        minFit: 85,
        email: "riya.kulkarni@scmhrd.edu",
      },
      saved: [],
    },
    notifications: buildNotifications(db),
    plan,
    credits: firstLogin
      ? { total: 0, used: 0, carriedOver: 0 }
      : basicEnded
        ? { total: 3, used: 3, carriedOver: 0 }
        : { total: 6, used: 2, carriedOver: 0 },
    invoices: firstLogin
      ? []
      : [
          {
            id: "inv-1",
            receiptNo: "PC-2026-4102",
            description: `${plan.name} plan`,
            amount: plan.paid,
            at: at("09-10", 12),
          },
        ],
    upgradeAttempts: 0,
    topUps: basicEnded ? [{ label: "Top-up mock", amount: 1799, at: at("09-30", 12) }] : [],
    outcome,
    target: changed
      ? { function: "Finance", role: "Analyst" }
      : { function: "Sales & Marketing", role: "Management Trainee" },
    targetChange: changed
      ? {
          changedAt: at("10-03", 15),
          from: "Sales & Marketing (Management Trainee)",
          answersToRework: 6,
        }
      : null,
    profile: {
      name: "Riya Kulkarni",
      college: "SCMHRD Pune",
      batch: "MBA 2025–27",
      workExperience: "2 yrs · FMCG sales analyst",
      phone: "+91 98XXX XXXXX",
    },
  };
}

const cache = new WeakMap<Db, State>();

export function getState(scenario: Scenario | null): State {
  const db = getDb(scenario);
  let st = cache.get(db);
  if (!st) {
    st = buildState(db);
    const snap = readSection<State>("state", scenario);
    if (snap) Object.assign(st, snap);
    cache.set(db, st);
    const ref = st;
    registerSection("state", scenario, () => ref);
  }
  return st;
}

export function answerCounts(st: State) {
  const rehearsed = st.answers.filter((a) => a.status === "rehearsed").length;
  const flagged = st.answers.filter((a) => a.status === "flagged").length;
  return {
    all: st.answers.length,
    rehearsed,
    flagged,
    notDrafted: st.answers.length - rehearsed - flagged,
  };
}
