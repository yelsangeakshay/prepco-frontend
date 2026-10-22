# Prep Co Web App: UI Build Brief for Claude Code

> How to use: put this file in the root of an empty folder as `PREPCO_UI_BUILD_PROMPT.md`,
> put the mockup PNGs in `design/mockups/` (see section 2), then start Claude Code and say:
> **"Read PREPCO_UI_BUILD_PROMPT.md and execute Phase 1 only. Stop at the Phase 1 gate and report."**
> Run one phase per session. Review, commit, then ask for the next phase.

---

## 1. Your role and the goal

You are a senior frontend engineer building the **logged-in web app for The Prep Co** (theprep.co.in), an MBA placement-prep product with three roles: **Student**, **Panelist** and **Ops/Admin**.

Build the **complete UI only**: every screen, every navigation link, every state, running on **mock data**. There is **no backend yet**. The UI must talk HTTP through a typed API layer that Mock Service Worker (MSW) answers, so a real backend can replace the mocks later by flipping one env variable, with no page or component changes.

Target: about 1,000 onboarded users at launch. Many students use phones on college Wi-Fi in the evening (panels run 6 to 9 PM IST); ops staff scroll lists of up to 1,000 students.

### Non-negotiables

- Every sidebar link and every in-page link goes to a real route. No `href="#"`, no dead links.
- Every screen has loading, empty, error and success states.
- Every edge case (E1 to E12) can be opened directly by URL via `?scenario=<name>`.
- Visual fidelity to the mockups at 1280 px, and at 390 px where a phone mockup exists.
- Do not invent product policy. Where the mockups mark something **Proposed**, build it as drawn and list it in `docs/OPEN_DECISIONS.md`.
- Do not build any backend, database or real auth. Mocks only.

---

## 2. Design source of truth

Mockups are in `design/mockups/` (exported PNGs). File names follow the screen codes below (`s05.png`, `s05-mobile.png`, `p02.png`, `a01.png`, `e04.png`, `cover.png`, `review.png`).

- **Always open the matching PNG before building a screen.** Match layout, spacing, copy and hierarchy.
- `cover.png` is the theme and component sheet. `review.png` lists coverage, edge cases and open decisions.
- If a PNG is missing, stop and tell me which one; do not guess the layout.

Online references (for the human; you may not be able to fetch them):

- Mockup gallery: https://prepcodashboard.vercel.app/gallery
- Journey maps: https://claude.ai/artifact/Bm7q5Xa1ChYNa8wSr6f2BZ

### Sample personas and calendar (use exactly these in fixtures)

- **Riya Kulkarni**: student, SCMHRD Pune, MBA 2025–27, finals track, Premium, targeting Sales & Marketing (Management Trainee), two years as an FMCG sales analyst. Readiness 64%. CV V4 locked, score 84 (Impact 88, Clarity 82, Defensibility 81). Answer bank: 18 questions, 12 prepared, 4 need work.
- **Kaniksha Bambode**: Marketing & Brand panelist, brand manager at a consumer-goods company, 12 panels this season.
- **Ops team**: initials "OP".
- **Today = Monday 5 October 2026. Day 0 = Monday 9 November 2026 (35 days).** Runway: Week -8 profiling call + CV lock (done), Week -7 P1 first mock panel (done), Week -5 domain deep-dive Wed 7 Oct 7:00 PM IST (next), Week -4 P2 external specialist panel (pick slot), Week -2 group positioning session Mon 26 Oct, Week -1 P3 pressure mock Mon 2 Nov, Day 0 Mon 9 Nov.
- Pin "today" via a single `lib/utils/clock.ts` so the whole app agrees.

---

## 3. Tech stack (use these, latest stable; check versions at install)

