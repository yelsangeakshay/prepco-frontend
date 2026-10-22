# Definition of done: every screen

Checked in Phase 6. Legend: yes = verified by an automated check named in the last column; **open** =
not done and why. Nothing is ticked on trust.

Checks that apply to every row:

- **Mockup**: layout matched against the mockup PNG at 1280 px, and at 390 px where a phone mockup exists.
  **Checked only for S1, E1, S2, E2, E3, S3, S4, E4, S5, S8 to S15 (not S7), E8, P1 to P5 and A1 to A6** (Mockup fidelity pass); open for all other screens. Layout elsewhere follows the
  brief's text and design tokens only. This is the one box that needs a human with the PNGs.
- **Reachable**: opened through the sidebar, or through the previous journey step. `foundation.spec`
  crawls every nav link per role; journeys cover the in-page links.
- **States**: loading, empty, error and success each have a Storybook story (`stories/*.stories.tsx`),
  and `pnpm test:stories` renders all of them and checks the loading and error ones show a status or alert.
- **Scenarios**: its scenarios open by `?scenario=` (`scenarios.spec`, all 16).
- **Keyboard and contrast**: axe, WCAG 2.1 AA, on every screen for every role at 1280 and 390 px (`a11y.spec`).
  Secondary text colour was darkened to pass; see README design notes. Slot picker and scoring form are
  keyboard-tested in unit tests.
- **Budget**: first-load JS under 170 KiB on every route (`pnpm check:bundle`, 49 routes); LCP, INP, CLS
  on a throttled phone (`webvitals.spec`, six representative routes).
- **Journey**: covered by a Playwright journey (`tests/journeys.test.ts` checks all 21 exist).

