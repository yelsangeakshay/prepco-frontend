# The Prep Co: web app UI

Mock-data UI. See `PREPCO_UI_BUILD_PROMPT.md`.

```bash
pnpm install
cp .env.local.example .env.local
pnpm dev          # http://localhost:3000, use the wrench button (bottom-right) to switch role/scenario
pnpm lint && pnpm typecheck && pnpm test
pnpm test:e2e
```

Set `NEXT_PUBLIC_API_MOCKING=off` and `NEXT_PUBLIC_API_BASE_URL` to use a real backend.
