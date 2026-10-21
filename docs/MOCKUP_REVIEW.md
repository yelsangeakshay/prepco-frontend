# Mockup review (first pass)

The 52 mockup PNGs were downloaded from the gallery (`https://prepcodashboard.vercel.app/shared/img/<slug>.png`)
into `design/mockups/`. They are 2x exports: 2880 px wide for 1440 css px, 780 px wide (390 css) for phone.

**Scope of this pass:** 6 of 52 images were compared with the running app: `cover`, `review`, `s05` (home),
`s04` (plans and checkout), `p02` (panelist today), `a01` (ops overview). The other 46 are not reviewed yet.
These six already show the build does **not** match the mockups, so the "Mockup" column in
`docs/DEFINITION_OF_DONE.md` stays open for every screen.

Screenshots of the app for comparison come from `node scripts/shot.mjs <role> <path> <out.png> [w] [h]`
(needs `pnpm start` running).

## A. Content that contradicts the mockups (highest impact)

These were invented in earlier phases because the PNGs were missing. The mockups define them.

| Item              | Mockup                                                                                                        | Built                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Basic price       | ₹5,999 (list ₹8,999, "33% off · Season 1")                                                                    | ₹14,999                            |
| Premium price     | ₹9,999 (list ₹17,999)                                                                                         | ₹36,999                            |
| Elite price       | ₹13,999 (list ₹26,999)                                                                                        | ₹59,999                            |
| Top-up prices     | Basic ₹1,799, Premium ₹1,299, Elite ₹999 ("Top-up mock")                                                      | not shown                          |
| Upgrade example   | Basic to Premium, ₹2,201 after top-up credit (`review.png`)                                                   | credit is a share of what was paid |
| Seats             | Finals 37 of 60 (23 left), Summers 20 of 40, Elite 17 of 22                                                   | Basic 300, Premium 400, Elite 50   |
| Tracks            | Plans are per track: a Finals / Summers toggle on the plans page                                              | no track toggle                    |
| Ops funnel        | 160 booked, 131 attended, 57 bought a plan (44%)                                                              | 1,000 / 820 / 700 / 565            |
| Ops revenue       | Basic 14 x ₹5,999, Premium 26 x ₹9,999, Elite 17 x ₹13,999, top-ups ₹41,350, season ₹6,23,293                 | ₹1.7 crore from 565 paid           |
| Not placed policy | "Your fee carries forward as full credit to the next season... No cash refund."                               | similar wording, different place   |
| Checkout          | Pay with UPI / Card / Net banking, order summary with list price and total, "Proposed · payment provider TBD" | single Pay button                  |

**Decision needed.** The brief asks for a 1,000-student generator (ops table at 1,000 rows), while `a01.png`
shows a cohort of 57 paid students. Options: (1) follow the mockup numbers everywhere and keep the 1,000-row
table as a separate performance fixture, (2) keep 1,000 and accept that A1 differs from the mockup.
I recommend (1).

## B. Shell: sidebar, header, page frame (all roles)

| Item                | Mockup                                                                                                                                                      | Built                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Wordmark            | `[ THE PREP CO. ]` with gold brackets (white brackets on cream), tagline "INCEPTION TO OFFER LETTER"; "PANELIST" and "OPS CONSOLE" under it for those roles | a maroon "P" square                                          |
| Nav items           | small dot bullet (gold on the active item), no icons                                                                                                        | lucide icons                                                 |
| Badges              | "ELITE" upper case; Panel assignment count is a maroon circle                                                                                               | "Elite"                                                      |
| Footer card         | "PREMIUM · FINALS" + "2 of 6 runway sessions done" + gradient bar; panelist "MARKETING & BRAND"; ops "SEASON 1 / Finals Day 0 · Mon 9 Nov"                  | "PREMIUM" only                                               |
| Page header         | no top bar. Maroon date eyebrow ("MON 5 OCT · WEEK -5 · FINALS TRACK"), Playfair H1 ("Good evening, Riya."), avatar top right (maroon RK, navy AM, gold OP) | top bar with name and college, navy avatar, H1 "Hello, Riya" |
| Top right (student) | "Day 0 in 35 days" pill with gold dot, bordered bell, avatar                                                                                                | bell, avatar                                                 |
| Top right (ops)     | "Export" button, gold OP avatar, "SAMPLE DATA" pill beside the date                                                                                         | none                                                         |

## C. Per screen

### S5 Home (`s05.png`, `s05-mobile.png`)

- Hero: navy card with a maroon glow top left, eyebrow "NEXT UP · WEEK -5", "IN 2 DAYS" pill, title
  "Domain deep-dive with a practitioner", line "Wed 7 Oct · 7:00 PM IST · run by a Marketing & Brand practitioner",
  two buttons ("Session details" cream, "Prep: 4 answers need work" outlined). Built: one button, panelist name shown.
