# Progress

## Phase 1: Foundation: done (gate pending e2e confirmation)

- Next.js 15 + React 19 + TS strict + Tailwind v4 + pnpm
- Tokens (`styles/tokens.css`), fonts via `next/font`
- ESLint, Prettier, Husky + lint-staged, Vitest, Playwright
- MSW v3 wired (browser + node), `GET /me` handler, typed API client with Zod
- `lib/config/nav.ts`, `routes.ts`, `screens.ts`, `scenarios.ts`; `lib/utils/clock.ts`
- Role shells: Sidebar (full / icon rail), MobileNav (bottom bar + More sheet), TopBar
- All 47 routes created as placeholders; loading/error per group; branded 404
- Dev toolbar + `middleware.ts` guards (signed out, cross-role, first-login)

Not done in Phase 1: Storybook (see report), real screens, mockup fidelity pass.

## Phase 2: Component library: done

- Primitives restyled to tokens: Button, Badge, Card, Input/Textarea/Label, Switch
- Shared: StatCard, ProgressBar, ScoreBar, ReadinessMeter, CountdownCard, RunwayTimeline (horizontal + vertical + auto), DataTable (TanStack Table v8 + Virtual above 200 rows), FunnelBars, EmptyState, ErrorCard, Skeletons, 10 named badges
- Domain: NextSessionHero, TaskList, SlotPicker (keyboard radiogroup, slot-taken error), PlanCard, AnswerCard, FeedbackNote, ScoringForm (RHF + Zod), AvailabilityGrid, SeatGauge, LedgerRow, NotificationItem
- Stories for every state (default, loading, empty, error where relevant) plus 390 px
- 16 unit tests total; Storybook builds

Not verified: visual match to `cover.png` (file absent). Gold text is not used on cream; gold appears only as a fill with navy text or as text on navy.

## Phase 3: Student core: done

- Mock layer: `mocks/db.ts` (shared state, rebuilt per scenario), handlers for auth, onboarding, plans/checkout/waitlist, runway/sessions, feedback; 200 to 600 ms latency
- Typed API: `lib/api/endpoints.ts` + Zod schemas per feature + feature hooks (no fetch in components)
- Screens: S1 sign-in/up, E1 forgot/reset/verify, S2 onboarding 1 to 3 with local drafts, E2 CV upload (consent, reading/done/failed), E3 late-joiner, S3/E12 free session, S4 plans, E4 checkout (failed with seat hold, success receipt), E5 waitlist, S5 home, S9 sessions, E6 session detail (book/reschedule/cancel, cancelled/moved/missed), S10 feedback list + detail
- Tests: 26 unit tests; Playwright journeys for join and buy, first login, locked out, payment fails, cohort full, joined late, session cancelled/moved/missed, phone sign-up at 390 px
- Bundle: see Phase 4 notes for the current numbers.
- Not done: visual match to mockups (PNGs absent); Storybook stories for Phase 3 view components (they are data-driven pages; stories for their parts exist from Phase 2).

## Phase 4: Student tools and account: done

- Screens: S6 CV Builder (bullet editor with live decision/number/trade-off tests, draft score, lazy preview), S7 versions + lock / re-lock request, S8 answer bank (Flagged / Not drafted filters in the URL, debounced search, pagination, inline critique, optimistic flag), S11 journey and routes, S12 case track (locked view unless Elite), S13 Quick Switch, S14 billing, E8 upgrade (price after top-up credit), S15 profile, E9 change target, E7 outcome, E11 placed and not-placed results, E10 notifications page plus bell drawer on every student page
- TipTap loads only when an editor opens; the re-lock modal, bell drawer and phone More sheet load on first use
- Replaced @hookform/resolvers with a 30-line Zod resolver (lib/forms/zodResolver.ts)
- API: contract in lib/api/contract.ts, docs/openapi.json generated from it
- Tests: 41 unit tests; Playwright journeys for Prepare for Day 0, Routes and extras, Upgrade mid-season, Day 0 moves, After Day 0, Target role changes, and On a phone start to finish
- Bundle (First Load JS, budget 170 kB): most routes now 162 to 170 kB. Still over: forms with React Hook Form + Zod (onboarding steps, waitlist, profile, change target, outcome, forgot/reset password, sign-in and sign-up, at 173 to 180 kB). Phase 6 options: zod/mini, or plain controlled forms for the small ones.
- Known limit: mock state lives in the page, so a hard reload resets bookings, upgrades and edits. Phase 5 needs to decide whether to persist it for the one-panel-three-roles demo.
