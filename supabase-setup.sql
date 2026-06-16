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

-- done 🌱
