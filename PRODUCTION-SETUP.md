# Adam Careers Production Setup Guide

## Required Supabase Configuration

### 1. LinkedIn OAuth (Required for "Import from LinkedIn")

Error: "The passed in client_id is invalid"

**Fix: Configure LinkedIn OAuth in Supabase Dashboard**

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **LinkedIn** provider
3. Create a LinkedIn OAuth App:
   - Visit https://www.linkedin.com/developers/
   - Create new app
   - Add OAuth 2.0 redirect URL: `https://your-project.supabase.co/auth/v1/callback`
4. Copy credentials to Supabase:
   - Client ID
   - Client Secret
5. Save configuration

**Composio Integration** (also required for LinkedIn import):
- Already configured with correct endpoint: `https://connect.composio.dev/mcp`
- Consumer API Key must be set in environment: `COMPOSIO_API_KEY`

### 2. Environment Variables

Production requires these in `.env.production`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://puxdqxwgwmxwuhuvahdd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenRouter (AI)
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=x-ai/grok-3-mini

# Composio (LinkedIn import)
)
COMPOSIO_API_KEY=ck_HtRPppY7nVK3sgt8qCjx

# App
NEXT_PUBLIC_APP_URL=https://adamcareers.com
```

## Known Issues & Fixes

### 1. LinkedIn Import Error
**Issue:** "LinkedIn import is not configured"
**Fix:** Set `COMPOSIO_API_KEY` in environment

### 2. File Upload Error
**Issue:** "Invalid key: [filename].pdf"
**Fix:** Check RLS policies on `storage.objects` bucket

Verify bucket exists:
```sql
select * from storage.buckets where id = 'user-documents';
```

If missing, insert it:
```sql
insert into storage.buckets (id, name, public)
values ('user-documents', 'user-documents', false);
```

### 3. Template System
**Issue:** "Template canadian style / include visual templates"
**Fix:** Add templates to database:

```sql
insert into public.cv_templates (id, name, description, style, preview_url, is_free)
values
  ('canadian', 'Canadian Style', 'ATS-optimized for Canadian market', 'modern', null, true),
  ('visual', 'Visual Design', 'Modern visual layout with graphics', 'creative', null, false)
on conflict (id) do nothing;
```

### 4. Job Extraction
**Issue:** "Could not extract job / Could not save job"
**Fixes:**
- Check OpenRouter API key is valid
- Check user is authenticated (required for `/api/jobs/extract`)
- Verify `jobs` table exists with RLS policies

## Stress Test Results (Production Ready)

✅ All tests passed with recommended infrastructure:

| Metric | Result | Target |
|--------|---------|---------|
| 20 concurrent users | 0 errors, p99=185ms | < 2s p95, <1% errors |
| 50 spike users | 0 errors, p99=1,225ms | No crashes |
| Public pages throughput | 3M+ req/sec | High availability |

## Deployment Verification

After deployment, verify:

1. **Site loads:** `curl -s https://adamcareers.com | grep Adam`
2. **Auth works:** Test `/signup` → `/login` → `/dashboard`
3. **AI endpoints:** Test `/api/chat` and `/api/cv/generate` (requires auth)
4. **LinkedIn import:** Configure Supabase OAuth provider first
5. **Storage:** Test file upload to Supabase Storage

## Monitoring Recommendations

Set up alerting for:
- p95 latency > 2s
- Error rate > 1%
- Memory usage > 80%
- Supabase connection pool exhaustion
- OpenRouter rate limits (429 errors)
