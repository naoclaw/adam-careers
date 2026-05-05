# Adam Careers — Code Review

Review date: 2026-05-05
Branch reviewed: `main` @ commit `68250c7`
Reviewer: Lina (in `beta` branch)

---

## TL;DR

The MVP scaffold compiles and the routes type-check, but the app is **not production-ready**. Most critically, **Tailwind v4 is mis-configured so the entire site renders unstyled**, the chat API has **no authentication** (open OpenRouter wallet to anyone on the internet), and the LinkedIn import contains **two clear runtime bugs** plus an unverified Composio endpoint. There is no SQL schema for the four database tables the app reads from, so any fresh Supabase project will return errors on the dashboard. Several heavy dependencies (`@ai-sdk/openai`, `lucide-react`, six `@radix-ui/*` packages, `next-themes`, `class-variance-authority`) are installed but unused.

---

## Architecture (as built)

| Layer        | Tech                                                                  |
| ------------ | --------------------------------------------------------------------- |
| Framework    | Next.js 16.2.4 (App Router, Turbopack, `output: "standalone"`)        |
| Language     | TypeScript 6.0.x, React 19.2                                          |
| Styling      | Tailwind v4.2.4 via `@tailwindcss/postcss`                            |
| Auth/DB      | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) — email + LinkedIn OIDC |
| AI           | OpenRouter (raw `fetch`), default model `x-ai/grok-3-mini`            |
| LinkedIn     | Composio MCP `LINKEDIN_GET_MY_INFO` (server route)                    |
| Storage      | Supabase Storage bucket `user-documents`                              |
| Edge gate    | `src/proxy.ts` (Next 16 renamed `middleware` → `proxy`)               |
| Deploy       | Docker (`Dockerfile` standalone) + Compose + nginx + GitHub Actions over SSH |
| Side service | Optional `n8n` via `docker-compose.n8n.yml`                           |

### Pages
- `/` landing (CSR-styled marketing page)
- `/login`, `/signup` (Supabase email + LinkedIn OAuth)
- `/auth/callback` (PKCE code exchange)
- `/dashboard` overview, with sub-pages: `chat`, `documents`, `linkedin`, `templates`

### API
- `POST /api/chat` — proxies a message list to OpenRouter
- `POST /api/linkedin/import` — calls Composio MCP, writes to `profiles`

### DB tables referenced (no schema in repo)
- `profiles(id, email, full_name, headline, linkedin_url, linkedin_id, summary, location, linkedin_raw, updated_at)`
- `documents(id, user_id, name, type, file_path, size_bytes, created_at)`
- `chat_sessions(id, user_id)`
- `cv_template_selections(user_id, template_id, template_data, updated_at)` — primary key `user_id` (used as `onConflict`)

---

## What Works

- `npm install` succeeds; `npm run build` exits 0 and emits a standalone server.
- TypeScript is strict-mode clean.
- The Supabase SSR/browser/middleware split is correct and uses `getUser()` (not `getSession()`) on the server, which is the recommended pattern.
- `proxy.ts` correctly gates `/dashboard/*` and bounces logged-in users away from `/login` and `/signup`.
- Dockerfile uses multi-stage build with a non-root user, standalone output, and proper public-env build args.
- GitHub Actions deploy script writes `.env.production` from secrets and rebuilds via Compose.
- nginx configs terminate TLS and proxy WebSockets correctly for both `adamcareers.com` and `n8n.adamcareers.com`.

---

## What Is Broken

### 🔴 P0 — Site renders unstyled
`src/app/globals.css` uses Tailwind v3 directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
Tailwind v4 silently drops these. After `next build`, the emitted stylesheet is **7.7 KB** and contains zero utility classes (`bg-blue-600`, `rounded-xl`, `min-h-screen`, etc. all missing). The only rules that survive are `@layer utilities` blocks, the body reset, and the Inter `@font-face`. Every page will look like raw HTML.

**Fix:** replace with `@import "tailwindcss";` and migrate the `@layer utilities { ... }` block (which still works in v4 if scoped with `@utility` or kept in a global block under `@layer utilities`). Verify by checking the output CSS is > 50 KB after build.

### 🔴 P0 — `/api/chat` has no auth, no rate limit, no input cap
```ts
// src/app/api/chat/route.ts:8
export async function POST(req: Request) {
  const { messages } = await req.json();
  // …forwards directly to OpenRouter with our API key
```
Anyone who knows the URL can drain the OpenRouter budget. There is no `supabase.auth.getUser()` check, no message-length limit, no per-IP throttle. Must add `getUser()` gate at minimum.

