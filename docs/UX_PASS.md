# UX pass: loading feedback and declutter

Use this file to track and resume the UX pass in a new Claude Code session. It follows the same working method as
`docs/RESUME.md` (build, screenshot, verify), but the goal is different: make the app feel calm and responsive, not
match the mockups pixel for pixel.

## Goal

1. Every navigation and every submit gives visible feedback, so a click never looks ignored.
2. Cut the visual noise (overline labels, badges, mixed fonts) so each screen has one clear focus.

## Status

| Phase   | Scope                                                            | Depends on | State |
| ------- | ---------------------------------------------------------------- | ---------- | ----- |
| Phase 0 | Decision: usability vs mockup fidelity for badges, titles, Home  | none       | done  |
| Phase 1 | Loading feedback: spinner, button loading, nav bar, auth flows   | none       | done  |
| Phase 2 | Tokens: type scale, tabular numbers, badge tones, page skeletons | none       | done  |
| Phase 3 | Layout: page names, filters, lists, spacing (Home layout kept)   | Phase 0, 2 | done  |

States: to do, in progress, done, blocked, open (waiting on a decision).

## Findings (baseline, 2026-10-23)

Screens reviewed: sign-in, student home/journey/sessions/feedback/answers/plans, panelist today/scoring, ops
overview/students, at 1440 px and 390 px.

Loading:

- No spinner component exists, and there is no navigation progress indicator. In dev a sidebar click shows the old
  page for 1 to 5 seconds.
- Every route group `loading.tsx` renders the same generic `PageSkeleton`; most data loads client side, so it barely
  shows and then a different layout pops in.
- Sign-in: `signIn.isPending` turns false before `router.push` completes, so the button flips back to "Sign in"
  during the redirect and invites a second click (`features/auth/components/SignInForm.tsx`).
- Sign-in is silently disabled while the mock API boots (`!ready`).

Clutter:

- Small uppercase overline labels on nearly every card (about 12 on student Home), plus a page-level overline.
- Too many badges, several of them marketing rather than status. Panelist "Sent" shows NEEDS WORK in green, same as
  READY.
- Page titles are slogans ("Eight weeks, mapped before you start."). Nav names disagree across surfaces: sidebar "HR
  Question Builder", phone tab "Answers", page "Your answer bank".
- Home has eight cards of equal weight; "Day 0 in 35 days" appears three times and "4 need work" twice; the Day 0
  card is mostly empty.
- Playfair Display renders numbers (84, ₹6,23,293) with old-style figures and an awkward ₹ glyph.
- Caveat is loaded on every page and used nowhere.
- Badge text is about 10 to 11 px bold uppercase.
- Same action, different verbs: "Score Now" and "Start Scoring". "Mark Rehearsed" looks like plain text next to two
  buttons.
- Answers stacks three filter systems (tabs, stats row, pills).
- Panelist "Sent" is 13 full cards; ops lists are similar.
- Card padding and gaps vary from about 16 to 32 px.
- Sign-in: generic person icon on the Google button, "Forgot?" heavier than the labels, the "New here?" card repeats
  the "Create account" tab.

## Phase 0: decision

- [x] Owner decides whether usability overrides the mockups for: badge set and colours, slogan page titles, Home
      layout. Record the answer in `docs/OPEN_DECISIONS.md` and here.

## Phase 1: loading feedback

Tasks:

- [x] 1.1 `components/ui/spinner.tsx`.
- [x] 1.2 `Button` gets a `loading` prop: overlay spinner (label kept, so width is stable), `aria-busy`, disabled.
      Disable immediately, show the spinner only after 150 ms. `loading` is a type error together with `asChild`
      (56 call sites use `asChild`; a Slot takes one child, so a spinner cannot be injected). Replace the ad hoc
      `isPending ? "…" : ""` labels.
- [x] 1.3 `NavProgress` (2 px maroon top bar) mounted in `components/shell/Providers.tsx`, plus a `useNavigate()`
      hook that wraps `router.push`/`replace` in `startTransition` and drives the bar. Migrate the 23 direct
      `router.push`/`replace` calls.