| Concern         | Choice                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------- |
| Framework       | Next.js 15 App Router, React 19, TypeScript strict                                           |
| Styling         | Tailwind CSS v4 with CSS variables in `styles/tokens.css`                                    |
| Components      | shadcn/ui (Radix), restyled to the tokens                                                    |
| Fonts           | `next/font`: Playfair Display (headings, big numbers), Inter (UI), Caveat (rare annotations) |
| Icons           | lucide-react                                                                                 |
| Server state    | TanStack Query v5                                                                            |
| Client state    | Zustand (only for UI state and drafts)                                                       |
| Forms           | React Hook Form + Zod                                                                        |
| Mock API        | MSW v2 (browser + node), `@faker-js/faker` with a fixed seed                                 |
| Tables          | TanStack Table + TanStack Virtual                                                            |
| Charts          | Recharts                                                                                     |
| Rich text       | TipTap (CV bullets, answer drafts)                                                           |
| Dates           | date-fns, timezone Asia/Kolkata                                                              |
| Toasts          | sonner                                                                                       |
| Tests           | Vitest + Testing Library, Playwright                                                         |
| Component docs  | Storybook 8                                                                                  |
| Quality         | ESLint, Prettier, Husky + lint-staged                                                        |
| Package manager | pnpm                                                                                         |

Do not add other libraries without asking.

---

## 4. Design tokens (from the cover sheet)

```css
--cream: #f5f2ea; /* page background */
--cream-soft: #efe9dc; /* inset panels, tip boxes */
--white: #ffffff; /* cards */
--navy-900: #0f1b2d; /* text, sidebar, hero card */
--navy-400: #6b7785; /* secondary text */
--maroon-600: #7c1f34; /* primary button, active nav, accent */
--maroon-700: #611829; /* hover */
--maroon-100: #f6e4e8; /* flagged badge bg */
--gold-500: #c0993d; /* Elite, Day 0 */
--gold-300: #e2c383; /* accent on navy */
/* radius: 8 controls, 12 cards, 16 feature cards, 9999 badges */
```

Rules: progress bars are a maroon → gold gradient. Colour carries meaning only (maroon = act/flagged, gold = Elite/Day 0, green = done). Buttons use title case. Minimal shadows. Touch targets at least 44 px. Currency is ₹ with Indian grouping (₹6,23,293). Dates like "Wed 7 Oct · 7:00 PM IST".

---

## 5. Route map (build all of these)

### Public / auth (no sidebar)

| Route                                                          | Screen                                           |
| -------------------------------------------------------------- | ------------------------------------------------ |
| `/`                                                            | redirect: signed in → role home, else `/sign-in` |
| `/sign-in`, `/sign-up`                                         | S1                                               |
| `/forgot-password`, `/reset-password/[token]`, `/verify-email` | E1                                               |
| `/panelist/apply`, `/panelist/apply/submitted`                 | P1                                               |
| `not-found`, `error`, `/maintenance`                           | branded                                          |

### Student: route group `(student)`, student shell

Sidebar sections exactly as S5: **Your runway**: Home, Sessions & runway, Panel feedback, Journey & routes. **Tools**: CV Builder, HR Question Builder, Quick Switch, Case track (Elite badge). **Account**: Plan & billing, Profile. Footer card: plan + "2 of 6 runway sessions done" with progress bar.

| Route                                          | Screen                                              |
| ---------------------------------------------- | --------------------------------------------------- |
| `/onboarding/[step]` (1–3, no sidebar)         | S2, E3 (late-joiner state)                          |
| `/onboarding/cv-upload`                        | E2 (reading / done / failed + consent)              |
| `/free-session`                                | S3, E12                                             |
| `/plans`                                       | S4, E5                                              |
| `/checkout/[plan]`                             | S4, E4 (failed: seat held 15 min / success receipt) |
| `/waitlist`                                    | E5                                                  |
| `/home`                                        | S5                                                  |
| `/sessions`, `/sessions/[id]`                  | S9, E6                                              |
| `/feedback`, `/feedback/[panelId]`             | S10                                                 |
| `/journey`                                     | S11                                                 |
| `/cv`, `/cv/versions`                          | S6, S7                                              |
| `/answers`, `/answers/[id]`                    | S8                                                  |
| `/quick-switch`                                | S13                                                 |
| `/case-track`                                  | S12 (locked view for non-Elite)                     |
| `/billing`, `/billing/upgrade`                 | S14, E8                                             |
| `/profile`, `/profile/change-target`           | S15, E9                                             |
| `/outcome`                                     | E7, E11                                             |
| `/notifications` (+ bell drawer on every page) | E10                                                 |

### Panelist: route group `(panelist)` under `/panelist`

Sidebar as P2: **Panels**: Today, Pre-panel briefs, Scoring & feedback, Availability. **Account**: Profile. Footer card: function + panels this season.

