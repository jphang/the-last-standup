# The Last Standup

Turn-based trivia/battle game. React + TypeScript + Vite + Tailwind, Supabase (auth/DB/edge
functions), Stripe (Premium subscription via edge functions). See README.md and docs/GAME.md
for game design/story details.

## Commands
- `npm run dev` — start dev server
- `npm run test` / `npm run test:watch` — Vitest
- `npm run typecheck` — tsc --noEmit
- `npm run lint` — eslint
- `npm run build` — production build

## Architecture
- `src/lib/gameLogic.ts`, `battleEngine.ts`, `enemies.ts`, `trivia.ts` — pure game logic,
  kept free of React/Supabase. Prefer adding logic here (with tests) over inline in components.
- `src/hooks/useBattleFlow.ts` — the battle state machine; owns Supabase writes for
  character progress at battle end.
- `src/lib/logger/` — structured logging (console/file/remote transports); use `log(...)`
  instead of `console.log` for anything battle/trivia/premium related.
- `supabase/migrations/` — schema is RLS-protected and owner-scoped (`auth.uid()`).
  `supabase/functions/` — Stripe edge functions run with the service-role key.

## Conventions
- Battle/game math changes need corresponding Vitest coverage (see `tests/`).
- Don't bypass RLS assumptions — all client Supabase calls run as the authenticated user;
  only edge functions use the service role.
- Trivia questions come from the Open Trivia DB (opentdb.com); no local question bank.
