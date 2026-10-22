# Resuming the mockup fidelity pass

Use this file to continue the work in a new Claude Code session. Read `docs/MOCKUP_REVIEW.md`,
`docs/OPEN_DECISIONS.md` and `docs/PROGRESS.md` first.

## Goal

Bring every screen in line with the mockup PNGs in `design/mockups/` (git-ignored; 2x exports, 2880 px wide is
1440 css px, phone files are 780 px wide). Mock data only, no backend. The mockup numbers and copy win over earlier
invented content. Anything the mockups do not define stays marked "Proposed".

## Status

| Batch              | Screens (mockup slugs)                                            | State   |
| ------------------ | ----------------------------------------------------------------- | ------- |
| Done earlier       | s04 plans, s05 home, e04 checkout, e08 upgrade, p02, a01          | merged  |
| Batch 1            | s01, s02, s03, e01, e02, e03                                      | merged  |
| Batch 2            | s08 to s15 (student; s07 CV versions skipped with the CV builder) | merged  |
| Batch 3            | p01, p03, p04, p05 (panelist)                                     | merged  |
| Batch 4            | a02 to a06 (ops)                                                  | merged  |
| Batch 5            | e05, e06, e07, e09 to e12 (edge cases)                            | merged  |
| Skipped on purpose | s06 CV builder (the owner is doing it)                            | skipped |

A live copy of this table is the "Mockup pass progress" artifact. Each finished batch appends a "Batch N" section
to `docs/MOCKUP_REVIEW.md` and ticks the Mockup column in `docs/DEFINITION_OF_DONE.md`.

## Data rule (updated)

Match the mockup layout, components, states, spacing, colours and phone layout, and the labels and section names the mockup
draws. Do not change fixtures only to reproduce the mockup's sample numbers; the existing sample data is fine. Batches 0 to 2
already matched some numbers and are left as they are.

## How to work a batch

1. `pnpm install`, then `pnpm build` and start the server with `NEXT_PUBLIC_API_MOCKING=on pnpm start` (port 3000).
   Mocking is on by default now, so the variable is optional.
2. Screenshot a route as a role: `MSYS_NO_PATHCONV=1 node scripts/shot.mjs <public|student|panelist|ops> <path> <out.png> [w] [h]`.
   Put outputs outside the repo. Compare with the PNG using the image viewer.
3. Fix content, copy, layout, numbers, states and the phone layout. Keep the 5th More/Account tab on phone.
4. Update unit tests, e2e specs, stories and docs in the same change.
5. Verify: `pnpm exec tsc --noEmit`, `pnpm exec eslint`, `pnpm exec vitest run`, `pnpm check:bundle` (under 170 KiB per
   route), then Playwright against the production server: the specs that cover the screens plus `a11y.spec.ts` and
   `responsive.spec.ts`. Web-vitals LCP on phone is flaky, ignore it unless the
   change caused it.

## Running batches in parallel

Parallel sessions in one folder clash on port 3000, the `.next` build folder and shared files (the shell,
`mocks/world.ts`, the schemas, the docs). To run them in parallel:

```bash
git worktree add ../prepco-b3 -b mockup-batch-3
cd ../prepco-b3 && pnpm install
```

Give each worktree its own port (`pnpm start -p 3003`; Playwright reads the base URL from `playwright.config.ts`, so
change it per worktree), give each session a separate area, and merge the branches one at a time. Expect conflicts in
`mocks/world.ts` and the docs.

## Test logins (mock)

Any password works except `wrong`. The email picks the role: `riya@scmhrd.edu` is the student, an email starting
with `kaniksha` or `panelist` is the panelist, one starting with `ops` is ops.

## Rules

- No secrets in the repo, no tokens in localStorage, no new dependencies without asking.
- Write code, comments, commits and docs in plain prose.
- Commit with the trailer `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Work on a branch per batch and merge to `main`. The remote is `https://github.com/yelsangeakshay/prepco-frontend.git`.