| Route                                                | Screen                         |
| ---------------------------------------------------- | ------------------------------ |
| `/panelist/today`                                    | P2                             |
| `/panelist/briefs`, `/panelist/briefs/[sessionId]`   | P3                             |
| `/panelist/scoring`, `/panelist/scoring/[sessionId]` | P4                             |
| `/panelist/availability`                             | P5                             |
| `/panelist/profile`                                  | not mocked: reuse S15 patterns |

### Ops: route group `(admin)` under `/ops`

Sidebar as A1: **Cohort**: Overview, Students, Panel assignment (count badge), Sessions & bookings. **Business**: Plans & credits, Panelists. Footer card: season + Day 0.

| Route                                           | Screen |
| ----------------------------------------------- | ------ |
| `/ops`                                          | A1     |
| `/ops/students`, `/ops/students/[id]`           | A2     |
| `/ops/assignments`                              | A3     |
| `/ops/sessions`                                 | A4     |
| `/ops/ledger`                                   | A5     |
| `/ops/panelists`, `/ops/panelists/applications` | A6     |

All list filters, sort, search and page live in the URL (`?q=&status=&function=&page=&pageSize=&sort=`).

**Phone layouts** (S1, S2, S3, S5, S6, S8, S9, S10, S14, P2, P3, A1) are responsive versions of the same routes. Under 768 px the sidebar becomes a bottom bar (4 to 5 key items) plus a "More" sheet. The runway timeline turns vertical.

---

## 6. Folder structure

```text
app/
  (public)/  (onboarding)/  (student)/  (panelist)/panelist/  (admin)/ops/
  layout.tsx  not-found.tsx  error.tsx  loading.tsx
components/
  ui/       shadcn primitives
  shell/    AppShell, Sidebar, MobileNav, TopBar, NotificationBell, DevToolbar
  shared/   StatCard, ProgressBar, ScoreBar, ReadinessMeter, CountdownCard,
            RunwayTimeline, DataTable, FunnelBars, EmptyState, ErrorCard, Skeletons
features/<feature>/  components/ hooks/ schemas.ts types.ts
  auth onboarding plans checkout runway sessions feedback cv-builder answer-bank
  quick-switch case-track billing profile notifications outcome
  panelist/(today brief scoring availability apply)
  ops/(cohort students assignment bookings ledger roster)
lib/
  api/      client.ts endpoints.ts query-keys.ts
  auth/     session.ts roles.ts
  config/   nav.ts (ONLY source of sidebar links per role)  routes.ts (typed constants)
  utils/    clock.ts dates.ts currency.ts cn.ts
mocks/
  handlers/<feature>.ts  fixtures/  scenarios.ts  browser.ts  server.ts
styles/tokens.css
tests/e2e/   one spec per journey
docs/        OPEN_DECISIONS.md  API_CONTRACT.md  PROGRESS.md
middleware.ts
```

Rules: pages stay thin (compose feature components, call hooks). No fetch calls inside components; only hooks from `features/*/hooks`. No hard-coded route strings; import from `lib/config/routes.ts`.

---

## 7. Data layer contract

Flow: page → feature hook (`useRunway`) → TanStack Query (key from `query-keys.ts`) → typed function in `endpoints.ts` (`GET /api/v1/students/me/runway`) → MSW handler → Zod-parsed response.

- `NEXT_PUBLIC_API_MOCKING=on|off` and `NEXT_PUBLIC_API_BASE_URL`. With mocking off, nothing else changes.
- MSW adds a random 200–600 ms delay so skeletons are real.
- Fixtures: the personas in section 2 plus a seeded generator making **1,000 students** (Indian names, colleges, tracks, plans, readiness), **52 panelists** across six functions, a season of sessions, ledger entries.
- Stale times: plans 10 min; runway and sessions 30 s; notifications 15 s with refetch on focus.
- Optimistic updates only for cheap, reversible actions (tick task, mark notification read, flag answer). **Slot booking is never optimistic**; handle a "slot taken" error.
- List endpoints accept `page, pageSize, sort, q` and return `{ items, total, page, pageSize }`.

Endpoints to mock (prefix `/api/v1`):

