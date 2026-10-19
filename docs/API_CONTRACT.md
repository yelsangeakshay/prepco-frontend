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

## Phase 5 endpoints: panelist and ops

Full list in `docs/openapi.json` (regenerated by `pnpm test lib/api/openapi.test.ts`).

### Panelist (`prepco_role=panelist`, always Arjun Mehta in the mock)

| Method and path               | Notes                                                                                                                                                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST `/panelist/applications` | public; `{ name, email, function, company, role, years, hoursPerMonth, linkedin?, why }`; 409 `already_applied`                                                                                                                   |
| GET `/panelist/today`         | `{ panelist, today[], upcoming[], awaitingScore[], stats }`                                                                                                                                                                       |
| GET `/panelist/briefs`        | upcoming panels                                                                                                                                                                                                                   |
| GET `/briefs/:sessionId`      | CV highlights, answers to probe, previous feedback; 404 `brief_not_found` for panels that are not yours                                                                                                                           |
| GET `/panelist/scoring`       | `{ awaiting[], done[] }`                                                                                                                                                                                                          |
| POST `/scores/:sessionId`     | `{ scores: { Structure, Defensibility, Composure }, verdict, note, sendBack }`; 403 `not_your_panel`, 409 `already_scored`. Creates the student's feedback, flags up to two answers when `sendBack` is true, notifies the student |
| GET, PUT `/availability`      | `{ slots: { "Mon-18:00": true }, booked[] }`; 409 `slot_booked` when a booked slot is switched off                                                                                                                                |
| GET, PUT `/panelist/profile`  |                                                                                                                                                                                                                                   |

### Ops (`prepco-role=ops`)

| Method and path                                                               | Notes                                                                                   |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| GET `/ops/cohort`                                                             | seats, funnel, revenue by tier, `needsAttention[]` (with links), `thisWeek[]`           |
| GET `/ops/students?q=&plan=&function=&status=&sort=field:dir&page=&pageSize=` | 1,000 students; `pageSize` up to 1000                                                   |
| GET `/ops/students/:id`                                                       | sessions, payments, `relockRequest`                                                     |
| POST `/ops/students/:id/relock`                                               | `{ decision: "approve" \| "reject" }`; approving locks the draft as the next version    |
| GET `/ops/assignments`                                                        | `unassigned[]` each with `candidates[]` (name, load, `free`), and `load[]` per function |
| POST `/ops/assignments`                                                       | `{ sessionId, panelistId }`; 409 `not_unassigned`, `panelist_paused`, `slot_conflict`   |
| GET `/ops/bookings?tab=all\|unassigned\|no-shows&q=&sort=&page=&pageSize=`    | includes `counts`                                                                       |
| POST `/ops/bookings/:id/excuse`                                               | 409 `not_a_no_show`                                                                     |
| GET `/ops/ledger?type=&q=&page=&pageSize=`                                    | with `totals`                                                                           |
| GET `/ops/panelists?function=&health=&q=&sort=&page=&pageSize=`               | 52 panelists; `health` is good, watch or needs-attention                                |
| POST `/ops/panelists/:id/action`                                              | `{ action: "pause" \| "resume" \| "nudge" }`                                            |
| GET `/ops/applications?status=`                                               | with `counts`                                                                           |
| POST `/ops/applications/:id/decision`                                         | approving adds the person to the roster                                                 |

### Shared mock world

One world serves all three roles: Riya's sessions are the same records ops assigns and Arjun scores. It is saved in `sessionStorage` after every write, so reloads and role switches keep it. Scenario changes rebuild it.
