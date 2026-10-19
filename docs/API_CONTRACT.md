# API contract (mock, `/api/v1`)

Updated as handlers are added. A real backend must honour the same shapes. Zod schemas live in `features/*/schemas.ts` and are applied to every response by `lib/api/client.ts`.

- List endpoints accept `page, pageSize, sort, q` and return `{ items, total, page, pageSize }`.
- Errors: `{ "code": string, "message": string }` with a non-2xx status.
- Mock role comes from the `prepco_role` cookie; the active scenario is sent as the `x-prepco-scenario` header.

## Auth

| Method | Path            | Body                        | Success                                                       | Errors                                                              |
| ------ | --------------- | --------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/me`           | none                        | `{ id, role, name, initials, onboarded }`                     |                                                                     |
| POST   | `/auth/sign-in` | `{ email, password }`       | `{ role, onboarded }`                                         | 404 `no_account`, 401 `invalid_credentials`, 403 `email_unverified` |
| POST   | `/auth/sign-up` | `{ name, email, password }` | `{ role: "student", onboarded: false, verifyRequired? }`      | 409 `email_taken`                                                   |
| POST   | `/auth/forgot`  | `{ email }`                 | `{ ok: true }` (always, so account existence is not revealed) |                                                                     |
| POST   | `/auth/reset`   | `{ token, password }`       | `{ ok: true }`                                                | 410 `token_expired`                                                 |

## Onboarding

| Method | Path                   | Body                                                                                 | Success                                                                                    |
| ------ | ---------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| PUT    | `/students/me/profile` | `{ college, batch, track, targetFunction, targetRole, experience, yearsExperience }` | `{ ok: true }`                                                                             |
| POST   | `/students/me/cv`      | `{ fileName, size, consent: true }`                                                  | `{ status: "done" \| "failed", reason, extracted: { roles, bullets, education } \| null }` |
| GET    | `/free-session`        |                                                                                      | `{ eligible, usedAt, slots: [{ id, startsAt, label, taken? }] }`                           |

CV size and type (PDF/DOCX, up to 5 MB) are checked client-side before upload. The mock sends metadata only, not the file.

## Plans and payment

| Method | Path            | Body                | Success                                                                                                         | Errors                                  |
| ------ | --------------- | ------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| GET    | `/plans`        |                     | `{ items: [{ id, name, price, tagline, features, mostChosen, elite, seatsTotal, seatsTaken }], cohortFull }`    |                                         |
| POST   | `/checkout`     | `{ planId }`        | `{ id, planId, planName, amount, status: "paid" \| "failed", failureReason, seatHeldUntil, receiptNo, paidAt }` | 404 `plan_not_found`, 409 `cohort_full` |
| GET    | `/checkout/:id` |                     | same as above                                                                                                   | 404 `checkout_not_found`                |
| POST   | `/waitlist`     | `{ planId, email }` | `{ position, claimWindowHours, priceKept }`                                                                     |                                         |

`seatHeldUntil` is set only on a failed payment (Proposed: 15 minutes).

## Runway and sessions

| Method | Path                       | Body         | Success                                            | Errors                  |
| ------ | -------------------------- | ------------ | -------------------------------------------------- | ----------------------- |
| GET    | `/students/me/runway`      |              | see `runwaySchema` in `features/runway/schemas.ts` |                         |
| GET    | `/sessions`                |              | `{ items: Session[], total, page, pageSize }`      |                         |
| GET    | `/sessions/:id`            |              | `Session`                                          | 404 `session_not_found` |
| GET    | `/sessions/:id/slots`      |              | `{ items: [{ id, startsAt, label, taken? }] }`     |                         |
| POST   | `/sessions/:id/book`       | `{ slotId }` | `Session`                                          | 409 `slot_taken`        |
| POST   | `/sessions/:id/reschedule` | `{ slotId }` | `Session`                                          | 409 `slot_taken`        |
| POST   | `/sessions/:id/cancel`     |              | `Session`                                          |                         |

`Session.status` is one of `upcoming, completed, cancelled, rescheduled, no-show, unbooked, locked`. `POST /sessions/free/book` books the free session.

Slot booking is never optimistic. In the mock, the slot id ending in `-race` returns `slot_taken` on its first attempt.

## Feedback

| Method | Path                 | Success                                                                                                       | Errors                   |
| ------ | -------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------ |
| GET    | `/feedback`          | `{ items: [{ panelId, sessionId, panelist, function, startsAt, verdict, headline }], total, page, pageSize }` |                          |
| GET    | `/feedback/:panelId` | summary plus `{ note, scores: [{ label, value }], sentBackToBuilder }`                                        | 404 `feedback_not_found` |

## Scenarios that change responses

`first-login`, `late-joiner`, `day0-moved`, `panelist-cancelled`, `student-reschedule`, `no-show`, `payment-failed` (first checkout only), `cohort-full`, `cv-upload-failed`, `gmail-unverified`, `returning-student`.

## Phase 4 endpoints

The full, machine-readable list is `docs/openapi.json`, generated from `lib/api/contract.ts` (run `pnpm test lib/api/openapi.test.ts` to regenerate). Summary:

| Area          | Method and path                                                       | Notes                                                                                                                                |
| ------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| CV            | GET `/cv`                                                             | `{ locked: { version, lockedAt, scores } , draft: { version, sections, scores }, relock: { status } }`                               |
| CV            | PATCH `/cv/bullets/:id`                                               | `{ text }` returns `{ bullet: { hasDecision, hasNumber, hasTradeoff }, scores }`. Errors: 404 `bullet_not_found`, 422 `empty_bullet` |
| CV            | GET `/cv/versions`                                                    | versions plus the working draft (`id: "draft"`)                                                                                      |
| CV            | POST `/cv/versions/:id/lock`                                          | 409 `relock_required` while a version is locked                                                                                      |
| CV            | POST `/cv/relock-request`                                             | `{ reason }`, returns `{ status: "pending" }`                                                                                        |
| Answers       | GET `/answers?status=&q=&page=&pageSize=`                             | `{ items, total, page, pageSize, counts: { all, rehearsed, flagged, notDrafted } }`                                                  |
| Answers       | GET, PATCH `/answers/:id`                                             | PATCH `{ draft?, status? }`; 422 `no_draft`, `has_draft`                                                                             |
| Extras        | GET `/journey`, `/quick-switch?to=`, `/case-track`                    | case track: 403 `elite_only` unless on Elite                                                                                         |
| Billing       | GET `/billing`, GET `/billing/upgrade-quote`, POST `/billing/upgrade` | quote = list price minus credit for unused sessions (Proposed)                                                                       |
| Profile       | GET, PUT `/profile`; POST `/profile/change-target`                    | change target flags answers (`answersToRework`)                                                                                      |
| Outcome       | GET, POST `/outcome`                                                  | `{ state: "placed", company, role, ctc }` or `{ state: "not-placed" }`                                                               |
| Notifications | GET `/notifications`; POST `/notifications/read`                      | read body `{ ids? , all? }`; list returns `unread`                                                                                   |

New scenarios that change responses: `placed`, `not-placed`, `target-change`, `basic-ended`.

Mock state lives in the browser page. In-app navigation keeps it; a hard reload resets it. A real backend replaces this.