- [x] 1.4 `useLinkStatus` pending state on Sidebar and MobileNav items only.
- [x] 1.5 Auth and form flows: sign-in, sign-up, Google, recovery, onboarding steps, CV upload, checkout, panelist
      apply.
- [x] 1.6 Middleware: a signed-in user on `/sign-in` or `/sign-up` goes to the role home.
- [x] 1.7 Remove Caveat from `app/layout.tsx` and the `--font-hand` token.

Edge cases to cover:

| ID  | Case                                                                                                                   | Handling                                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| E1  | Click on the current URL, a hash-only link, or a link the middleware redirects back to the current page: URL unchanged | Skip same-URL and hash clicks; hard stop the bar after 10 s                                                            |
| E2  | Search-param-only navigation (`?tab=`)                                                                                 | Key completion on pathname plus search params                                                                          |
| E3  | Ctrl/Cmd/Shift/middle click, `target="_blank"`, `download`, external origin                                            | Do not start the bar                                                                                                   |
| E4  | Browser back/forward                                                                                                   | Start on `popstate`, same 10 s cap                                                                                     |
| E5  | Fast navigation flicker                                                                                                | Show after 150 ms, stay at least 300 ms once shown                                                                     |
| E6  | Programmatic navigation is invisible to a click listener                                                               | All code navigation goes through `useNavigate()`                                                                       |
| E7  | Screen readers, reduced motion, phone notch                                                                            | Bar `aria-hidden`; polite "Loading page" after 1 s; static bar under `prefers-reduced-motion`; respect safe-area inset |
| E8  | `loading` on an `asChild` button                                                                                       | Type error; links use `useLinkStatus`                                                                                  |
| E9  | Label change shifts width                                                                                              | Spinner overlays the label; no two-stage text                                                                          |
| E10 | Instant mutations flash a spinner                                                                                      | 150 ms delay before the spinner                                                                                        |
| E11 | Sign-in success and `email_unverified` both redirect after `isPending` is false                                        | `startTransition(() => router.push(...))`; button busy until the transition ends                                       |
| E12 | Fields editable during submit                                                                                          | Wrap the form in `<fieldset disabled>`; disabled default button already blocks Enter                                   |
| E13 | Mock service worker never becomes ready (private window, SW blocked)                                                   | "Preparing…" for up to 8 s, then "Couldn't connect" with Retry                                                         |
| E14 | Back button restores the auth page from bfcache with a frozen spinner                                                  | Reset form state on `pageshow` with `persisted`                                                                        |
| E15 | Signed-in user opens `/sign-in`                                                                                        | Middleware redirect (task 1.6)                                                                                         |
| E16 | Same redirect gap in other forms                                                                                       | Task 1.5                                                                                                               |

Done when:

- A Playwright spec with a 2 s artificial API delay shows: a double click on sign-in sends one request; the button
  stays busy until the role home renders; clicking the current nav item never leaves the bar running; a modified
  click opens a tab without starting the bar.
- `a11y.spec.ts`, `responsive.spec.ts` and `webvitals.spec.ts` still pass.
- Standard verification below passes.

## Phase 2: tokens and skeletons

Tasks:

- [x] 2.1 Type scale tokens 12 / 14 / 16 / 20 / 28 / 40 in `styles/tokens.css`; no text below 12 px.
- [x] 2.2 Numbers in Inter with `tabular-nums`; Playfair only for page and section headings. Keep `en-IN` grouping.
- [x] 2.3 A single `statusTone()` mapping (done = green, action needed = maroon, upcoming = neutral, premium = gold)
      used by every feature instead of per-feature tones. Fixes the green NEEDS WORK.
- [x] 2.4 One skeleton per page (Home, Sessions, Answers, Scoring, ops tables), used by both the route `loading.tsx`
      and the client query state.

Edge cases to cover:

