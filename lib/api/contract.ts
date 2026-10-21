import { z, type ZodType } from "zod";
import {
  authResultSchema,
  forgotBodySchema,
  okSchema,
  signInBodySchema,
  signUpBodySchema,
} from "@/features/auth/schemas";
import {
  cvUploadBodySchema,
  cvUploadResultSchema,
  freeSessionSchema,
  profileSchema,
} from "@/features/onboarding/schemas";
import {
  checkoutBodySchema,
  checkoutSchema,
  plansSchema,
  waitlistBodySchema,
  waitlistSchema,
} from "@/features/plans/schemas";
import {
  bookBodySchema,
  runwaySchema,
  sessionListSchema,
  sessionSchema,
  slotsSchema,
} from "@/features/runway/schemas";
import { feedbackDetailSchema, feedbackListSchema } from "@/features/feedback/schemas";
import {
  cvSchema,
  cvVersionsSchema,
  patchBulletResultSchema,
  relockBodySchema,
  relockResultSchema,
} from "@/features/cv-builder/schemas";
import {
  answerDetailSchema,
  answerListSchema,
  patchAnswerBodySchema,
} from "@/features/answer-bank/schemas";
import {
  caseTrackSchema,
  journeySchema,
  quickSwitchDigestSchema,
  quickSwitchPrefsSchema,
  quickSwitchSchema,
} from "@/features/journey/schemas";
import {
  billingSchema,
  buyTopUpBodySchema,
  buyTopUpResultSchema,
  upgradeQuoteSchema,
  upgradeResultSchema,
} from "@/features/billing/schemas";
import {
  changeTargetBodySchema,
  changeTargetResultSchema,
  profileViewSchema,
  updateProfileBodySchema,
} from "@/features/profile/schemas";
import { outcomeBodySchema, outcomeSchema } from "@/features/outcome/schemas";
import { markReadBodySchema, notificationsSchema } from "@/features/notifications/schemas";

import {
  applicationBodySchema,
  applicationResultSchema,
  availabilitySchema,
  briefListSchema,
  briefSchema,
  panelistProfileSchema,
  scoreBodySchema,
  scoreResultSchema,
  scoringListSchema,
  todaySchema,
  updatePanelistProfileSchema,
} from "@/features/panelist/schemas";
import {
  applicationListSchema,
  assignBodySchema,
  assignResultSchema,
  assignmentsSchema,
  bookingListSchema,
  cohortSchema,
  decisionBodySchema,
  ledgerSchema,
  panelistActionBodySchema,
  rosterSchema,
  studentDetailSchema,
  studentListSchema,
} from "@/features/ops/schemas";

export interface Operation {
  method: "get" | "post" | "put" | "patch";
  path: string;
  tag: string;
  summary: string;
  request?: ZodType;
  response: ZodType;
  /** Expected non-2xx answers as `[status, code]`. */
  errors?: [number, string][];
  query?: string[];
}

const meSchema = z.object({
  id: z.string(),
  role: z.enum(["student", "panelist", "ops"]),
  name: z.string(),
  initials: z.string(),
  onboarded: z.boolean(),
});

const resetBody = z.object({ token: z.string(), password: z.string().min(8) });
const idOnly = z.object({ ok: z.literal(true) });
const readBody = z.object({ slotId: z.string() });

