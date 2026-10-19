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

- Plan names, prices and seat counts are sample values (Basic ₹14,999, Premium ₹36,999, Elite ₹59,999). Real pricing needs sign-off. The Plans page shows "Sample data" and "Proposed".
- E12 was not defined in the brief beyond "S3, E12". Built as "free session already used" (reachable with `?scenario=returning-student`).
- E3 (late joiner) is built as a banner plus a runway cut to the last three sessions.
- Reschedule is free until 24 h before the start; the first no-show is free. Both are shown with the Proposed badge or copy.
- Verify-email: Gmail-style addresses require verification only under `gmail-unverified`.
- Mock session is cookie based (`prepco_role`, `prepco_onboarded`). The real backend must replace this with an httpOnly session cookie.

## Phase 4 notes

- CV model: the locked version (V4) is read-only for panelists; students edit a working draft (V5) and send a re-lock request. Ops reviews it, Proposed within one working day (reviewing arrives in Phase 5).
- Bullet tests (decision, number, trade-off) use a simple text heuristic in the mock. The real scorer is a backend decision.
- Upgrade price: Elite list price minus credit for unused sessions, proportional to what was paid (Proposed).
- Not placed: full credit carried to next season (Proposed). Placed: company, role and CTC are self-reported.
- Case track: Elite only; modules are sample content.
- Quick Switch and the "Routes open to you" list on Journey are Proposed screens with sample content.
- Notification drawer on every student page; the bell loads the drawer code on first click to protect the bundle budget.
