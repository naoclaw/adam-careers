-- Adam Careers — Supabase schema
--
-- Apply once on a fresh Supabase project (SQL editor or `supabase db push`).
-- Safe to re-run: every statement is `IF NOT EXISTS` / `CREATE OR REPLACE`.

-- ─── Extensions ──────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── profiles ────────────────────────────────────────────────────────────
-- One row per auth user. Created automatically by the handle_new_user
-- trigger below so the LinkedIn import upsert always has a row to merge into.
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  full_name     text,
  headline      text,
  linkedin_url  text,
  linkedin_id   text,
  summary       text,
  location      text,
  linkedin_raw  jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_self_upsert" on public.profiles;
create policy "profiles_self_upsert" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── documents ───────────────────────────────────────────────────────────
create table if not exists public.documents (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  type        text not null,
  file_path   text not null,
  size_bytes  bigint,
  created_at  timestamptz not null default now()
);

create index if not exists documents_user_id_created_at_idx
  on public.documents (user_id, created_at desc);

alter table public.documents enable row level security;

drop policy if exists "documents_self_all" on public.documents;
create policy "documents_self_all" on public.documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── chat_sessions ───────────────────────────────────────────────────────
create table if not exists public.chat_sessions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists chat_sessions_user_id_idx
  on public.chat_sessions (user_id, updated_at desc);

alter table public.chat_sessions enable row level security;

drop policy if exists "chat_sessions_self_all" on public.chat_sessions;
create policy "chat_sessions_self_all" on public.chat_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── cv_template_selections ──────────────────────────────────────────────
create table if not exists public.cv_template_selections (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  template_id    text not null,
  template_data  jsonb,
  updated_at     timestamptz not null default now()
);

alter table public.cv_template_selections enable row level security;

drop policy if exists "cv_template_selections_self_all" on public.cv_template_selections;
create policy "cv_template_selections_self_all" on public.cv_template_selections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Storage bucket: user-documents ──────────────────────────────────────
-- Must be created before the policies below.
insert into storage.buckets (id, name, public)
values ('user-documents', 'user-documents', false)
on conflict (id) do nothing;

drop policy if exists "user_documents_self_select" on storage.objects;
create policy "user_documents_self_select" on storage.objects
  for select using (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "user_documents_self_insert" on storage.objects;
create policy "user_documents_self_insert" on storage.objects
  for insert with check (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "user_documents_self_update" on storage.objects;
create policy "user_documents_self_update" on storage.objects
  for update using (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "user_documents_self_delete" on storage.objects;
create policy "user_documents_self_delete" on storage.objects
  for delete using (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