- Auth: `POST /auth/sign-in`, `/auth/sign-up`, `/auth/forgot`, `/auth/reset`, `GET /me`
- Onboarding: `PUT /students/me/profile`, `POST /students/me/cv`, `GET /free-session`
- Plans/pay: `GET /plans`, `POST /checkout`, `GET /checkout/:id`, `POST /waitlist`
- Runway: `GET /students/me/runway`, `GET /sessions`, `GET /sessions/:id`, `POST /sessions/:id/book|reschedule|cancel`
- CV: `GET /cv`, `PATCH /cv/bullets/:id`, `GET /cv/versions`, `POST /cv/versions/:id/lock`, `POST /cv/relock-request`
- Answers: `GET /answers?status=`, `GET/PATCH /answers/:id`
- Feedback: `GET /feedback`, `GET /feedback/:panelId`
- Billing/outcome/profile: `GET /billing`, `GET /billing/upgrade-quote`, `POST /outcome`, `POST /profile/change-target`
- Panelist: `GET /panelist/today`, `GET /briefs/:sessionId`, `POST /scores/:sessionId`, `GET/PUT /availability`, `POST /panelist/applications`
- Ops: `GET /ops/cohort`, `/ops/students`, `/ops/students/:id`, `/ops/assignments`, `POST /ops/assignments`, `/ops/bookings`, `/ops/ledger`, `/ops/panelists`, `/ops/applications`
- Shared: `GET /notifications`, `POST /notifications/read`

Keep `docs/API_CONTRACT.md` updated with every request/response shape as you add handlers.

### Scenarios (`?scenario=` and the dev toolbar)

`payment-failed`, `payment-success`, `cohort-full`, `late-joiner`, `cv-upload-failed`, `panelist-cancelled`, `student-reschedule`, `no-show`, `day0-moved`, `placed`, `not-placed`, `first-login`, `gmail-unverified`, `basic-ended`, `target-change`, `returning-student`.

### Mock auth

A dev-only toolbar (bottom-right, hidden in production) switches role (Student Riya / Panelist Kaniksha / Ops) and scenario. It sets a `prepco_role` cookie that `middleware.ts` reads to: block cross-role routes, send un-onboarded students to `/onboarding/1`, and send signed-out users to `/sign-in`. Each role layout checks the role again.

---

## 8. Quality bars

- **Performance:** under 170 KB first-load JS per route; LCP < 2.5 s, INP < 200 ms on mid-range Android over 4G. Server Components by default; `"use client"` only where there is interaction. Lazy-load TipTap, Recharts and the CV preview with `next/dynamic`. Public pages statically generated.
- **Big lists:** paginate 25/50; debounce search 300 ms; virtualise above 200 rows.
- **Resilience:** `loading.tsx` and `error.tsx` per route group; failed widgets show a retry card; form drafts persist locally (onboarding, CV bullet, answer, scoring).
- **Accessibility:** WCAG 2.1 AA. Check gold-on-cream contrast. Visible maroon focus ring. Full keyboard paths for slot picking and scoring. Labelled fields.
- **Breakpoints:** 390 (phone), 768 (tablet: icon sidebar), 1280+ (desktop).
- **Security in UI:** no tokens in localStorage; CV upload limited to PDF/DOCX ≤ 5 MB client-side; security headers in `next.config`.

---

## 9. Phases (one per session; stop at each gate)

For every phase: create a task list first, work through it, run `pnpm lint && pnpm typecheck && pnpm test`, update `docs/PROGRESS.md`, make one git commit per logical step, then **stop and report** what was built, what is left, and any mockup ambiguity.

### Phase 1: Foundation

Scaffold Next.js + TS strict + Tailwind v4 + shadcn/ui + pnpm. Tokens and fonts. ESLint/Prettier/Husky. Storybook. Vitest + Playwright configured. MSW wired (browser + node). `lib/config/nav.ts` and `routes.ts`. The three role shells (Sidebar, MobileNav, TopBar) matching S5, P2, A1. **Every route in section 5 created** with a placeholder page showing its screen code and title. Dev toolbar + middleware guards.
**Gate:** every route renders; every sidebar link works for each role; a Playwright test crawls `nav.ts` for each role and finds zero 404s; cross-role access redirects.

### Phase 2: Component library

