# Adam Careers

AI job helper MVP for `adamcareers.com`.

## Features in this MVP

- High-converting landing page
- Email + LinkedIn authentication (Supabase)
- Authenticated dashboard
- AI chat via OpenRouter (Grok mini)
- CV/Word upload to Supabase Storage (per-user files)
- File list per user
- 4 CV template selector
- LinkedIn profile import view scaffold

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase (Auth, Postgres, Storage)
- OpenRouter API

## Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=x-ai/grok-3-mini
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm run build
```
