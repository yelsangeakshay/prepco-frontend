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

## Batch 1: student early flow

Compared with the running app (desktop 1440 px and phone 390 px): `s01`, `s01-mobile`, `s02`, `s02-mobile`, `s03`,
`s03-mobile`, `e01`, `e02`, `e03`. `e01` is the account recovery board (forgot, link sent, new password, plus the
"add your college email" banner), `e02` is the CV upload step, `e03` is the late joiner screen.

### What differed and what changed

| Screen              | Was                                                                                 | Now                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S1 sign in, sign up | Centred card, plain fields, a "Sign In" title row                                   | Split frame: navy brand panel (season eyebrow, "You get one shot at The Day.", three ticks, footer line) and cream form with Sign in / Create account tabs, "Continue with Google", "or with email", "College email", "Forgot?", "New here?" card. Phone: navy header, form, "New here? Create an account" at the foot                                                                     |
| E1 recovery         | Cards with other copy ("works for one hour", success hid the email)                 | Header bar with "Back to sign in". Forgot ("works for 30 minutes"), Link sent (email shown, "Resend link" locked on a 0:42 countdown, "Use a different email"), New password (live "At least 8 characters" and "Passwords match" ticks, "Save and sign in"). Verify page is the "Add your college email" banner with Later and Verify college email                                        |
| S2 onboarding       | Three plain form steps in a card, a progress bar, target as a select plus free text | Header bar with wordmark, three named steps and "Save & exit". Step 1 About you (college, batch, years, experience). Step 2 "Where are you headed, and when?": process cards, target role pills, panel note, Day 0 date, companies, runway callout, "What happens next" and "CV Builder · always free" side cards. Phone: back chevron, "Step 2 of 3", three bar segments, sticky Continue |
| E2 CV upload        | Single card, "CV read successfully" with role and bullet counts                     | Title "Upload the CV you have today", Reading (in progress bar), Done ("This is your V1.", section counts, "First score: 46/100", "Finish and book free session") and Error ("We couldn't read this file", "Upload another file", "Enter manually") states, drop zone with "PDF, DOC, DOCX", and the "Your panel sees your history" consent box                                            |
| S3 free session     | A slot picker, and a "free session already used" card                               | The mockup draws the page after the session: left cards (session with Completed pill, Add to calendar, Reschedule, "What we cover in 30 minutes"), the written summary (headline, 3 roles, CV markup, two answers, "Suggested runway" card). Phone shows the short version. Booked and slot-picking states use the same frame                                                              |
| E3 late joiner      | A banner on Home and a shortened runway                                             | `/plans` shows "The full runway doesn't fit. Here's what does." for the `late-joiner` scenario: compressed runway table (FITS and DROPPED rows), "Basic + one top-up mock." recommendation (₹5,999 + ₹1,799), "Or start properly next season". Day 0 is 19 days away in that scenario, as drawn                                                                                            |

Supporting changes: the Wordmark tagline uses a darker gold on cream (the shell gold failed contrast there); the
profile schema moved the track and added the Day 0 date and companies (`targetRole` is gone, the pill is the
target); the mock CV result now reports education, work bullets, projects, achievements and a first score; the free
session endpoint returns a `summary` once the session is used; the plans endpoint returns `lateJoiner` for the
scenario; `/onboarding/3` redirects to the CV upload (step 3 of 3 in the new flow).

### Left as it was, with reason

- Consent for panelists to read the CV history is drawn ticked. It stays unticked and required, because a pre-ticked
  consent box is not valid consent. The mockup's other copy is used verbatim.
- "Continue with Google" shows a toast that Google sign-in is not connected. The OAuth provider is undecided.
- "Add to calendar" downloads a one-event .ics file built in the browser. "Reschedule" opens Sessions. The
  Calendly flow behind them is an open decision (S9).
- The mockup's "Edge case ·" and "Three states of one screen" eyebrows are board labels, not page copy, so they are
  not shown.
