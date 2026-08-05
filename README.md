# The Last Standup

Something I built to get a feel of vibe coding.

A turn-based alien-battle game. Recruit a squad of software-industry agents,
fight aliens by answering trivia questions, and level up as you go. Defeat the
final boss, Dr. Marcus Pivot — the rogue former CTO who commands the alien
invasion from his standing desk.

For the story, characters, and combat details see [docs/GAME.md](docs/GAME.md).

## Tech Stack

Built with React, TypeScript, Vite, Tailwind CSS, Supabase, and Stripe.

## Quick Start

```bash
npm install
cp .env.example .env   # fill in your Supabase URL and anon key
npm run dev
```

Environment variables required by the client:

| Variable | Purpose |
| -------- | ------- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public API key |

## Game Features

- **Sign in** with Google or email/password, with a password-reset flow.
- **10 recruit-able agent classes**, each with a unique pixel sprite and its own
  stat-growth profile (see [docs/GAME.md](docs/GAME.md)).
- **Turn-based battles** against 8 alien enemy types plus the final boss.
- **"Knowledge Strike"** — answer a computer-science trivia question for
  double damage.
- **"Brain Shield"** — answer a math trivia question to halve incoming damage.
- **EXP and leveling** — characters gain EXP, level up, and grow HP/Attack/Defense
  within their class's range.
- **Boss fight** unlockable at level 3.
- **Trivia** sourced from the [Open Trivia Database](https://opentdb.com/api_config.php).

## Premium Tier ($2.99/month via Stripe)

- Triples HP, Attack, and Defense on all characters.
- Adds a top hat, monocle, and fake mustache to character avatars.
- Gold "3x STATS" badge on character cards.

Premium is backed by Supabase Edge Functions and Stripe. Full premium perks are
listed in [docs/GAME.md](docs/GAME.md).

## Project Structure

```
src/
  components/   # UI: battle, character, sprites, premium, auth screens
  context/      # Auth + Music contexts
  hooks/        # useBattleFlow
  lib/          # battle engine, game logic, enemies, trivia, audio, logger, stripe
  pages/        # Auth, Game, ResetPassword
  types/        # shared types + character data
supabase/
  functions/    # stripe edge functions (checkout, verify, webhook, cancel, reactivate)
  migrations/   # database schema
tests/          # Vitest unit tests
```
