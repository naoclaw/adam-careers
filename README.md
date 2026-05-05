# Adam Careers

AI job helper for `adamcareers.com` — find jobs, build CVs, write motivation
letters.

## Stack

- Next.js 16 (App Router, Turbopack, `output: "standalone"`)
- TypeScript + React 19
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- Supabase (Auth + Postgres + Storage), email and LinkedIn OIDC
- OpenRouter for chat (default model `x-ai/grok-3-mini`)
- Composio for LinkedIn profile import
- Docker + nginx + GitHub Actions deploy to a VPS

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev
```

Open <http://localhost:3000>.

### Required env vars

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENROUTER_API_KEY=...           # required for /api/chat
OPENROUTER_MODEL=x-ai/grok-3-mini
COMPOSIO_API_KEY=...             # required for /api/linkedin/import
```

`/api/chat` and `/api/linkedin/import` return `503` if their respective keys are
missing, so the app still boots without them — only those two features are
disabled.

### Supabase setup

Apply the schema once on a fresh Supabase project:

```bash
psql "$DATABASE_URL" -f supabase/schema.sql
# or paste the file into Supabase SQL Editor
```

This creates `profiles`, `documents`, `chat_sessions`,
`cv_template_selections`, the `user-documents` storage bucket, all RLS
policies, and a trigger that auto-creates a `profiles` row on signup.

## Validate

```bash
npm run lint
npm run build
```

CI runs both on every push to `main`/`beta` and on every PR
(`.github/workflows/ci.yml`).

## Branches

- `main` — production. Pushes auto-deploy via SSH (`deploy.yml`).
- `beta` — staging. Trigger `Deploy to DigiCloud VPS` manually with
  `branch=beta` to deploy.

## Docker

```bash
docker compose --env-file .env.production up -d --build
```

Build args required: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`. Server-only secrets
(`OPENROUTER_API_KEY`, `COMPOSIO_API_KEY`, …) live in `.env.production` and
are loaded at runtime via `env_file`.

`docker-compose.n8n.yml` is independent and only needed if you also run the
n8n workflow side-service on the same host.