- The "9 weeks to Day 0. Enough for the full runway." example assumes a different "today"; the callout is computed
  from the mock clock (5 Oct), so the default Day 0 of 9 Nov reads "5 weeks to Day 0" with the compressed note.
  The wording for under 8 weeks is Proposed. Pick a Day 0 at least 8 weeks out to see the drawn text.
- E3 rows, the recommendation and the policy are drawn as "Proposed policy" and stay Proposed. "Choose Basic +
  top-up" goes to the Basic checkout; the top-up is not added to the order in the mock.
- Sign-up copy and fields (full name, college email) are not drawn; they follow the sign-in frame and stay Proposed.
- The "About you" summary strip on step 2 only shows after step 1 was filled in this browser.

## Batch 2: student sessions, tools and account

Compared with the running app (desktop 1440 px, phone 390 px where a phone mockup exists): `s08`, `s08-mobile`,
`s09`, `s09-mobile`, `s10`, `s10-mobile`, `s11`, `s12`, `s13`, `s14`, `s14-mobile`, `s15`. `s07` (CV version
history) was looked at but not changed, see "Left as it was".

### What differed and what changed

| Screen                 | Was                                                                                    | Now                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S9 sessions and runway | Horizontal timeline card plus a list of session cards                                  | One vertical timeline (week label, node, card). Each row has its runway line, DONE with Notes or View feedback, BOOKED with Reschedule, SCHEDULED, OPENS AFTER P2. The first open session shows its slots inline (four P2 slots as drawn, the second chosen) with "Confirm Mon 12 Oct, 7:30 PM". Day 0 closes the line as a navy row. Side cards: "Run out of sessions?" (₹1,299 at the Premium rate, All top-ups) and "Your panel". Phone: flat timeline, the open session is the only card |
| S10 panel feedback     | A feedback note card with three score bars and a verdict pill                          | Detail page for one panel: P1 eyebrow with the Baseline pill, "Where you are before anyone coaches you.", Download report, panelist card, Ready for Day 0 64% bar, "Question by question" (Strong, Flagged, Okay rows with SITUATION / DECISION / RESULT chips and "In your builder"), "Fix before P2", navy "Panel's summary" and "Book your P2 slot". Phone: readiness, summary, short comments, "Fix flagged answers"                                                                     |
| S8 HR Question Builder | A list of answer cards, search box, and a separate detail page with a rich text editor | List and editor side by side. Header with the 18 / 12 / 4 counts, Fit round (14) and CV deep-dive (4) tabs, All / Rehearsed / Flagged / Not drafted chips, "+ 7 more in Fit round". The editor has Situation, Decision and Result fields, the panel note with chips, the "Rehearse in my next panel" switch, Save draft, Send for review. The drawn rows and question wording are the fixtures. Phone: stat cards, list, and a row opens its own page                                        |
| S11 journey and routes | A four-step checklist and three "routes open to you" cards                             | "Where you are": seven stages (dashed before joining, Term 5–6 now with a bar, navy Offer letter), "You joined at Term 5–6", "Four routes to an offer" with Your route and Powered by Quick Switch, and the closing quote                                                                                                                                                                                                                                                                    |
| S12 case track         | A locked card for anyone below Elite, a plain module list for Elite                    | The track is always shown as a "Sample view" with the drawn steps (Upload deck, Book, Later, Unlocks on placing), "What's in the track", "Route one" and "Elite seats 5 of 22 left". Below Elite a navy banner says "Preview · Included with Elite" with "Upgrade to Elite · ₹4,000"                                                                                                                                                                                                         |
| S13 Quick Switch       | A "compare two functions" tool                                                         | The job-hunting agent: stats (20, 3, 7+, 7 days), "Today's digest · 3 new matches" with fit scores 96, 91, 88, Save and View listing, and a Preferences card (switch, roles, locations, minimum fit, email, Save preferences). The old comparison stays below, marked Proposed                                                                                                                                                                                                               |
| S14 plan and billing   | Plan card with a progress bar, one Upgrade button, a flat receipts list                | Plan card with the tagline and what the plan includes (USED, WED 7 OCT, NOT BOOKED, ACTIVE), the navy upgrade card (Elite minus Premium, top-up credit, You pay), "Top-ups at your plan's rate" with Buy, "How upgrade credit works", the not-placed notice, and an Invoices table (Paid with Download, No charge). Phone: price, sessions done bar, top-ups, upgrade, notice                                                                                                                |
| S15 profile            | Target card and a three-field form                                                     | Header with the avatar, name and "SCMHRD Pune · MBA 2025–27 · finals track", Save changes, an eight-field form (college email, work experience, phone, target role and Day 0 read only), "Target shifted?" with Request panel change, "What your panel can see" with SHARED rows, and the navy "Nothing gets reset" card                                                                                                                                                                     |

