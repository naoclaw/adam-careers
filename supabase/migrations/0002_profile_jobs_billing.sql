-- Adam Careers — Phase 2: profile sub-tables, jobs, generations, billing
--
-- Apply on top of the base schema in supabase/schema.sql.
-- Safe to re-run: every statement is `IF NOT EXISTS` / `CREATE OR REPLACE`.

create extension if not exists "uuid-ossp";

-- ─── profile_experiences ─────────────────────────────────────────────────
create table if not exists public.profile_experiences (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  company       text not null,
  title         text not null,
  location      text,
  start_date    date,
  end_date      date,
  current       boolean not null default false,
  description   text,
  achievements  text[] not null default '{}',
  order_index   int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists profile_experiences_user_id_idx
  on public.profile_experiences (user_id, order_index);

alter table public.profile_experiences enable row level security;

drop policy if exists "profile_experiences_self_all" on public.profile_experiences;
create policy "profile_experiences_self_all" on public.profile_experiences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── profile_education ───────────────────────────────────────────────────
create table if not exists public.profile_education (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  school        text not null,
  degree        text,
  field         text,
  start_date    date,
  end_date      date,
  description   text,
  order_index   int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists profile_education_user_id_idx
  on public.profile_education (user_id, order_index);

alter table public.profile_education enable row level security;

drop policy if exists "profile_education_self_all" on public.profile_education;
create policy "profile_education_self_all" on public.profile_education
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── profile_skills ──────────────────────────────────────────────────────
create table if not exists public.profile_skills (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  category      text,        -- technical | soft | language | tool
  level         text,        -- beginner | intermediate | advanced | expert
  created_at    timestamptz not null default now()
);

create unique index if not exists profile_skills_user_name_idx
  on public.profile_skills (user_id, lower(name));

alter table public.profile_skills enable row level security;

drop policy if exists "profile_skills_self_all" on public.profile_skills;
create policy "profile_skills_self_all" on public.profile_skills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── profile_links ───────────────────────────────────────────────────────
create table if not exists public.profile_links (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  label         text not null,
  url           text not null,
  created_at    timestamptz not null default now()
);

alter table public.profile_links enable row level security;

drop policy if exists "profile_links_self_all" on public.profile_links;
create policy "profile_links_self_all" on public.profile_links
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── jobs ────────────────────────────────────────────────────────────────
create table if not exists public.jobs (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  source_url      text,
  title           text,
  company         text,
  location        text,
  employment_type text,
  salary_text     text,
  description     text,
  requirements    jsonb,
  skills          text[] not null default '{}',
  summary         text,
  raw_text        text,
  created_at      timestamptz not null default now()
);

create index if not exists jobs_user_id_created_at_idx
  on public.jobs (user_id, created_at desc);

alter table public.jobs enable row level security;

drop policy if exists "jobs_self_all" on public.jobs;
create policy "jobs_self_all" on public.jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── generations ─────────────────────────────────────────────────────────
create table if not exists public.generations (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  job_id             uuid references public.jobs(id) on delete set null,
  template_id        text not null default 'modern',
  cv_html            text,
  cover_letter_md    text,
  match_score        int,
  matched_skills     text[] not null default '{}',
  missing_skills     text[] not null default '{}',
  ai_model           text,
  prompt_tokens      int,
  completion_tokens  int,
  created_at         timestamptz not null default now()
);

create index if not exists generations_user_id_created_at_idx
  on public.generations (user_id, created_at desc);

alter table public.generations enable row level security;

drop policy if exists "generations_self_all" on public.generations;
create policy "generations_self_all" on public.generations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── plans ───────────────────────────────────────────────────────────────
create table if not exists public.plans (
  id                  text primary key,           -- 'free' | 'pro' | 'unlimited'
  name                text not null,
  monthly_price_cents int not null default 0,
  yearly_price_cents  int not null default 0,
  monthly_cv_quota    int,                        -- null = unlimited
  stripe_monthly_price_id text,
  stripe_yearly_price_id  text,
  features            jsonb not null default '[]',
  active              boolean not null default true,
  sort_order          int not null default 0,
  created_at          timestamptz not null default now()
);

alter table public.plans enable row level security;

drop policy if exists "plans_public_read" on public.plans;
create policy "plans_public_read" on public.plans
  for select using (active);

insert into public.plans (id, name, monthly_price_cents, yearly_price_cents, monthly_cv_quota, features, sort_order)
values
  ('free',      'Free',      0,      0,      3,    '["3 CVs per month","ATS-optimized HTML","Basic templates","Watermark on download"]'::jsonb, 1),
  ('pro',       'Pro',       999,    9900,   50,   '["50 CVs per month","All templates","No watermark","Priority email support","7-day free trial"]'::jsonb, 2),
  ('unlimited', 'Unlimited', 1999,   19900,  null, '["Unlimited CVs","All templates","Priority AI model (Claude)","No watermark","Early access to new features"]'::jsonb, 3)
on conflict (id) do update
  set name                = excluded.name,
      monthly_price_cents = excluded.monthly_price_cents,
      yearly_price_cents  = excluded.yearly_price_cents,
      monthly_cv_quota    = excluded.monthly_cv_quota,
      features            = excluded.features,
      sort_order          = excluded.sort_order;

-- ─── subscriptions ───────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  user_id                 uuid primary key references auth.users(id) on delete cascade,
  plan_id                 text not null default 'free' references public.plans(id),
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  status                  text not null default 'active',  -- active|trialing|past_due|canceled|incomplete
  billing_cycle           text,                            -- monthly|yearly
  current_period_end      timestamptz,
  cancel_at_period_end    boolean not null default false,
  trial_end               timestamptz,
  updated_at              timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_self_select" on public.subscriptions;
create policy "subscriptions_self_select" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Inserts/updates happen from the server (service-role key in webhook handler)

-- Auto-create a free subscription row on user signup
create or replace function public.handle_new_user_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriptions (user_id, plan_id, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_subscription on auth.users;
create trigger on_auth_user_created_subscription
  after insert on auth.users
  for each row execute function public.handle_new_user_subscription();

-- ─── usage_counters ──────────────────────────────────────────────────────
create table if not exists public.usage_counters (
  user_id       uuid not null references auth.users(id) on delete cascade,
  period_start  date not null,    -- first day of the calendar month
  cv_count      int not null default 0,
  primary key (user_id, period_start)
);

alter table public.usage_counters enable row level security;

drop policy if exists "usage_counters_self_select" on public.usage_counters;
create policy "usage_counters_self_select" on public.usage_counters
  for select using (auth.uid() = user_id);

-- Atomic increment helper, used from the generation route via service-role key.
create or replace function public.increment_cv_usage(p_user_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_period date := date_trunc('month', now())::date;
  v_count  int;
begin
  insert into public.usage_counters (user_id, period_start, cv_count)
  values (p_user_id, v_period, 1)
  on conflict (user_id, period_start)
    do update set cv_count = public.usage_counters.cv_count + 1
  returning cv_count into v_count;
  return v_count;
end;
$$;

-- ─── email_log ───────────────────────────────────────────────────────────
create table if not exists public.email_log (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete set null,
  type         text not null,
  to_email     text not null,
  subject      text,
  status       text not null default 'queued',
  provider_id  text,
  error        text,
  sent_at      timestamptz not null default now()
);

create index if not exists email_log_user_id_sent_at_idx
  on public.email_log (user_id, sent_at desc);

alter table public.email_log enable row level security;
-- email_log is server-only (service-role); no user-facing policy.