| Code    | Screen                                                        | Route                                                          | Mockup                              | Other boxes | Journey spec                                     |
| ------- | ------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------- | ----------- | ------------------------------------------------ |
| S1      | Sign in, sign up                                              | `/sign-in`, `/sign-up`                                         | yes (checked)                       | yes         | Join and buy a plan; Locked out / wrong email    |
| E1      | Forgot, reset, verify email                                   | `/forgot-password`, `/reset-password/[token]`, `/verify-email` | yes (checked)                       | yes         | Locked out / wrong email                         |
| S2      | Onboarding 1 to 3                                             | `/onboarding/[step]`                                           | yes (checked)                       | yes         | Join and buy a plan                              |
| E2      | CV upload                                                     | `/onboarding/cv-upload`                                        | yes (checked)                       | yes         | Join and buy a plan; `cv-upload-failed` scenario |
| E3      | Late joiner                                                   | `/plans`, banner on `/home`, `/onboarding/[step]`              | yes (checked)                       | yes         | Joined late                                      |
| S3      | Free session                                                  | `/free-session`                                                | yes (checked)                       | yes         | Join and buy a plan                              |
| E12     | Free session already used (defined by me, see OPEN_DECISIONS) | `/free-session`                                                | open                                | yes         | `returning-student` scenario                     |
| S4      | Plans, checkout                                               | `/plans`, `/checkout/[plan]`                                   | yes (checked)                       | yes         | Join and buy a plan                              |
| E4      | Payment failed, receipt                                       | `/checkout/[plan]`                                             | yes (checked)                       | yes         | Payment fails                                    |
| E5      | Cohort full, waitlist                                         | `/plans`, `/waitlist`                                          | open                                | yes         | Cohort is full                                   |
| S5      | Home                                                          | `/home`                                                        | yes (checked)                       | yes         | First login, nothing booked; Day 0 moves         |
| S9      | Sessions and runway                                           | `/sessions`                                                    | yes (checked)                       | yes         | Session cancelled/moved/missed                   |
| E6      | Session detail                                                | `/sessions/[id]`                                               | open                                | yes         | Session cancelled/moved/missed                   |
| S10     | Panel feedback                                                | `/feedback`, `/feedback/[panelId]`                             | yes (detail; list not mocked)       | yes         | One panel, three roles                           |
| S6      | CV Builder                                                    | `/cv`                                                          | open                                | yes         | Prepare for Day 0                                |
| S7      | CV versions                                                   | `/cv/versions`                                                 | open                                | yes         | Prepare for Day 0                                |
| S8      | HR Question Builder                                           | `/answers`, `/answers/[id]`                                    | yes (checked)                       | yes         | Prepare for Day 0                                |
| S11     | Journey and routes                                            | `/journey`                                                     | yes (checked)                       | yes         | Routes and extras                                |
| S12     | Case track                                                    | `/case-track`                                                  | yes (checked)                       | yes         | Routes and extras; Upgrade mid-season            |
| S13     | Quick Switch                                                  | `/quick-switch`                                                | yes (checked)                       | yes         | Routes and extras                                |
| S14     | Plan and billing                                              | `/billing`                                                     | yes (checked)                       | yes         | Upgrade mid-season                               |
| E8      | Upgrade                                                       | `/billing/upgrade`                                             | yes (checked)                       | yes         | Upgrade mid-season                               |
| S15     | Profile                                                       | `/profile`                                                     | yes (checked)                       | yes         | Target role changes                              |
| E9      | Change target role                                            | `/profile/change-target`                                       | open                                | yes         | Target role changes                              |
| E7, E11 | Outcome                                                       | `/outcome`                                                     | open                                | yes         | After Day 0; Not placed, credit carried over     |
| E10     | Notifications                                                 | `/notifications` and the bell drawer                           | open                                | yes         | Day 0 moves                                      |
| P1      | Apply to be a panelist                                        | `/panelist/apply`, `/panelist/apply/submitted`                 | yes (form; submitted not mocked)    | yes         | Become a panelist                                |
| P2      | Today                                                         | `/panelist/today`                                              | yes (checked)                       | yes         | Run a panel                                      |
| P3      | Pre-panel briefs                                              | `/panelist/briefs`, `/panelist/briefs/[sessionId]`             | yes (brief; list not mocked)        | yes         | Run a panel                                      |
| P4      | Scoring and live scoring                                      | `/panelist/scoring`, `/panelist/scoring/[sessionId]`           | yes (live scoring; list not mocked) | yes         | Run a panel; One panel, three roles              |
| P5      | Availability                                                  | `/panelist/availability`                                       | yes (checked)                       | yes         | Set availability                                 |
| -       | Panelist profile (not mocked)                                 | `/panelist/profile`                                            | not mocked                          | yes         | none                                             |
| A1      | Cohort overview                                               | `/ops`                                                         | yes (checked)                       | yes         | Weekly ops loop                                  |
| A2      | Students, student detail                                      | `/ops/students`, `/ops/students/[id]`                          | yes (checked)                       | yes         | Weekly ops loop                                  |
| A3      | Panel assignment                                              | `/ops/assignments`                                             | yes (checked)                       | yes         | Weekly ops loop; One panel, three roles          |
| A4      | Sessions and bookings                                         | `/ops/sessions`                                                | yes (checked)                       | yes         | Weekly ops loop                                  |
| A5      | Plans and credits                                             | `/ops/ledger`                                                  | yes (checked)                       | yes         | Weekly ops loop                                  |
| A6      | Panelists, applications                                       | `/ops/panelists`, `/ops/panelists/applications`                | yes (checked)                       | yes         | Keep the panel healthy; Become a panelist        |
| -       | Not found, error, maintenance                                 | `not-found`, `error`, `/maintenance`                           | open                                | yes         | foundation                                       |

## Known gaps

1. **Mockup match** (above): needs the PNGs. Phase 1 shells (S5, P2, A1) and the cover sheet components
   are the first things to check.
2. **Tablet layouts** for panelist and ops are not mocked; they use the icon rail like the student shell.
3. **Real Web Vitals** were measured against a local production build with throttling, not a deployed site.
   The mock worker adds start-up work that a real backend will not have.
4. **Screen-reader pass** was automated (axe) only. A manual pass with NVDA or VoiceOver on the booking and
   scoring flows is still worth doing.