/** Single source for docs/API_CONTRACT.md's tables and docs/openapi.json. Phase 5 adds panelist and ops. */
export const OPERATIONS: Operation[] = [
  { method: "get", path: "/me", tag: "Auth", summary: "Current user", response: meSchema },
  {
    method: "post",
    path: "/auth/sign-in",
    tag: "Auth",
    summary: "Sign in",
    request: signInBodySchema,
    response: authResultSchema,
    errors: [
      [404, "no_account"],
      [401, "invalid_credentials"],
      [403, "email_unverified"],
    ],
  },
  {
    method: "post",
    path: "/auth/sign-up",
    tag: "Auth",
    summary: "Sign up",
    request: signUpBodySchema,
    response: authResultSchema,
    errors: [[409, "email_taken"]],
  },
  {
    method: "post",
    path: "/auth/forgot",
    tag: "Auth",
    summary: "Request a reset link (always succeeds)",
    request: forgotBodySchema,
    response: okSchema,
  },
  {
    method: "post",
    path: "/auth/reset",
    tag: "Auth",
    summary: "Set a new password",
    request: resetBody,
    response: okSchema,
    errors: [[410, "token_expired"]],
  },

  {
    method: "put",
    path: "/students/me/profile",
    tag: "Onboarding",
    summary: "Save onboarding profile",
    request: profileSchema,
    response: okSchema,
  },
  {
    method: "post",
    path: "/students/me/cv",
    tag: "Onboarding",
    summary: "Upload CV metadata",
    request: cvUploadBodySchema,
    response: cvUploadResultSchema,
  },
  {
    method: "get",
    path: "/free-session",
    tag: "Onboarding",
    summary: "Free session slots",
    response: freeSessionSchema,
  },

  {
    method: "get",
    path: "/plans",
    tag: "Plans",
    summary: "List plans and seat counts for a track (finals or summers)",
    response: plansSchema,
    query: ["track"],
  },
  {
    method: "post",
    path: "/checkout",
    tag: "Plans",
    summary: "Pay for a plan (method: upi, card or netbanking)",
    request: checkoutBodySchema,
    response: checkoutSchema,
    errors: [
      [404, "plan_not_found"],
      [409, "cohort_full"],
    ],
  },
  {
    method: "get",
    path: "/checkout/{id}",
    tag: "Plans",
    summary: "A checkout",
    response: checkoutSchema,
    errors: [[404, "checkout_not_found"]],
  },
  {
    method: "post",
    path: "/waitlist",
    tag: "Plans",
    summary: "Join the waitlist",
    request: waitlistBodySchema,
    response: waitlistSchema,
  },

  {
    method: "get",
    path: "/students/me/runway",
    tag: "Runway",
    summary: "Runway, next session, tasks",
    response: runwaySchema,
  },
  {
    method: "get",
    path: "/sessions",
    tag: "Runway",
    summary: "List sessions",
    response: sessionListSchema,
    query: ["page", "pageSize"],
  },
  {
    method: "get",
    path: "/sessions/{id}",
    tag: "Runway",
    summary: "A session",
    response: sessionSchema,
    errors: [[404, "session_not_found"]],
  },
  {
    method: "get",
    path: "/sessions/{id}/slots",
    tag: "Runway",
    summary: "Open slots for a session",
    response: slotsSchema,
  },
  {
    method: "post",
    path: "/sessions/{id}/book",
    tag: "Runway",
    summary: "Book a slot (never optimistic)",
    request: bookBodySchema,
    response: sessionSchema,
    errors: [[409, "slot_taken"]],
  },
  {
    method: "post",
    path: "/sessions/{id}/reschedule",
    tag: "Runway",
    summary: "Move a session",
    request: readBody,
    response: sessionSchema,
    errors: [[409, "slot_taken"]],
  },
  {
    method: "post",
    path: "/sessions/{id}/cancel",
    tag: "Runway",
    summary: "Cancel a session",
    response: sessionSchema,
  },

  {
    method: "get",
    path: "/feedback",
    tag: "Feedback",
    summary: "Panel feedback list",
    response: feedbackListSchema,
    query: ["page", "pageSize"],
  },
  {
    method: "get",
    path: "/feedback/{panelId}",
    tag: "Feedback",
    summary: "One panel's feedback",
    response: feedbackDetailSchema,
    errors: [[404, "feedback_not_found"]],
  },

  {
    method: "get",
    path: "/cv",
    tag: "CV",
    summary: "Locked version, working draft, re-lock status",
    response: cvSchema,
  },
  {
    method: "patch",
    path: "/cv/bullets/{id}",
    tag: "CV",
    summary: "Edit a draft bullet; returns the three tests and new scores",
    request: z.object({ text: z.string() }),
    response: patchBulletResultSchema,
    errors: [
      [404, "bullet_not_found"],
      [422, "empty_bullet"],
    ],
  },
  {
    method: "get",
    path: "/cv/versions",
    tag: "CV",
    summary: "All versions plus the draft",
    response: cvVersionsSchema,
  },
  {
    method: "post",
    path: "/cv/versions/{id}/lock",
    tag: "CV",
    summary: "Lock a version (only while nothing is locked)",
    response: idOnly,
    errors: [
      [409, "relock_required"],
      [404, "version_not_found"],
    ],
  },
  {
    method: "post",
    path: "/cv/relock-request",
    tag: "CV",
    summary: "Ask ops to replace the locked CV",
    request: relockBodySchema,
    response: relockResultSchema,
    errors: [[409, "not_locked"]],
  },

  {
    method: "get",
    path: "/answers",
    tag: "Answers",
    summary: "Answer bank",
    response: answerListSchema,
    query: ["status", "round", "q", "page", "pageSize"],
  },
  {
    method: "get",
    path: "/answers/{id}",
    tag: "Answers",
    summary: "One answer with inline critique",
    response: answerDetailSchema,
    errors: [[404, "answer_not_found"]],
  },
  {
    method: "patch",
    path: "/answers/{id}",
    tag: "Answers",
    summary: "Save a draft or change status",
    request: patchAnswerBodySchema,
    response: answerDetailSchema,
    errors: [
      [422, "no_draft"],
      [422, "has_draft"],
    ],
  },

  {
    method: "get",
    path: "/journey",
    tag: "Extras",
    summary: "Season and routes",
    response: journeySchema,
  },
  {
    method: "get",
    path: "/quick-switch",
    tag: "Extras",
    summary: "How much carries over to another function",
    response: quickSwitchSchema,
    query: ["to"],
    errors: [[422, "unknown_function"]],
  },
  {
    method: "get",
    path: "/quick-switch/digest",
    tag: "Extras",
    summary: "Quick Switch job-hunting agent: stats, today's digest and preferences",
    response: quickSwitchDigestSchema,
  },
  {
    method: "put",
    path: "/quick-switch/preferences",
    tag: "Extras",
    summary: "Save the agent's preferences",
    request: quickSwitchPrefsSchema,
    response: quickSwitchPrefsSchema,
  },
  {
    method: "post",
    path: "/quick-switch/saved/{id}",
    tag: "Extras",
    summary: "Save or unsave a listing from the digest",
    response: quickSwitchDigestSchema,
  },
  {
    method: "get",
    path: "/case-track",
    tag: "Extras",
    summary: "Case track steps; a preview with upgrade prices below Elite",
    response: caseTrackSchema,
  },

  {
    method: "get",
    path: "/billing",
    tag: "Billing",
    summary: "Plan, what it includes, top-up rates, credits, invoices",
    response: billingSchema,
  },
  {
    method: "post",
    path: "/billing/top-ups",
    tag: "Billing",
    summary: "Buy a top-up at the plan rate; it counts toward an upgrade",
    request: buyTopUpBodySchema,
    response: buyTopUpResultSchema,
    errors: [[422, "top_up_unpriced"]],
  },
  {
    method: "get",
    path: "/billing/upgrade-quote",
    tag: "Billing",
    summary:
      "Upgrade quote: next tier price minus current tier paid minus top-ups bought (Proposed)",
    response: upgradeQuoteSchema,
    errors: [[409, "already_elite"]],
  },
  {
    method: "post",
    path: "/billing/upgrade",
    tag: "Billing",
    summary: "Upgrade to Elite",
    response: upgradeResultSchema,
    errors: [
      [409, "already_elite"],
      [409, "cohort_full"],
    ],
  },

  {
    method: "get",
    path: "/profile",
    tag: "Profile",
    summary: "Profile and target",
    response: profileViewSchema,
  },
  {
    method: "put",
    path: "/profile",
    tag: "Profile",
    summary: "Update details",
    request: updateProfileBodySchema,
    response: okSchema,
  },
  {
    method: "post",
    path: "/profile/change-target",
    tag: "Profile",
    summary: "Change target role; flags answers",
    request: changeTargetBodySchema,
    response: changeTargetResultSchema,
  },

  {
    method: "get",
    path: "/outcome",
    tag: "Outcome",
    summary: "Day 0 outcome",
    response: outcomeSchema,
  },
  {
    method: "post",
    path: "/outcome",
    tag: "Outcome",
    summary: "Report placed or not placed",
    request: outcomeBodySchema,
    response: outcomeSchema,
  },

  {
    method: "get",
    path: "/notifications",
    tag: "Notifications",
    summary: "Notifications and unread count",
    response: notificationsSchema,
  },
  {
    method: "post",
    path: "/notifications/read",
    tag: "Notifications",
    summary: "Mark read",
    request: markReadBodySchema,
    response: okSchema,
  },

  {
    method: "post",
    path: "/panelist/applications",
    tag: "Panelist",
    summary: "Apply to be a panelist (public)",
    request: applicationBodySchema,
    response: applicationResultSchema,
    errors: [[409, "already_applied"]],
  },
  {
    method: "get",
    path: "/panelist/today",
    tag: "Panelist",
    summary: "Tonight, coming up, waiting for a score",
    response: todaySchema,
  },
  {
    method: "get",
    path: "/panelist/briefs",
    tag: "Panelist",
    summary: "Upcoming briefs",
    response: briefListSchema,
  },
  {
    method: "get",
    path: "/briefs/{sessionId}",
    tag: "Panelist",
    summary: "Pre-panel brief",
    response: briefSchema,
    errors: [[404, "brief_not_found"]],
  },
  {
    method: "get",
    path: "/panelist/scoring",
    tag: "Panelist",
    summary: "Panels to score and sent feedback",
    response: scoringListSchema,
  },
  {
    method: "post",
    path: "/scores/{sessionId}",
    tag: "Panelist",
    summary: "Send scores and feedback (never optimistic). Send-back flags answers for the student",
    request: scoreBodySchema,
    response: scoreResultSchema,
    errors: [
      [403, "not_your_panel"],
      [409, "already_scored"],
    ],
  },
  {
    method: "get",
    path: "/availability",
    tag: "Panelist",
    summary: "Weekly availability and booked slots",
    response: availabilitySchema,
  },
  {
    method: "put",
    path: "/availability",
    tag: "Panelist",
    summary: "Save availability",
    request: z.object({ slots: z.record(z.string(), z.boolean()) }),
    response: availabilitySchema,
    errors: [[409, "slot_booked"]],
  },
  {
    method: "get",
    path: "/panelist/profile",
    tag: "Panelist",
    summary: "Panelist profile",
    response: panelistProfileSchema,
  },
  {
    method: "put",
    path: "/panelist/profile",
    tag: "Panelist",
    summary: "Update profile",
    request: updatePanelistProfileSchema,
    response: okSchema,
  },

  {
    method: "get",
    path: "/ops/cohort",
    tag: "Ops",
    summary: "Cohort overview: seats, funnel, revenue lines, needs attention, this week",
    response: cohortSchema,
  },
  {
    method: "get",
    path: "/ops/students",
    tag: "Ops",
    summary: "Students (1,000)",
    response: studentListSchema,
    query: ["q", "plan", "function", "status", "sort", "page", "pageSize"],
  },
  {
    method: "get",
    path: "/ops/students/{id}",
    tag: "Ops",
    summary: "Student detail",
    response: studentDetailSchema,
    errors: [[404, "student_not_found"]],
  },
  {
    method: "post",
    path: "/ops/students/{id}/relock",
    tag: "Ops",
    summary: "Approve or decline a CV re-lock",
    request: decisionBodySchema,
    response: okSchema,
    errors: [[409, "no_request"]],
  },
  {
    method: "get",
    path: "/ops/assignments",
    tag: "Ops",
    summary: "Unassigned panels with candidates, and load per function",
    response: assignmentsSchema,
  },
  {
    method: "post",
    path: "/ops/assignments",
    tag: "Ops",
    summary: "Assign a panelist (never optimistic)",
    request: assignBodySchema,
    response: assignResultSchema,
    errors: [
      [409, "not_unassigned"],
      [409, "panelist_paused"],
      [409, "slot_conflict"],
      [404, "booking_not_found"],
      [404, "panelist_not_found"],
    ],
  },
  {
    method: "get",
    path: "/ops/bookings",
    tag: "Ops",
    summary: "Sessions and bookings",
    response: bookingListSchema,
    query: ["tab", "q", "sort", "page", "pageSize"],
  },
  {
    method: "post",
    path: "/ops/bookings/{id}/excuse",
    tag: "Ops",
    summary: "Excuse a no-show",
    response: assignResultSchema,
    errors: [[409, "not_a_no_show"]],
  },
  {
    method: "get",
    path: "/ops/ledger",
    tag: "Ops",
    summary: "Plans and credits ledger",
    response: ledgerSchema,
    query: ["type", "q", "page", "pageSize"],
  },
  {
    method: "get",
    path: "/ops/panelists",
    tag: "Ops",
    summary: "Panelist roster (52)",
    response: rosterSchema,
    query: ["function", "health", "q", "sort", "page", "pageSize"],
  },
  {
    method: "post",
    path: "/ops/panelists/{id}/action",
    tag: "Ops",
    summary: "Pause, resume, or send a feedback reminder",
    request: panelistActionBodySchema,
    response: okSchema,
    errors: [[404, "panelist_not_found"]],
  },
  {
    method: "get",
    path: "/ops/applications",
    tag: "Ops",
    summary: "Panelist application queue",
    response: applicationListSchema,
    query: ["status"],
  },
  {
    method: "post",
    path: "/ops/applications/{id}/decision",
    tag: "Ops",
    summary: "Approve or reject an application",
    request: decisionBodySchema,
    response: okSchema,
    errors: [
      [409, "already_decided"],
      [404, "application_not_found"],
    ],
  },
];
