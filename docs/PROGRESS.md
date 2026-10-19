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
- Bundle: shared 102 kB. Most routes are under 170 kB. Over budget (to fix in Phase 6): `/onboarding/[step]` 176, `/waitlist` 175, `/forgot-password` and `/reset-password/[token]` 173, `/sign-in` and `/sign-up` 170.
- Not done: visual match to mockups (PNGs absent); Storybook stories for Phase 3 view components (they are data-driven pages; stories for their parts exist from Phase 2).