Supporting changes: sessions carry a `blurb` (the runway line); the answers API has `round`, `parts`, `noteTags`,
`flaggedAt`, `draftNo`, `rehearseNext` and `rounds` counts; the feedback detail carries the s10 extras (all
optional, so a note scored live by a panelist still renders); journey, case track, billing and profile responses
changed shape (see `docs/API_CONTRACT.md`); new endpoints for the Quick Switch digest and preferences and for
buying a top-up (it counts toward the upgrade quote). `formatDay` now writes "Sep", not "Sept". The profile email
is `riya.kulkarni@scmhrd.edu` as drawn (the login mock still accepts `riya@scmhrd.edu`). `PageHeader` has a
`pillClassName` prop. The answer fixtures were renamed and reordered to the drawn rows.

### Left as it was, with reason

- **S7 CV version history (`s07`)** is part of the CV builder (`features/cv-builder`), which the owner is doing, so it
  was not touched. The Mockup box stays open for it.
- **Panel feedback list (`/feedback`)** is not drawn. It still lists panels as before; the sidebar item opens it.
- **Sessions list rows without a mockup state** (cancelled, moved, missed) keep the earlier badges and notes; only
  the layout around them follows s09.
- **Deck review and 3-mock pack top-ups** are drawn with "[Premium rate]" in brackets, which means the price is not
  decided. They show "Rate TBD" and a toast when bought. Only the extra mock panel (₹1,299 at the Premium rate, from
  s04) can be bought, and it is added to the top-up credit of the upgrade quote.
- **Invoices** are marked Proposed as drawn. The free session is listed as "No charge" with no download, and the
  download buttons show a toast (no invoice files exist). The same toast is used for "Download report" on
  feedback, "Upload deck" on the case track and "View listing" in Quick Switch.
- **Entitlement rows for Basic and free plans** reuse the runway sessions of the account; the standing perks row is
  only shown for Premium and Elite. This is Proposed.
- **Phone billing** keeps the Buy buttons and the invoices list, which the phone mockup leaves out, so nothing is
  unreachable on a phone. The phone profile has no mockup; it stacks the desktop layout.
- **Phone shell bar.** The phone mockups draw a page title bar ("RUNWAY TO THE DAY / Sessions") with a Day 0 pill;
  the shell keeps its wordmark bar (decided in batch 0) and the page header sits under it.
- **Answer search** is gone because the mockup does not draw it; the round tabs and status chips replace it. The
  "Mark rehearsed" and "Flag for work" buttons stay in the editor footer because without them the status could not
  change; they are not in the mockup.
- **"Send for review"** saves the draft and shows a toast; there is no reviewer in the mock. A first draft of an
  empty answer still marks it Flagged (as before).
- **Quick Switch** copy is as drawn. "Free, and on for as long as you're looking" and the job boards are mock content.
- **`Day 0 in 35 days` pill, bell and avatar** come from the shell (batch 0) and differ slightly from the single
  avatar drawn on these boards.

## Batch 3: panelist