| ID  | Case                                            | Handling                                                                        |
| --- | ----------------------------------------------- | ------------------------------------------------------------------------------- |
| E17 | Route skeleton then a different client skeleton | Same component in both places                                                   |
| E18 | Skeleton on every revisit                       | Skeleton only on `isPending` (no cached data); background refetch shows nothing |
| E19 | Error or empty result while a skeleton shows    | Replace with ErrorCard or EmptyState, never keep the skeleton                   |
| E20 | Status tones scattered per feature              | `statusTone()` is the only source                                               |
| E21 | Indian number grouping after the font change    | Confirm the `en-IN` formatter is still applied                                  |
| E22 | 12 px minimum wraps badges in ops tables        | Check at 390 and 1440 px                                                        |

Done when screenshots of the reviewed screens show no old-style numerals, no text under 12 px, and every status badge
uses the four tones; standard verification passes.

## Phase 3: layout

Starts after the Phase 0 answer and Phase 2.

Tasks:

- [x] 3.1 Page titles name the page ("Sessions", "Answer bank"); slogan moves to the subtitle. One name per screen
      across sidebar, phone tab, page title and `metadata.title`.
- [x] 3.2 One verb per action across the app ("Start scoring" everywhere); one primary button per region.
- [x] 3.3 At most one overline per card; drop page overlines except on Home; marketing badges become plain text.
- [ ] 3.4 (skipped by decision, see below) Home: one "Do this next" card, then the runway, then three compact summary cards; Day 0 count shown once;
      "This week" above Quick Switch.
- [x] 3.5 Answers: one filter row with counts.
- [x] 3.6 Long lists (panelist Sent, ops lists): compact rows, latest 5, "Show all".
- [x] 3.7 Spacing: card padding 24 px, card gap 24 px, dense rows for read-only info.
- [x] 3.8 Sign-in polish: Google "G" mark, "Forgot?" at label weight, drop the duplicate "New here?" card on desktop.

Edge cases to cover:

| ID  | Case                                                            | Handling                                                                                                                                                                       |
| --- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| E23 | Deep link or notification targets a row hidden under "Show all" | Auto-expand and scroll to the row; focus the first revealed row on expand                                                                                                      |
| E24 | "Do this next" priority across home states                      | Defined order for `first-login`, `gmail-unverified`, `basic-ended`, `target-change`, `returning-student`, waitlist, feedback pending, post Day 0, and an "all set" empty state |
| E25 | Renamed headings break tests                                    | Update the 6 test files that assert text, story snapshots and browser titles in the same change                                                                                |

Done when every Home scenario renders a sensible "Do this next" card, the reviewed screens are re-screenshotted and
compared with the baseline, and standard verification passes.

## Standard verification

Same as `docs/RESUME.md`: `pnpm exec tsc --noEmit`, `pnpm exec eslint`, `pnpm exec vitest run`,
`pnpm check:bundle` (under 170 KiB per route), Playwright against the production server for the affected specs plus
`a11y.spec.ts` and `responsive.spec.ts`, and `pnpm test:stories` at the end of each phase.

## Working method

- One branch per phase (`ux-phase-1` and so on), merged to main when its "Done when" list passes.
- Tick tasks here as they land and update the Status table.
- Screenshots: `MSYS_NO_PATHCONV=1 node scripts/shot.mjs <role> <path> <out.png> [w] [h]`, outputs outside the repo.

## Phase 1 notes (done)

- Shipped on branch `ux-phase-1`: `Spinner`, `Button` `loading`, `NavProgress` plus `useNavigate()` (all 23 code
  navigations migrated), `LinkSpinner` in the sidebar and phone nav, auth and form flows, the signed-in redirect on
  `/sign-in` and `/sign-up`, and Caveat removed.
- The top bar rarely shows in a production build: every route group has a `loading.tsx`, so the URL commits and the
  skeleton shows within a few hundred ms. It matters most for slow dev compiles. Page-specific skeletons (Phase 2) are
  the main production feedback. Timing is covered by `components/shell/NavProgress.test.tsx`, not e2e.
- E2E: `tests/e2e/loading-feedback.spec.ts` (double click, busy until render, signed-in redirect, service worker
  blocked).
- Out of scope, still to do in a later phase: replace the remaining `isPending ? "Saving…"` labels in other features
  (answer bank, CV builder, ops, billing, waitlist) with `loading`.

## Phase 2 notes (done)

