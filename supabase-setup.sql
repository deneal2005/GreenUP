-- ============================================================
-- GreenUp · supabase-setup.sql
-- Run this ONCE in your Supabase project:
--   Dashboard → SQL Editor → New query → paste → Run
-- Safe to re-run (it drops/recreates its own policies).
-- ============================================================

-- ---------- 1 · TABLES ----------

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null check (char_length(username) between 3 and 24),
  full_name text not null default '',
  college text not null default '',
  country text not null default '',
  bio text not null default '',
  avatar_url text not null default '',
  points int not null default 0,
  trees int not null default 0,
  cleanups int not null default 0,
  waste_kg numeric not null default 0,
  streak int not null default 0,
  last_action_on date,
  quiz_wins int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.actions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('tree','cleanup')),
  title text not null default '',
  species text,
  note text,
  waste_types text,
  weight_kg numeric check (weight_kg is null or (weight_kg >= 0 and weight_kg <= 1000)),
  points int not null default 0,
  lat double precision,
  lng double precision,
  place text not null default '',
  photo_url text,
  before_url text,
  after_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.donations (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete set null,
  donor_name text not null default 'Anonymous',
  amount numeric not null check (amount >= 0),
  currency text not null default 'INR',
  created_at timestamptz not null default now()
);

-- teams (v2 — safe to run on an existing v1 database)
create table if not exists public.teams (
  id bigint generated always as identity primary key,
  name text unique not null check (char_length(name) between 3 and 40),
  org text not null default '',
  description text not null default '',
  logo_url text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  team_id bigint not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

alter table public.actions add column if not exists team_id bigint references public.teams(id) on delete set null;

create index if not exists actions_created_idx on public.actions (created_at desc);
create index if not exists actions_user_idx on public.actions (user_id);
create index if not exists actions_team_idx on public.actions (team_id);
create index if not exists profiles_points_idx on public.profiles (points desc);
create index if not exists donations_created_idx on public.donations (created_at desc);
create index if not exists team_members_user_idx on public.team_members (user_id);

-- ---------- 2 · ROW LEVEL SECURITY ----------

alter table public.profiles enable row level security;
alter table public.actions enable row level security;
alter table public.donations enable row level security;

drop policy if exists "profiles are public" on public.profiles;
create policy "profiles are public" on public.profiles
  for select using (true);

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "actions are public" on public.actions;
create policy "actions are public" on public.actions
  for select using (true);

drop policy if exists "users insert own actions" on public.actions;
create policy "users insert own actions" on public.actions
  for insert with check (auth.uid() = user_id);

drop policy if exists "users delete own actions" on public.actions;
create policy "users delete own actions" on public.actions
  for delete using (auth.uid() = user_id);

drop policy if exists "donations are public" on public.donations;
create policy "donations are public" on public.donations
  for select using (true);

drop policy if exists "signed-in users donate" on public.donations;
create policy "signed-in users donate" on public.donations
  for insert to authenticated with check (auth.uid() = user_id);

alter table public.teams enable row level security;
alter table public.team_members enable row level security;

drop policy if exists "teams are public" on public.teams;
create policy "teams are public" on public.teams
  for select using (true);

drop policy if exists "signed-in users create teams" on public.teams;
create policy "signed-in users create teams" on public.teams
  for insert to authenticated with check (auth.uid() = created_by);

drop policy if exists "owners update their team" on public.teams;
create policy "owners update their team" on public.teams
  for update to authenticated using (auth.uid() = created_by) with check (auth.uid() = created_by);

drop policy if exists "owners delete their team" on public.teams;
create policy "owners delete their team" on public.teams
  for delete to authenticated using (auth.uid() = created_by);

drop policy if exists "memberships are public" on public.team_members;
create policy "memberships are public" on public.team_members
  for select using (true);

drop policy if exists "users join teams themselves" on public.team_members;
create policy "users join teams themselves" on public.team_members
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "users leave teams themselves" on public.team_members;
create policy "users leave teams themselves" on public.team_members
  for delete to authenticated using (auth.uid() = user_id);

-- ---------- 3 · AUTO-CREATE PROFILE ON SIGNUP ----------
-- Pulls the username chosen at signup (or derives one from the email /
-- Google name) and guarantees uniqueness.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base text;
  candidate text;
  n int := 0;
begin
  base := lower(regexp_replace(
    coalesce(
      nullif(new.raw_user_meta_data->>'username', ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'gardener'
    ), '[^a-z0-9_]', '', 'g'));
  if base is null or char_length(base) < 3 then base := 'gardener'; end if;
  base := left(base, 20);
  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    n := n + 1;
    candidate := base || n::text;
  end loop;

  insert into public.profiles (id, username, full_name, college, avatar_url)
  values (
    new.id,
    candidate,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'college', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- The trigger runs as the table owner, so nobody else ever needs to call
-- this function directly. Locking it down keeps it off the public RPC API
-- (fixes the "SECURITY DEFINER function executable" linter warnings).
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------- 4 · STORAGE BUCKETS (proof photos + avatars) ----------

insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', true), ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "public read greenup media" on storage.objects;
create policy "public read greenup media" on storage.objects
  for select using (bucket_id in ('proofs','avatars'));

drop policy if exists "users upload to own folder" on storage.objects;
create policy "users upload to own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('proofs','avatars') and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "users update own media" on storage.objects;
create policy "users update own media" on storage.objects
  for update to authenticated
  using (bucket_id in ('proofs','avatars') and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "users delete own media" on storage.objects;
create policy "users delete own media" on storage.objects
  for delete to authenticated
  using (bucket_id in ('proofs','avatars') and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- 5 · REALTIME (live world-map pins) ----------

do $$
begin
  alter publication supabase_realtime add table public.actions;
exception when duplicate_object then null;
end $$;

-- ============================================================
-- v3 · MODERATION · RBAC ADMIN · CAMPAIGNS · AUDIT
-- Everything below is additive and idempotent — safe to re-run
-- on an existing v1/v2 database.
-- ============================================================

-- ---------- 6 · ACTION MODERATION LIFECYCLE ----------
-- status flow:
--   draft     · "before" photo uploaded, waiting for the "after" shot
--   pending   · complete, waiting for a moderator (used by pre-moderation)
--   approved  · live on the world map + counts points (post-moderation default)
--   rejected  · hidden, points reversed by the app
alter table public.actions add column if not exists status text not null default 'approved'
  check (status in ('draft','pending','approved','rejected'));
alter table public.actions add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;
alter table public.actions add column if not exists reviewed_at timestamptz;
alter table public.actions add column if not exists reject_reason text;
-- draft bookkeeping so an interrupted "before" upload can be resumed
alter table public.actions add column if not exists client_ref text;
alter table public.actions add column if not exists updated_at timestamptz not null default now();
create index if not exists actions_status_idx on public.actions (status);
create index if not exists actions_clientref_idx on public.actions (user_id, client_ref);

-- ---------- 7 · ROLES (RBAC) ----------
create table if not exists public.user_roles (
  user_id uuid not null references auth.users on delete cascade,
  role text not null check (role in ('super_admin','admin','moderator')),
  granted_by uuid references auth.users on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- Helper functions live in a PRIVATE schema on purpose: PostgREST only serves
-- `public`, so these never become /rest/v1/rpc endpoints (which would let a
-- signed-in user probe "is this uid an admin?" and enumerate your admins).
-- They're SECURITY DEFINER so they read user_roles WITHOUT triggering RLS —
-- that's what keeps the role policies from recursing. They act on auth.uid(),
-- so a caller can only ever learn about themselves.
create schema if not exists private;
grant usage on schema private to anon, authenticated;

create or replace function private.has_role(want text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = want);
$$;
create or replace function private.is_admin()   -- admin OR super_admin
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role in ('admin','super_admin'));
$$;
create or replace function private.is_staff()   -- any privileged role
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid());
$$;
grant execute on function private.has_role(text), private.is_admin(), private.is_staff() to anon, authenticated;

alter table public.user_roles enable row level security;
-- the client reads its OWN roles straight from this table (select policy below)
drop policy if exists "read own or staff reads all roles" on public.user_roles;
create policy "read own or staff reads all roles" on public.user_roles
  for select using (auth.uid() = user_id or private.is_staff());
drop policy if exists "super admins manage roles" on public.user_roles;
create policy "super admins manage roles" on public.user_roles
  for all to authenticated
  using (private.has_role('super_admin')) with check (private.has_role('super_admin'));

-- ---------- 8 · MODERATION POLICIES ----------
-- world map / gallery now only exposes approved actions (plus your own drafts
-- and everything to staff).
drop policy if exists "actions are public" on public.actions;
drop policy if exists "approved actions are public" on public.actions;
create policy "approved actions are public" on public.actions
  for select using (status = 'approved' or auth.uid() = user_id or private.is_staff());

-- owners may finish their own draft (attach the "after" shot) or edit it
drop policy if exists "users update own actions" on public.actions;
create policy "users update own actions" on public.actions
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- staff can moderate any submission; admins can hard-delete
drop policy if exists "staff moderate actions" on public.actions;
create policy "staff moderate actions" on public.actions
  for update to authenticated using (private.is_staff()) with check (private.is_staff());
drop policy if exists "admins delete any action" on public.actions;
create policy "admins delete any action" on public.actions
  for delete to authenticated using (private.is_admin());

-- moderation flags on profiles + let admins update any profile (ban / flag)
alter table public.profiles add column if not exists banned boolean not null default false;
alter table public.profiles add column if not exists flagged boolean not null default false;
drop policy if exists "staff update profiles" on public.profiles;
create policy "staff update profiles" on public.profiles
  for update to authenticated using (private.is_admin()) with check (private.is_admin());

-- ---------- 9 · DONATION CAMPAIGNS ----------
create table if not exists public.campaigns (
  id bigint generated always as identity primary key,
  title text not null check (char_length(title) between 2 and 120),
  description text not null default '',
  goal_inr numeric not null default 0 check (goal_inr >= 0),
  cover_url text not null default '',
  status text not null default 'active' check (status in ('active','paused','completed','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now()
);
-- amount_inr is the currency-normalised amount, written by the client at gift
-- time so the dashboards can sum mixed currencies without live FX.
alter table public.donations add column if not exists amount_inr numeric;
alter table public.donations add column if not exists campaign_id bigint references public.campaigns(id) on delete set null;
create index if not exists donations_campaign_idx on public.donations (campaign_id);

alter table public.campaigns enable row level security;
drop policy if exists "campaigns public read" on public.campaigns;
create policy "campaigns public read" on public.campaigns
  for select using (status <> 'archived' or private.is_staff());
drop policy if exists "admins manage campaigns" on public.campaigns;
create policy "admins manage campaigns" on public.campaigns
  for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- ---------- 10 · AUDIT LOG ----------
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid references public.profiles(id) on delete set null,
  actor_name text not null default '',
  action text not null,
  entity text not null default '',
  entity_id text not null default '',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_created_idx on public.audit_log (created_at desc);
alter table public.audit_log enable row level security;
drop policy if exists "staff read audit" on public.audit_log;
create policy "staff read audit" on public.audit_log
  for select to authenticated using (private.is_staff());
drop policy if exists "staff write audit" on public.audit_log;
create policy "staff write audit" on public.audit_log
  for insert to authenticated with check (private.is_staff() and actor = auth.uid());

-- ---------- 11 · REALTIME (live donation ticker) ----------
do $$
begin
  alter publication supabase_realtime add table public.donations;
exception when duplicate_object then null;
end $$;

-- ============================================================
-- BOOTSTRAP YOUR FIRST SUPER ADMIN (run once, manually)
-- 1. Supabase Dashboard → Authentication → Users → copy your user's UID
-- 2. Uncomment the line below, paste the UID, and run it:
--
-- insert into public.user_roles (user_id, role)
--   values ('PASTE-YOUR-AUTH-UID-HERE', 'super_admin')
--   on conflict do nothing;
--
-- After that, promote other admins/moderators from the in-app admin panel.
-- ============================================================

-- done 🌱
