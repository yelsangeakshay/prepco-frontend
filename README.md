# The Prep Co: web app UI

The logged-in web app for The Prep Co (theprep.co.in): **Student**, **Panelist** and **Ops** roles.
This repository is the complete UI, running on mock data. There is no backend yet. The UI talks HTTP
through a typed API layer, Mock Service Worker (MSW) answers, and a real backend replaces the mocks by
changing two environment variables.

The build brief is `PREPCO_UI_BUILD_PROMPT.md`. Progress and decisions are in `docs/`.

## Run it

Requirements: Node 20+ and pnpm.

```bash
pnpm install
cp .env.local.example .env.local      # mocking on by default
pnpm dev                               # http://localhost:3000
```

Use the wrench button (bottom right, development only) to switch **role** (Student Riya, Panelist Kaniksha,
Ops) and **scenario**. The role is a cookie, so you can also set it by hand.

### Sample world

- Today is pinned to **Mon 5 Oct 2026**, Day 0 is **Mon 9 Nov 2026** (`lib/utils/clock.ts`).
- Riya Kulkarni (student), Kaniksha Bambode (panelist), the Ops team.
- 1,000 students, 52 panelists, about 700 bookings, a ledger and an application queue, all from a
  fixed seed (`mocks/world.ts`).
- The mock world is shared by the three roles and is saved in `sessionStorage`, so a reload or a role
  switch keeps your bookings, scores and assignments. Close the tab or change scenario to start fresh.

### Scenarios

Open any edge case by URL: add `?scenario=<name>`. The name is remembered in a cookie.

`payment-failed`, `payment-success`, `cohort-full`, `late-joiner`, `cv-upload-failed`,
`panelist-cancelled`, `student-reschedule`, `no-show`, `day0-moved`, `placed`, `not-placed`,
`first-login`, `gmail-unverified`, `basic-ended`, `target-change`, `returning-student`.

Example: `/sessions/s-1003?scenario=panelist-cancelled`. Sign in as the student first (toolbar, or the
`prepco_role=student` cookie).

## Check it

```bash
pnpm lint && pnpm typecheck && pnpm test     # unit tests (Vitest)
pnpm build && pnpm check:bundle              # production build, then the 170 KiB first-load budget
pnpm test:e2e                                 # Playwright: journeys, scenarios, responsive, a11y, vitals
```

Playwright runs against a production build (`pnpm build && pnpm start`). Projects: `desktop` (1280),
`phone` (390) and `tablet` (768, responsive checks only). First time: `pnpm exec playwright install chromium`.

What the e2e suite covers:

| Spec                                                | What it proves                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------- |
| `foundation`                                        | every route renders, every nav link works per role, role guards redirect        |
| `student-journeys`, `student-tools`, `panelist-ops` | the 21 journeys from the brief (`tests/journeys.test.ts` checks they all exist) |
| `scenarios`                                         | each of the 16 scenarios opens by URL and shows its effect                      |
| `responsive`                                        | no sideways scroll on any screen at 390, 768 and 1280; shell matches the width  |
| `a11y`                                              | axe, WCAG 2.1 AA, on every screen for every role, plus open dialogs and drawers |
| `webvitals`                                         | LCP < 2.5 s, INP < 200 ms, CLS < 0.1 on a throttled phone (4G, 4x CPU)          |

## How the data layer works

```
page -> feature hook (features/*/hooks) -> TanStack Query -> typed function (lib/api/endpoints/*)
     -> fetch /api/v1/... -> MSW handler (mocks/handlers/*) -> Zod-parsed response
```

- No fetch calls inside components. Only hooks from `features/*/hooks`.
- Every response is parsed with the Zod schema in `features/*/schemas.ts`. A real backend must honour
  the same shapes: see `docs/API_CONTRACT.md` and `docs/openapi.json`.
- Slot booking, assignment, scoring and payments are never optimistic. Flagging an answer and marking a
  notification read are.
- Route strings come from `lib/config/routes.ts`; sidebar links only from `lib/config/nav.ts`.

## Connect the real backend

1. Set the environment (for example in `.env.production`):

   ```bash
   NEXT_PUBLIC_API_MOCKING=off
   NEXT_PUBLIC_API_BASE_URL=https://api.theprep.co.in/api/v1
   ```

   With mocking off the worker is never loaded and nothing else changes: no page or component edits.

2. Implement the endpoints in `docs/openapi.json` (generated from `lib/api/contract.ts`). Regenerate the
   file after changing a schema with `pnpm exec vitest run lib/api/openapi.test.ts`. Error bodies are
   `{ "code": string, "message": string }`; the UI branches on `code`.

3. Replace the mock session. Today `middleware.ts` reads the dev cookies `prepco_role`,
   `prepco_onboarded` and `prepco_scenario`. Production needs a real session:
   - issue an **httpOnly** cookie from the backend; never put tokens in `localStorage`;
   - make `lib/auth/session.ts` (`getRole`) and `middleware.ts` read that session;
   - drop `startMockSession` in `lib/auth/client.ts` and let the sign-in endpoint set the cookie;
   - the dev toolbar is already removed from production builds.

4. Send the cookie: `lib/api/client.ts` already uses `credentials: "include"`. If the API is on another
   origin, enable CORS with credentials, or proxy `/api/v1` through Next.js `rewrites`.

5. Decide the open questions in `docs/OPEN_DECISIONS.md` (prices, refund and credit rules, scoring
   rules, the payment gateway, Calendly versus the native slot picker). The UI shows a **Proposed**
   badge wherever it assumes a rule.

6. Remove what is mock-only when you are ready: `mocks/`, `public/mockServiceWorker.js`, and the
   scenario header in `lib/api/client.ts`.

## Project map

```
app/            routes: (public) (onboarding) (student) (panelist)/panelist (admin)/ops
components/     ui (primitives), shell (sidebar, bottom bar, bell), shared (cards, tables, timeline)
features/       one folder per feature: components, hooks, schemas
lib/            api (client, endpoints, contract, openapi), auth, config (nav, routes, scenarios), utils
mocks/          handlers, shared world (world.ts), persistence, scenarios
tests/          e2e (Playwright), journeys.test.ts
docs/           PROGRESS, OPEN_DECISIONS, API_CONTRACT, openapi.json, DEFINITION_OF_DONE
```

## Design notes

- Tokens live in `styles/tokens.css`. `--navy-400` (secondary text) is `#566170`, a little darker than the
  `#6B7785` on the cover sheet, so secondary text passes WCAG AA on the cream background.
- Light mode only. The tokens are ready for dark mode.
- Mockup PNGs were not available while this was built (`design/mockups/` is empty). Layout follows the
  brief's text and tokens. See `docs/DEFINITION_OF_DONE.md` for what that leaves open.
