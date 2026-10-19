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
import { caseTrackSchema, journeySchema, quickSwitchSchema } from "@/features/journey/schemas";
import { billingSchema, upgradeQuoteSchema, upgradeResultSchema } from "@/features/billing/schemas";
import {
  changeTargetBodySchema,
  changeTargetResultSchema,
  profileViewSchema,
  updateProfileBodySchema,
} from "@/features/profile/schemas";
import { outcomeBodySchema, outcomeSchema } from "@/features/outcome/schemas";
import { markReadBodySchema, notificationsSchema } from "@/features/notifications/schemas";

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

  { method: "get", path: "/plans", tag: "Plans", summary: "List plans", response: plansSchema },
  {
    method: "post",
    path: "/checkout",
    tag: "Plans",
    summary: "Pay for a plan",
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
    query: ["status", "q", "page", "pageSize"],
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
    path: "/case-track",
    tag: "Extras",
    summary: "Case modules (Elite only)",
    response: caseTrackSchema,
    errors: [[403, "elite_only"]],
  },

  {
    method: "get",
    path: "/billing",
    tag: "Billing",
    summary: "Plan, credits, receipts",
    response: billingSchema,
  },
  {
    method: "get",
    path: "/billing/upgrade-quote",
    tag: "Billing",
    summary: "Upgrade price after top-up credit (Proposed)",
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
];