### 🔴 P0 — `linkedin_url` operator precedence bug
`src/app/api/linkedin/import/route.ts:49-52`:
```ts
linkedin_url: li.profileUrl ?? li.vanityName
  ? `https://linkedin.com/in/${li.vanityName}`
  : null,
```
JS parses this as `(li.profileUrl ?? li.vanityName) ? `…${li.vanityName}` : null`, so when Composio returns a `profileUrl` it is **discarded** and we synthesise a URL from a possibly-undefined `vanityName`, yielding `https://linkedin.com/in/undefined`. Should be:
```ts
linkedin_url: li.profileUrl ?? (li.vanityName ? `https://linkedin.com/in/${li.vanityName}` : null),
```

### 🔴 P0 — LinkedIn import uses `update`, fails for users without a `profiles` row
`route.ts:59-63` calls `.update().eq('id', user.id)`. Supabase will return `{ error: null, data: [] }` (silent no-op) for users who don't have a `profiles` row yet. Without a `handle_new_user()` trigger creating profile rows on signup, **every first-time import will appear to succeed but persist nothing**. Use `.upsert({ id: user.id, ...update }, { onConflict: 'id' })`.

### 🔴 P0 — Composio call shape is unverified / probably wrong
The route POSTs to `https://connect.composio.dev/mcp/execute` with `{ toolkit, tool, arguments }`. That endpoint and payload shape do not match Composio's documented MCP / Tools API (which is normally `https://backend.composio.dev/api/v3/tools/execute` or the per-toolkit MCP URL). It also assumes Composio knows which connected LinkedIn account to use — but we never send a `connectedAccountId`, `userId`, or `entityId`. This call will return 404 / 400 in production.

### 🟠 P1 — No DB schema in repo
The four tables (`profiles`, `documents`, `chat_sessions`, `cv_template_selections`) and the `user-documents` storage bucket are referenced but never defined. A fresh Supabase project will throw on every dashboard page. Need a `supabase/schema.sql` (or a `supabase/migrations/` folder) committed and a documented setup step.

### 🟠 P1 — Dashboard counts `chat_sessions` that nothing inserts
`src/app/dashboard/page.tsx:14-17` queries `chat_sessions` but `ChatPanel` keeps state in React only — nothing is ever written to that table. Either persist sessions (preferred) or remove the counter.

### 🟠 P1 — Document uploader requires manual page refresh
`document-uploader.tsx:57` says "Refresh page to see latest files." Should call `router.refresh()` after success so the parent server component re-fetches.

### 🟠 P1 — Templates "PDF export hook is prepared" placeholder
`template-selector.tsx:99-102` ships a comment promising a feature that does not exist. Either remove or implement.

### 🟡 P2 — `linkedin_raw` stored as stringified JSON
Should use a `jsonb` column and pass the object directly so the data is queryable. Minor.

### 🟡 P2 — `proxy.ts` matcher leaves `/api/*` ungated
The matcher excludes `_next` and image assets but allows `/api/*` through. Combined with the missing auth check on `/api/chat`, this is the path an attacker uses. Either gate `/api/chat` inside the route (simpler, clearer error messages) or extend the matcher.

---

## Security Issues

1. **Open chat API** (P0, see above).
2. **No CSRF / origin check on `/api/linkedin/import`.** It is auth-gated, but a logged-in victim visiting an attacker page could trigger unwanted writes. Low risk but worth a `Sec-Fetch-Site` or `origin` check.
3. **`COMPOSIO_API_KEY` in `.env.example`** is fine, but the deploy workflow writes secrets into `.env.production` on the VPS via `cat > .env.production`. Make sure the file mode is restrictive (`chmod 600`) — currently nothing sets it.
4. **`OPENROUTER_API_KEY` exposure surface.** The chat route is server-side, so the key never reaches the browser — good. But because the route is unauthenticated, the key is effectively public via abuse.
5. **Storage bucket `user-documents`** must have RLS policies pinning `bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text`. Not in repo, so we can't verify.
6. **Profiles table writes via `update()`** assume RLS allows the user to update their own row. Not in repo.
7. **No upload size limit** on the dropzone. A user could upload a 2 GB file.
8. **No file-content sniff** — relies on extension only for the `type` column. Acceptable for MVP.
9. **`@layer base { body { ... } }`** is fine, but the body's hard-coded `background: #ffffff; color: #0f172a;` will fight any future dark mode.

