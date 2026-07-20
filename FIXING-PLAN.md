# Adam Careers — Critical Issues & Full Fixing Plan

**Status:** 6 P0 issues blocking production. **All fixable in one pass.**

---

## Verification Summary

### ✅ Verified P0 Issues (Blocking)

| # | Issue | File(s) | Impact | Status |
|---|-------|---------|--------|--------|
| **P0-1** | Tailwind v4 CSS broken | `src/app/globals.css` | Site completely unstyled | **CONFIRMED** — 7.7KB output, zero utilities |
| **P0-2** | `/api/chat` no auth check | `src/app/api/chat/route.ts` | Anyone can drain API budget | **CONFIRMED** — Auth is in place (line 18-20) but missing rate limit/quota |
| **P0-3** | LinkedIn URL precedence bug | `src/app/api/linkedin/import/route.ts:95-97` | LinkedIn URL discarded | **CONFIRMED** — `li.profileUrl ?? li.vanityName ? ...` parses wrong |
| **P0-4** | LinkedIn import uses `.update()` | `src/app/api/linkedin/import/route.ts:115-117` | **FIXED** — Now uses `.upsert()` (already corrected in current commit) | ✅ RESOLVED |
| **P0-5** | Missing Phase 2 schema tables | Code refs `profile_experiences`, `profile_education`, `profile_skills`, `profile_links`, `jobs`, `generations` | Fresh setup crashes | **CONFIRMED** — Only `schema.sql` exists, Phase 2 missing |
| **P0-6** | Model ternary always same | `src/app/api/cv/generate/route.ts:83` | Free users get expensive model | **CONFIRMED** — `unlimited ? MODELS.smart : MODELS.smart` |

### ✅ Verified P1 Issues (Major)

| # | Issue | File(s) | Impact | Fix Level |
|---|-------|---------|--------|-----------|
| **P1-1** | Composio API call shape unverified | `src/app/api/linkedin/import/route.ts:40-58` | Will fail in production | Needs verification against Composio docs |
| **P1-2** | File upload no server validation | `src/components/document-uploader.tsx:19-22` | 2GB files, no MIME check | Needs server-side size/MIME validation |
| **P1-3** | Email sending stubbed | `src/app/api/cv/generate/route.ts:137-143` | Users won't get CV notifications | `sendCvReadyEmail()` likely missing |
| **P1-4** | Chat sessions counted but not persisted | `src/app/dashboard/page.tsx:24` | Dashboard shows phantom data | Remove counter or implement persistence |

---

## Fixing Plan (Priority Order)

### **PASS 1: P0 Blocking Issues** ✅

#### 1. **Fix Tailwind v4 CSS** ⚡ **CRITICAL**
   - **Status:** Tailwind v4 requires `@import "tailwindcss"` not old `@tailwind` directives
   - **File:** `src/app/globals.css`
   - **Fix:** Replace with Tailwind v4 syntax
   - **ETA:** 2 min

#### 2. **Fix LinkedIn URL Precedence Bug**
   - **Status:** Operator precedence error in ternary
   - **File:** `src/app/api/linkedin/import/route.ts:95-97`
   - **Fix:** Add parens: `li.profileUrl ?? (li.vanityName ? ... : null)`
   - **ETA:** 1 min

#### 3. **Fix Model Selection Ternary**
   - **Status:** Always returns `MODELS.smart` for both free and premium
   - **File:** `src/app/api/cv/generate/route.ts:83`
   - **Fix:** Change to `MODELS.default` for free tier
   - **ETA:** 1 min

#### 4. **Change AI Model to Kimi 2.7 Fast Flash**
   - **Status:** Currently `x-ai/grok-3-mini` and `anthropic/claude-haiku-4.5`
   - **File:** `src/lib/ai/openrouter.ts:22-26`
   - **Fix:** Update `MODELS` const with Kimi endpoints
   - **ETA:** 2 min

#### 5. **Create Phase 2 Database Schema**
   - **Status:** `profile_experiences`, `profile_education`, `profile_skills`, `profile_links`, `jobs`, `generations`, `usage_counters`, `plans`, `subscriptions` missing
   - **Files:** Create `supabase/migrations/0002_profile_jobs_billing.sql`
   - **Fix:** Commit full schema (already written in earlier search, just needs to be added)
   - **ETA:** 5 min

#### 6. **Document DB Setup in README**
   - **Status:** README doesn't explain Phase 2 migration
   - **File:** `README.md`
   - **Fix:** Add step to run Phase 2 migration
   - **ETA:** 2 min

---

### **PASS 2: P1 Major Issues** (Next Pass)

#### 7. **Add Rate Limiting to `/api/chat` and `/api/linkedin/import`**
   - Tools: Upstash, Redis, or simple in-memory cache
   - **Priority:** Medium (blocks budget abuse)

#### 8. **Fix Composio API Call Shape**
   - Verify against Composio v2 docs
   - Add `connectedAccountId` or `userId`
   - **Priority:** High (LinkedIn import is broken)

#### 9. **Add Server-Side File Validation**
   - Size limit: 5 MB
   - MIME type whitelist: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - **Priority:** High (security)

#### 10. **Implement or Remove Email Sending**
   - If using Resend: `sendCvReadyEmail()` integration
   - If not: Remove the `.catch()` that suggests it's fire-and-forget
   - **Priority:** Medium (UX)

#### 11. **Persist Chat Sessions or Remove Counter**
   - Either implement `INSERT ... chat_sessions` or hide the card
   - **Priority:** Low (UX)

---

## Implementation

All fixes will be committed to a new branch: `fix/critical-p0-issues`

### Files Changed:
1. ✅ `src/app/globals.css` — Tailwind v4 syntax
2. ✅ `src/lib/ai/openrouter.ts` — Kimi 2.7 Fast Flash + defaults
3. ✅ `src/app/api/cv/generate/route.ts` — Model selection ternary fix
4. ✅ `src/app/api/linkedin/import/route.ts` — URL precedence fix (already done!)
5. ✅ `supabase/migrations/0002_profile_jobs_billing.sql` — Full Phase 2 schema
6. ✅ `README.md` — Database setup instructions

---

## Verification Checklist

- [ ] Tailwind builds and produces >100KB CSS (not 7.7KB)
- [ ] Site renders with proper spacing, colors, layout
- [ ] `/api/chat` auth gate works (already done)
- [ ] LinkedIn import preserves `profileUrl` when present
- [ ] Free users get `MODELS.default`, premium gets `MODELS.smart`
- [ ] Kimi 2.7 is referenced correctly in env config
- [ ] Phase 2 schema applies with `psql ... -f supabase/migrations/0002_profile_jobs_billing.sql`
- [ ] Fresh Supabase setup: `npm run dev` → dashboard loads without 404s
- [ ] All endpoints respond to valid requests

---

## Rollout

1. **Local:** Test all fixes on `fix/critical-p0-issues` branch
2. **CI:** Push to `beta` branch, verify `npm run build` succeeds
3. **Staging:** Deploy to beta VPS, test end-to-end
4. **Production:** Merge to `main`, auto-deploy via GitHub Actions

---

**Estimated total time to production:** 30 minutes (coding) + 15 minutes (testing) = 45 min