Compared with the running app (desktop 1440 px, phone 390 px for the brief): `p01` (apply), `p03` and `p03-mobile` (pre-panel brief), `p04` (live scoring), `p05` (availability). `p02` Today was done earlier.

### What differed and what changed

| Screen          | Was                                                                                    | Now                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1 apply        | Narrow centred card, a function select, company, hours per month and a "why" textarea  | Header bar with the wordmark and "Panelist sign in". Left: "Sit on the side of the table students never see.", the lead and the navy "Who we look for" card. Right: two-column form (name, work email, role, company kept private, years in the function, LinkedIn), function pills, six "Sessions you can run" checkboxes, "When you're usually free", the reply note and "Submit application". Hours per month and "why" are gone because the mockup does not draw them               |
| P3 brief        | A single column of cards (header, CV highlights, probe list, suggested questions)      | Avatar header with "Download locked CV" and "Start panel". "Pull on these" (numbered, "From P1 + the CV"), "Locked CV · work experience" with a score chip per bullet and the "V4 · Locked · Score 84" pill; right column: P1 readiness bar and quote, profiling call notes, "Since P1" and the "Co-interviewing" card. Phone: back chevron, "P2 · 7:30 PM tonight", P1 readiness, Flagged / Not drafted pills, one CV bullet with "V4 · 84", profiling notes, full-width "Start panel" |
| P4 live scoring | Brief beside a form with three 1 to 5 scores, a verdict, a note and a send-back switch | "Question N of M" with the LIVE pill, "Back to brief" and "Submit feedback". Question list (check marks when marked), the question card (Flagged at P1 pill, "What landed" Situation / Decision / Result, Strong / Okay / Needs work, "Note to the student", send-back switch, Previous and Next), and the right column with the readiness slider ("P1: 64%", "Your read after this panel") and "P1 note on this question". On a phone the list becomes a row of numbered buttons       |
| P5 availability | One card with a weekly grid and a Save button                                          | "Week of 5 Oct" with Previous week, Next week and Save availability. Date headings, booked cells show the kind and the student ("Deep-dive Aditya R."), open cells are green, empty cells dashed, the BOOKED / OPEN / EMPTY legend, and the "Recent and upcoming" table (date, student, session, status pill)                                                                                                                                                                           |

Supporting changes: the brief response gained the student plan, the locked CV with scored bullets, answer status, profiling notes and `sinceLastPanel`; the availability response gained `bookedPanels` and `panels`; the application body is now `sessions[]` and `freeWhen` (no `hoursPerMonth` or `why`; the ops queue shows the two new fields as its "why" line); the grid has a 9:00 PM row so a booked 9 PM panel is visible.

### Left as it was, with reason

- **How the per-question marks become the stored score is Proposed.** p04 draws per-question fields and a readiness slider but no Structure, Defensibility or Composure scores. The submit button turns them into the three stored scores (Structure from what landed, Defensibility from the verdicts, Composure and the overall verdict from the slider) so the student and ops screens keep working. The drawn "Fields below are a proposal" label stays.
- **Send-back is per question in the mockup, one flag in the API.** Any question sent back sets the single flag; the mock still flags up to two answers.
- **Download locked CV** shows a toast; there is no file in the mock. **Co-interviewing** is shown for P2 only and is Proposed.
- **Phone "Start panel"** sits at the end of the page, not pinned: the bottom tab bar already uses the pinned space.
- **Phone availability and scoring** have no mockup; they reuse the desktop layout (the grid scrolls inside its card).
- **Briefs and scoring lists, the "Application received" page and the panelist profile** are not drawn, so they keep their earlier layout.
- **Dates.** The mockups are dated Mon 12 Oct; the app clock is Mon 5 Oct, so the week and the "Tonight" rows read 5 Oct.
- **LinkedIn** accepts any link that contains linkedin.com/in/, as the placeholder shows.
- **Sample numbers** (the 100 and 60 bullet scores, the three probe questions) come from the existing fixtures, not the drawn 86, 89, 71, 64.