---

## UX / UI Issues

- The whole site is unstyled until Tailwind is fixed (P0 above).
- `signup` page's LinkedIn button is missing the LinkedIn SVG (login has it, signup does not).
- `dashboard/linkedin/page.tsx` `useEffect(() => { loadProfile(); }, []);` will warn under exhaustive-deps; `loadProfile` should be wrapped in `useCallback` or moved inside the effect.
- `ChatPanel` does not auto-scroll to the latest message.
- `ChatPanel` discards `messages` on navigation (no persistence) — confusing for users.
- Dashboard sidebar nav items don't highlight the active route.
- No favicon (`/app/icon.tsx` or `/app/favicon.ico`).
- No `not-found.tsx` page.
- No loading/error UI for server components.
- Landing page testimonials are fictional ("Sarah M.", "James K.") and the `© 2026` footer with "Join thousands" copy is a credibility liability for an MVP.
- `<a href="#">` links in footer go nowhere.

---

## Architecture Issues

- **Dead dependencies bloating the install:**
  `@ai-sdk/openai`, `ai`, `lucide-react`, `@radix-ui/react-avatar`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-scroll-area`, `@radix-ui/react-separator`, `@radix-ui/react-slot`, `@radix-ui/react-toast`, `class-variance-authority`, `next-themes` — none are imported anywhere. They add ~50 MB to `node_modules` and slow Docker builds.
- **`tailwind-merge` + `clsx`** are wired through `cn()` but `cn` is also unused. Either keep for future use or drop with the rest.
- **`@ai-sdk/openai`** is installed but the chat route uses raw `fetch`. Pick one direction.
- **No `.dockerignore`.** `node_modules`, `.next`, `.git`, `.env*` all get copied into the build context. Slows builds and risks leaking a local `.env.local` into the image.
- **GitHub Actions runs `git pull origin main`** — committing on `beta` (per this task) won't deploy. Workflow needs a branch input or a separate `deploy-beta.yml`.
- **`docker compose build --no-cache`** on every deploy throws away layer cache for no reason on a server with a single app. Drop `--no-cache` and let cache invalidate naturally.
- **No CI workflow for PRs.** `npm run lint` / `npm run build` / `tsc --noEmit` should run on every push, not just when SSHing into prod.
- **`src/proxy.ts` import path** uses `@/lib/supabase/middleware` — the file is named `middleware.ts` because of the v15-era convention, but the function inside is `updateSession` so it's fine. Still, renaming it to `session.ts` would reduce confusion now that the project uses `proxy.ts`.

---

## Production-Readiness Punch List

In rough priority order:

1. **Fix Tailwind v4 wiring** so the site actually renders styled.
2. **Auth-gate `/api/chat`** and add a `messages.length` / `content.length` cap.
3. **Fix the two LinkedIn import bugs** (precedence, `update` → `upsert`).
4. **Verify the Composio MCP call shape** against current Composio docs and pass a `userId`/`entityId`. If we don't actually have a Composio integration ready, rip the route out and stub the page rather than ship a 500.
5. **Ship `supabase/schema.sql`** with table DDL, RLS policies, and storage bucket setup. Document in README.
6. **Drop unused deps** (`@ai-sdk/openai`, `ai`, `lucide-react`, all `@radix-ui/*`, `next-themes`, `class-variance-authority`).
7. **Add `.dockerignore`** (`node_modules`, `.next`, `.git`, `.env*`, `*.md`).
8. **Auto-refresh the documents list** after upload (`router.refresh()`).
9. **Add a CI workflow** (`.github/workflows/ci.yml`) running `npm ci`, `npm run lint`, `npm run build` on push and PR.
10. **Add `not-found.tsx`, favicon, active-nav highlight** for basic polish.
11. **Persist chat sessions** or remove the counter card.
12. **Replace fictional testimonials** with honest social proof or remove the section.
13. **Add a `Privacy` / `Terms` route** before going public — required for OAuth providers and basic compliance.
14. **Add per-IP rate limiting** on `/api/chat` and `/api/linkedin/import`.
15. **Lock down the `.env.production` file mode** in the deploy script.

---

## Out of Scope for This Pass

- Persisting chat history server-side (needs schema design).
- PDF export of CV templates (claimed but not wired).
- Job-match AI feature on the landing page (vapor — not implemented anywhere).
- Per-IP rate limiting (needs Redis or Upstash and is environment work).
- Replacing fake testimonials (a product decision, not engineering).