- Day 0 is a **white** card: "DAY 0", a very large "35", "days · Mon 9 Nov 2026", "Day 0 doesn't move for anyone."
  Built: navy card.
- Runway card: "Runway to The Day", "Open runway →", status pills (DONE green, WED 7 OCT gold, PICK SLOT maroon),
  Day 0 labelled "You're in the room". Built: icons in the markers, plain text status, no pills.
- Three cards in a row: CV Builder (big 84, "/100 · Interview-defensible", Impact / Clarity / Defensibility bars),
  HR Question Builder (tiles 18 / 12 / 4, a flagged question), Latest panel · P1 (Ready for Day 0 64% bar, quote,
  "2 answers sent to your builder", "Read full feedback →"). Built: a right-hand column with a ring meter,
  CV score only, no "latest panel" card. The ring meter is not in the mockups: readiness is a bar.
- "This week" tasks use different copy (book deep-dive, redraft a flagged answer, draft an unprepared bullet,
  pick P2 slot). A "Quick Switch" card ("An agent that job-hunts while you don't... Set up Quick Switch") is missing.

### S4 Plans and checkout (`s04.png`)

- Three plan cards with "Runway coverage" segment bars (2 of 6, 6 of 6, 6 of 6), per-plan feature lists with
  ticks and crosses ("No P2 or P3 panel"), "Everything in Basic, plus", "Suggested from your free session" tag on
  Premium, Elite card is navy with a gold "BEST VALUE" tag, a footer line "Top-up mock · ₹1,299".
  Built: simple cards without coverage bars, crosses or the suggested tag.
- Finals / Summers segmented control with a seats bar ("Finals seats, season 1 · 23 of 60 left"). Missing.
- Checkout sits on the same page below the plans (payment method, "if you don't get placed" notice, order summary).
  Built: separate `/checkout/[plan]` page with a different layout.

### P2 Today (`p02.png`)

- Heading "Three panels tonight, Arjun." and date "MON 12 OCT 2026" (the mockup date is a week after "today").
- Four stat cards: Panels today 3, Feedback due 2, This season 12, Avg. feedback turnaround "20 h" (Proposed metric).
- "Tonight" is a table: time, student (initial avatar, plan and track), session, target, brief status pill
  (READ / NOT READ YET), action (Open scoring / Read brief). Riya Kulkarni is a P2 at 7:30 PM, Aditya Rao 6:00 PM,
  Neha Iyer 9:00 PM. Built: card rows, two panels, no brief-read status, no avatars.
- "Feedback due" list with DUE TODAY / DUE TOMORROW pills and a cream tip card "How a good panel works here". Missing.
  Built has "Coming up" and "Waiting for your score" instead.

### A1 Cohort overview (`a01.png`)

- Three seat cards with gradient bars (Finals 37/60, Summers 20/40, Elite 17/22) and a note "Seats close fifteen days
  before the process opens." Built: three plan gauges.
- "Free session → paid" as three stacked gradient bars with labels inside; "Revenue by tier" as a plain list with
  "Season to date ₹6,23,293". Built: funnel bars with a Recharts chart.
- "Needs attention" rows have one action each (Assign, Nudge, View, Review). Examples: "3 sessions without a panelist
  · including 1 target change: Sana Qureshi, now Finance & Banking", "Rohan Desai hasn't booked P2", "Karan Shah:
  Basic ended after P1 · upgrade quote sent · ₹2,201". Built: counts that link to other pages.
- "This week" is a navy card with four figures (sessions scheduled 46, free sessions 12, feedback overdue 0, panelists
  active 31 of 52) and "Finals Day 0 in 35 days." Built: a bar chart.

### Other screens

Not compared yet. From `review.png`, the mockups also define screens and states that may not exist in the build:
E1 to E12 boards, "Application approved/declined, onboarding call, payouts" and "Season setup" are marked BACKLOG.
The ten open decisions in `review.png` (no-show, reschedule window, payment provider, season-2 price, late joiners,
waitlist order, placed early, colleges, panelist pay, who runs free sessions) should be copied into
`docs/OPEN_DECISIONS.md` as the owners' list.

## D. What I would do next (needs your go-ahead)

1. **Decide the cohort scale** (section A), then change fixtures and copy to the mockup numbers and prices.
2. **Shell pass** (one change, all roles): wordmark, dot nav, footer cards, page header pattern, avatars.
3. **Rebuild three screens to match**: S5 home, P2 today, A1 overview. Then S4 plans with checkout.
4. **Review the remaining 46 PNGs** in batches (student, panelist, ops, phone, edge cases), writing findings here
   before changing code.
5. Re-run axe, bundle and Playwright after each batch. Update `docs/DEFINITION_OF_DONE.md` only where the
   screen was compared with its PNG.

The PNGs add about 31 MB. Say whether they should be committed or kept out of git (add `design/mockups/` to
`.gitignore`).