All components in section 6 `components/shared` plus primitives restyled to tokens. Badges: Rehearsed, Flagged, Not drafted, V4 · Locked, Most chosen, Elite, N need work, Day 0, Proposed, Sample data. Domain components: RunwayTimeline (horizontal + vertical; done/next/locked/pick-slot), NextSessionHero, TaskList, SlotPicker, PlanCard, ScoreBar, ReadinessMeter, AnswerCard, FeedbackNote, ScoringForm, AvailabilityGrid, SeatGauge, LedgerRow, NotificationItem. Stories for every state incl. loading/empty/error and 390 px.
**Gate:** Storybook builds; components visually match `cover.png`.

### Phase 3: Student core

Fixtures + handlers for auth, onboarding, free session, plans, checkout, waitlist, runway, sessions, feedback. Build: S1, S2, E1, E2, E3, S3, E12, S4, E4, E5, S5, S9, E6, S10 (desktop + phone).
**Gate:** Playwright journeys pass: Join and buy a plan; First login, nothing booked; Locked out / wrong email; Payment fails; Cohort is full; Joined late; Session cancelled/moved/missed. Full sign-up → dashboard works at 390 px.

### Phase 4: Student tools and account

S6 CV Builder (bullet scoring on decision/number/trade-off; impact/clarity/defensibility), S7 versions + lock/re-lock request, S8 answer bank (filters Flagged / Not drafted; inline critique), S11, S12 (Elite lock), S13, S14 + E8, S15 + E9, E7, E10 (+ bell drawer), E11.
**Gate:** journeys pass: Prepare for Day 0; On a phone start to finish; Routes and extras; Upgrade mid-season; Day 0 moves; After Day 0. Export `docs/API_CONTRACT.md` (and an OpenAPI file from it).

### Phase 5: Panelist and Ops

Panelist: P1 apply, P2 today, P3 brief, P4 live scoring (verdict, note, send-back-to-builder switch), P5 availability. Ops: A1 cohort overview (seat gauges, free→paid funnel, revenue by tier, needs attention, this week), A2 students (table at 1,000 rows + detail), A3 assignment (load per function), A4 bookings (unassigned, no-shows), A5 ledger, A6 roster + application queue.
**Gate:** journeys pass: Become a panelist; Run a panel; Set availability; Weekly ops loop; Keep the panel healthy; **One panel, three roles** (a P2 booked by Riya appears in Ops A4, is assigned in A3, shows on Kaniksha's P2, is scored in P4, and feedback returns to Riya's S10 and S8, all in shared mock state); Target role changes; Not placed, credit carried over.

### Phase 6: Hardening and handover

All scenarios reachable by URL. Responsive pass at 390/768/1280. Accessibility audit (axe in Playwright). Bundle and Web Vitals budgets checked. All 21 journey specs green. `docs/OPEN_DECISIONS.md` complete. README with run, test, mock and "how to connect the real backend" steps.
**Gate:** `pnpm build` clean; every Definition of Done box ticked for every screen.

---

## 10. Definition of done (per screen)

- [ ] Matches mockup at 1280 px (and 390 px if a phone mockup exists)
- [ ] Reachable from nav or the previous journey step; no dead links
- [ ] Loading, empty, error, success states, each in Storybook
- [ ] Its scenarios open via `?scenario=`
- [ ] Keyboard usable, AA contrast, labelled fields
- [ ] Within JS / Web Vitals budget
- [ ] Covered by its Playwright journey

## 11. Open decisions (build as drawn, record in docs/OPEN_DECISIONS.md)

Seat hold 15 min after failed payment (E4) · Waitlist 24 h to claim, Season 1 price kept (E5) · Reschedule free up to 24 h, first no-show free (E6) · Live scoring layout + send-back switch (P4) · Upgrade price after top-up credit, not-placed full credit (E8, E7, A5) · Compressed runway (E3) · Panelist profile and tablet layouts not mocked · Payment gateway and Calendly embed vs native slot picker · Dark mode: tokens ready, ship light only.

## 12. Working rules for you (Claude Code)

- Plan before coding each phase; show the task list.
- Open the matching mockup PNG before each screen; mention which file you used.
- Ask before adding a dependency, changing the stack, or deviating from a mockup.
- Never leave TODO links or placeholder text in a finished screen.
- Keep commits small, with clear messages.
- At the end of each phase, stop. Do not start the next phase until I say so.