- 2.1: `styles/tokens.css` defines the scale (12 / 14 / 16 / 20 / 28 / 40; `text-title` and `text-hero` are the new 28 and
  40). Every `text-[9|10|11px]` is now `text-xs` (12 px), including badges and the logo tagline. Badge tracking went
  from `wider` to `wide` so 12 px labels fit. Badges stay uppercase; "normal case" was left to Phase 3 with the other
  label changes.
- 2.2: `font-num` utility (Inter, tabular and lining figures) replaces `font-display` on 29 figure elements (scores,
  prices, counts, Day 0). `.font-display` now sets lining numerals so headings with numbers no longer use old-style
  digits. `formatINR` is unchanged, so Indian grouping stays (checked on ops overview: ₹6,23,293).
- 2.3: `lib/status.ts` `statusTone()` is the one source of badge colour for a status word. Twelve call sites use it.
  Panelist "Needs work" is now maroon and "Ready" green. Booked, Watch, Okay and Cancelled are neutral; Elite is gold,
  Premium soft gold. Tests in `lib/status.test.ts`.
- 2.4: `components/shared/PageSkeletons.tsx` holds Home, Sessions, Answers, panelist list and ops overview/table
  skeletons. Each is used by the route's new `loading.tsx` and by the view while its first query is pending. They live
  in their own file because adding them to `Skeletons.tsx` pushed routes over the 170 KiB budget.
- Bundle: `NavProgress` is now loaded after first paint (dynamic import in `Providers`), like the toaster. Phase 1 plus
  Phase 2 had put `/panelist/availability` at 170.5 KiB; it is 169.5 KiB now. The tightest route is `/home` at about
  169.9 KiB, so the next addition to shared code needs the same care.
- Regression caught and fixed: Inter at 4xl made the plan price card 2 px wider than the tablet viewport on `/plans`;
  the price row now wraps.
- Known and unchanged: phone web-vitals LCP fails on 3 of 6 routes on `main` as well.
- Not done here: skeleton shape for Answers inside the view is the list only (the view draws its own header), and ops
  table pages keep the table's own loading rows under a real header.

## Phase 0 decision (2026-10-23): Option C

Usability wins for page titles and badges. The Home layout stays as the mockup draws it. Task 3.4 and edge case E24 are
therefore out of scope. Rationale and the deviations are listed in `docs/OPEN_DECISIONS.md`.

## Phase 3 notes (done)

- 3.1: one name per screen. The sidebar, More sheet, page title and browser title agree: "Answer bank" (was "HR Question
  Builder" in the sidebar, "Your answer bank, built from your own CV." on the page), "Sessions & runway", "Journey &
  routes", "Case track", "Quick Switch", "Plans", "Plans & credits" (ops). The slogans moved into the subtitle. The phone
  tab keeps the short forms "Answers" and "Sessions". Home keeps its greeting title.
- 3.2: panelist "Score Now" and "Start Scoring" are both "Start scoring". Other button labels were left alone: changing
  their capitalisation touches many tests for little gain.
- 3.3: page overlines are gone on Billing, Sessions, Journey, Case track, Quick Switch, Plans, Answers, Availability and the
  ops hub pages; any information in them moved into the subtitle. Marketing pills ("In every plan", "Priority slot
  booking", "Elite", "For route four") are removed; status pills (Live/Paused, Sample data) stay. Home, panelist Today and
  ops overview keep their date overline, and detail pages keep theirs.
- 3.5: Answers has one filter row: the round tabs and the status pills with counts. The separate stats row is removed.
  Counts are for the whole bank, as the API returns them.
- 3.6: the panelist "Sent" list shows the latest 5 in compact rows with a "Show all" button. A link to `#<sessionId>`
  opens the list first, and focus moves to the first newly shown row. Ops lists were already paginated tables.
- 3.7: default card padding is 24 px (was 20 px). Gaps between cards were left as they are.
- 3.8: Google button has the four-colour G, "Forgot?" is label weight, and the duplicate "New here?" card is gone on
  desktop (the Create account tab covers it).
- Phone web-vitals LCP fails on some routes on every run, with or without these changes; `main` fails 3 of 6.
