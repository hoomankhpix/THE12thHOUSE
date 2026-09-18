# 12th House

An editorial music portfolio for an independent artist. The visual language is intentionally spare: oversized type, image-led releases, precise rules, and one bright accent.

## Stack

- React + TypeScript + Vite
- React Router
- Supabase client and SQL migration with RLS
- HTML5 Audio API via `PlayerProvider`
- `lucide-react` for controls

## Architecture

Routes live in `src/pages`, shared layout and controls live in `src/components`, and the player is centralized in `src/context/PlayerContext.tsx` so it persists while navigating. `src/data/demo.ts` is the temporary repository used when Supabase is not configured; production data should be loaded through a repository layer using the same types.

The schema in `supabase/migrations/001_initial_schema.sql` models `artists`, `releases`, `tracks`, and `platform_links`, with ordered tracks, published-only public reads, admin-only writes, and artwork/audio storage buckets. Admin authentication begins with Supabase magic-link auth at `/admin`; the production admin editor should verify the session and custom `admin` JWT claim before exposing mutation controls.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without Supabase environment variables, the public site uses original demo content and still exercises navigation, filters, track queues, and the graceful missing-audio state. Never put a service-role key in `VITE_*` variables.