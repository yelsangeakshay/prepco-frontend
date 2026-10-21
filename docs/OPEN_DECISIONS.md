# Open decisions

Built as drawn in the mockups; confirm or change before launch.

| Area                 | Decision (as drawn)                                    | Screen     |
| -------------------- | ------------------------------------------------------ | ---------- |
| Failed payment       | Seat held 15 minutes                                   | E4         |
| Waitlist             | 24 h to claim; Season 1 price kept                     | E5         |
| Reschedule / no-show | Free up to 24 h; first no-show free                    | E6         |
| Live scoring         | Layout and send-back-to-builder switch                 | P4         |
| Upgrade pricing      | Price after top-up credit; not-placed gets full credit | E8, E7, A5 |
| Runway               | Compressed runway for late joiners                     | E3         |
| Not mocked           | Panelist profile; tablet layouts                       | P-profile  |
| Integrations         | Payment gateway; Calendly embed vs native slot picker  | S4, S9     |
| Dark mode            | Tokens ready, ship light only                          | all        |

## Phase 1 notes

- Tablet (768 to 1279 px) uses an icon-only sidebar; not mocked.
- Shells (Sidebar, MobileNav, TopBar) were built from the brief text and tokens because `design/mockups/` was empty. Needs a visual pass against `s05.png`, `p02.png`, `a01.png`.
- Ops "Panel assignment" badge shows a static `7` until A3 data exists.

## Phase 3 notes

- Plan prices and seat counts follow the mockups and are all Proposed, needing sign-off: Basic 5,999 (list 8,999), Premium 9,999 (list 17,999), Elite 13,999 (list 26,999); top-ups 1,799 / 1,299 / 999 for Basic / Premium / Elite; seats Finals 37 of 60, Summers 20 of 40, Elite 17 of 22. Real pricing needs sign-off. The Plans page shows "Sample data" and "Proposed".
- E12 was not defined in the brief beyond "S3, E12". Built as "free session already used" (reachable with `?scenario=returning-student`).
- E3 (late joiner) is built as a banner plus a runway cut to the last three sessions.
- Reschedule is free until 24 h before the start; the first no-show is free. Both are shown with the Proposed badge or copy.
- Verify-email: Gmail-style addresses require verification only under `gmail-unverified`.
- Mock session is cookie based (`prepco_role`, `prepco_onboarded`). The real backend must replace this with an httpOnly session cookie.

## Phase 4 notes

- CV model: the locked version (V4) is read-only for panelists; students edit a working draft (V5) and send a re-lock request. Ops reviews it, Proposed within one working day (reviewing arrives in Phase 5).
- Bullet tests (decision, number, trade-off) use a simple text heuristic in the mock. The real scorer is a backend decision.
- Upgrade price rule (Proposed): next tier price minus the current tier paid minus top-ups bought this season. This replaces the earlier unused-session credit rule.
- Not placed: full credit carried to next season (Proposed). Placed: company, role and CTC are self-reported.
- Case track: Elite only; modules are sample content.
- Quick Switch and the "Routes open to you" list on Journey are Proposed screens with sample content.
- Notification drawer on every student page; the bell loads the drawer code on first click to protect the bundle budget.

## Phase 5 notes

- Panelist profile (P-profile) and tablet layouts for panelist and ops are not mocked; built from the student profile (S15) patterns and marked Proposed.
- Scoring (P4): three dimensions (Structure, Defensibility, Composure) scored 1 to 5, a verdict, a note, and a send-back switch. In the mock a panel can be scored as soon as it is assigned, so the three-role journey runs end to end.
- Send-back flags up to two rehearsed answers for the student. The real rule (which answers or CV bullets) is a product decision.
- Assignment: a panelist is "free" when the slot is in their weekly availability and they have no panel at that time. Ops can still choose a panelist who is not free; clashes at the same time are refused.
- Panelist health: needs attention when feedback is overdue or three or more cancellations; watch when over capacity, rated below 4.3 or paused. Thresholds are Proposed.
- No-show: ops can excuse it (first no-show is free). What a non-excused no-show costs is not implemented.
- Ledger revenue by tier counts payments and top-ups per tier; Riya's upgrade is counted under Elite while her Premium payment stays under Premium.
- Panel capacity per week (5 to 8) is sample data.

## Phase 6 notes

