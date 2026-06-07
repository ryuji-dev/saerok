# CLAUDE.md — Saerok (새록)

Project-level instructions for AI agents working in this repo.

## Expo HAS CHANGED
Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any Expo/React Native code. Do not rely on memory of older SDKs.

## What this is
새록(Saerok) — a bird-dex **collection game**. Photograph birds → AI identifies them → register the sighting with its location into a neighborhood-tiered dex. Differentiators: **Korean species + Korean language, hyperlocal neighborhood dex, and ecological ethics built in.**

- Product strategy & execution roadmap: `TODO.md`
- Tech stack decision (ADR, Korean): `docs/01_tech-stack-decision.md`

## Tech stack
- **App**: Expo (React Native) + TypeScript + Expo Router (file-based routing, `src/app/`)
- **Data**: TanStack Query + Supabase JS
- **Backend**: Supabase — Postgres + PostGIS, Auth, Storage, Realtime, Edge Functions, RLS
- **Maps**: Naver Maps (native module → **Expo Go won't work, a dev client is required**)
- **Package manager**: pnpm (`.npmrc` sets `node-linker=hoisted`, required for RN autolinking)

## Project structure
```
src/
  app/                # Expo Router routes
    (tabs)/           # 도감(index) · 지도(map) · 촬영(camera) · 프로필(profile)
    onboarding.tsx
  components/         # shared UI (ThemedText / ThemedView, …)
  constants/ hooks/   # theme + hooks
  lib/                # supabase client, query client, env access
  types/              # ambient type declarations
supabase/
  migrations/         # schema (PostGIS · RLS · sensitive-species masking)
  seed.sql
docs/                 # Korean docs (ADR, etc.)
```
Path alias: `@/*` → `./src/*`, `@/assets/*` → `./assets/*`.

## Commands
```bash
pnpm install                 # install deps
pnpm exec tsc --noEmit       # typecheck
pnpm run lint                # ESLint (flat config, eslint 9)
npx expo export -p ios       # validate JS bundle graph (no simulator needed)
npx expo prebuild            # generate native projects (ios/android are gitignored)
npx expo run:ios | run:android
```

## Environment
Public config lives in `.env` (gitignored) — see `.env.example`. Only `EXPO_PUBLIC_*` vars reach the app bundle:
- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_NAVER_MAP_CLIENT_ID`

## Domain rules — the 3 risks are baked into the MVP, not deferred
- **AI identification accuracy**: show confidence + multiple candidates; community verification for ambiguous IDs; keep the species set narrow to favor accuracy.
- **Anti-cheat**: on-device live capture only (block gallery upload / re-shooting a screen); EXIF + capture-time validation; hold submissions below the AI confidence threshold.
- **Ecological ethics**: **mask coordinates of endangered/sensitive species** (`sensitive_flag` → lower precision or hide; enforced at the DB layer via RLS + the `catches_public` view). Don't over-reward rare-species chasing.

## Conventions
- TypeScript `strict`. Keep `tsc --noEmit` and ESLint green before claiming done.
- Icons: **Lucide** (`lucide-react-native`). Prefer the rounded family — e.g. `UserRound`, `CircleUserRound` — over the detached-head `User` look. Import per icon by name; color icons via theme tokens.
- Agent instruction files (`CLAUDE.md` / `AGENTS.md`, outside `docs/`) are written in **English**; the `docs/` folder is **Korean**.
- User-facing chat/reports: **Korean** (keep code identifiers / commands in their original form).

## Git / commits
- **Only commit, push, or open a PR when the user explicitly asks.** Never on your own judgment.
- Commit message format: `type(scope): 한국어 설명`, body in Korean too. Don't rewrite commit messages the owner authored.
- Sync the remote with `git remote update -p` (prune) before a merge, not a bare fetch.