- **Design token changed for accessibility.** `--navy-400` (secondary text) is `#566170`, darker than the
  `#6B7785` on the cover sheet. The original fails WCAG AA (about 4.0:1) on the cream background. `--green-600`
  was darkened to `#256A41` for the same reason. Confirm with design, or keep the lighter value only on
  large text.
- **Mockups were never available.** All layout comes from the brief's text and tokens. Nothing here has been
  compared with the PNGs. See `docs/DEFINITION_OF_DONE.md`.
- **Form pages render after first paint.** Sign-in, sign-up, password pages, onboarding, waitlist, change
  target, panelist apply and the profile forms load React Hook Form and Zod as a separate chunk (client only).
  This keeps first-load JS under 170 KiB. The cost is a short skeleton before the form on slow links. The
  alternative is server-rendering them and moving to lighter form code.
- **First-load budget is measured in KiB** (1024 bytes), like the `next build` report: `pnpm check:bundle`.
- **Web Vitals profile.** "4G" is 9 Mbps down, 1.5 Mbps up, 100 ms RTT, with 4x CPU throttling. The stricter
  Lighthouse "Slow 4G" profile (1.6 Mbps, 150 ms) gives an LCP of about 4 s with the mock worker on; the mock
  worker itself loads about 100 kB of extra script that a real backend would not need.
- **Scenario by URL** works for every page in the student app through the middleware cookie. Panelist and ops
  pages read the same cookie but only the student scenarios change what they show.
- **Payment gateway, Calendly versus a native slot picker, dark mode, tablet layouts** remain as listed in the
  brief: not built, tokens ready, light only.
- **Mock latency** (200 to 600 ms) is switched off only by the Web Vitals test, through
  `window.__PREPCO_NO_LATENCY__`.

## Mockup fidelity pass

Owner decisions from design/mockups/review.png. Each has a proposed policy in the app; none is confirmed and all need sign-off.

1. No-show: does a missed panel use up the session? Proposed: the first no-show is free, then it counts.
2. Reschedule window: Proposed: free up to 24 hours before.
3. Payment provider (Razorpay, Cashfree or Stripe India) and GST invoicing: undecided.
4. Season-2 price for returning students: the site says it exists but not what it is.
5. Late joiners: below how many weeks to Day 0 do you refuse to sell Premium?
6. Waitlist: first come, or held for free-session attendees?
7. Placed early (PPO): are unused sessions credited, transferable or lost?
8. Colleges: SCMHRD only at launch, or per-college Day 0 dates from day one?
9. Panelist pay: per panel or monthly, and is feedback turnaround part of it?
10. Who runs free sessions: core team only, or senior panelists too?

Deviations from the mockups, all Proposed:

- Batch 1: the CV history consent box stays unticked by default and is required; the mockup draws it ticked.
- Batch 1: the runway callout on onboarding step 2 words the under-8-weeks case itself; the mockup only draws the 9 weeks case.
- Batch 1: the late joiner policy (what is dropped, the Basic + one top-up recommendation) is drawn as a Proposed policy and is not confirmed.
- Batch 1: the "Reschedule" and "Add to calendar" buttons on the free session do not talk to Calendly yet.

- The phone tab bar keeps a fifth More/Account tab for panelist and ops, which the mockups do not draw.
- Feedback overdue is seeded as 0 in the mock world.
- Student and panelist function taxonomies differ. The mapping in PANEL_FOR_TARGET (features/onboarding/schemas.ts) is an assumption.
- The 1,000-student fixture is kept as a performance fixture, while the ops overview shows 57 paid students.
- Batch 2: the top-up prices for a deck review and the 3-mock pack are drawn as "[Premium rate]" (undecided). They show "Rate TBD" and cannot be bought; the extra mock panel is ₹1,299 at the Premium rate.
- Batch 2: invoices are marked Proposed as drawn. The free session is listed as "No charge". Downloads, the feedback report, deck upload and listing links are not connected (toasts only).
- Batch 2: what the plan includes for Basic and free accounts on the billing page is Proposed; only Premium and Elite are drawn.
- Batch 2: the Quick Switch job-hunting agent, its fit score, the job boards and the digest listings are sample content. "Send for review" on an answer saves the draft only.
- Batch 2: S7 (CV version history) was not touched; it belongs to the CV builder.
