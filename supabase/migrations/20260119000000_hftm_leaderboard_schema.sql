-- =============================================================================
-- HamsForTheMaams: Challenge leaderboard schema (MVP)
-- =============================================================================

-- UUID support
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Auto-create profile row on new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Challenges
-- ---------------------------------------------------------------------------

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  starts_at date,
  ends_at date,
  status text not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists challenges_set_updated_at on public.challenges;
create trigger challenges_set_updated_at
before update on public.challenges
for each row execute function public.set_updated_at();

alter table public.challenges enable row level security;

drop policy if exists "Challenges are viewable by authenticated users" on public.challenges;
create policy "Challenges are viewable by authenticated users"
on public.challenges for select
to authenticated
using (true);

drop policy if exists "Users can create challenges" on public.challenges;
create policy "Users can create challenges"
on public.challenges for insert
to authenticated
with check (created_by = (select auth.uid()));

drop policy if exists "Challenge owners can update challenges" on public.challenges;
create policy "Challenge owners can update challenges"
on public.challenges for update
to authenticated
using (created_by = (select auth.uid()))
with check (created_by = (select auth.uid()));

drop policy if exists "Challenge owners can delete challenges" on public.challenges;
create policy "Challenge owners can delete challenges"
on public.challenges for delete
to authenticated
using (created_by = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Participants
-- ---------------------------------------------------------------------------

create table if not exists public.challenge_participants (
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

alter table public.challenge_participants enable row level security;

drop policy if exists "Participants can view membership for joined challenges" on public.challenge_participants;
create policy "Participants can view membership for joined challenges"
on public.challenge_participants for select
to authenticated
using (
  exists (
    select 1
    from public.challenge_participants cp
    where
      cp.challenge_id = challenge_participants.challenge_id and
      cp.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can join challenges" on public.challenge_participants;
create policy "Users can join challenges"
on public.challenge_participants for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Users can leave challenges" on public.challenge_participants;
create policy "Users can leave challenges"
on public.challenge_participants for delete
to authenticated
using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Entries
-- ---------------------------------------------------------------------------

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  is_win boolean not null default false,
  percentile int not null default 50 check (percentile >= 0 and percentile <= 100),
  proof_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists entries_set_updated_at on public.entries;
create trigger entries_set_updated_at
before update on public.entries
for each row execute function public.set_updated_at();

alter table public.entries enable row level security;

drop policy if exists "Participants can view entries for their challenges" on public.entries;
create policy "Participants can view entries for their challenges"
on public.entries for select
to authenticated
using (
  exists (
    select 1
    from public.challenge_participants cp
    where
      cp.challenge_id = entries.challenge_id and
      cp.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can create their own entries" on public.entries;
create policy "Users can create their own entries"
on public.entries for insert
to authenticated
with check (
  user_id = (select auth.uid()) and
  exists (
    select 1
    from public.challenge_participants cp
    where
      cp.challenge_id = entries.challenge_id and
      cp.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can update their own entries" on public.entries;
create policy "Users can update their own entries"
on public.entries for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Users can delete their own entries" on public.entries;
create policy "Users can delete their own entries"
on public.entries for delete
to authenticated
using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Leaderboard view (derived)
-- ---------------------------------------------------------------------------

create or replace view public.leaderboard_view as
with stats as (
  select
    cp.challenge_id,
    cp.user_id,
    count(e.id)::int as total_entries,
    coalesce(sum(case when e.is_win then 1 else 0 end), 0)::int as wins,
    coalesce(round(
      100.0 * coalesce(sum(case when e.is_win then 1 else 0 end), 0)::numeric /
      nullif(count(e.id), 0)
    )::int, 0) as win_rate,
    coalesce(round(
      100.0 * coalesce(sum(case when e.percentile <= 25 then 1 else 0 end), 0)::numeric /
      nullif(count(e.id), 0)
    )::int, 0) as top25,
    coalesce(round(
      100.0 * coalesce(sum(case when e.percentile <= 50 then 1 else 0 end), 0)::numeric /
      nullif(count(e.id), 0)
    )::int, 0) as top50
  from public.challenge_participants cp
  left join public.entries e
    on e.challenge_id = cp.challenge_id and e.user_id = cp.user_id
  group by cp.challenge_id, cp.user_id
)
select
  stats.*,
  dense_rank() over (
    partition by stats.challenge_id
    order by stats.wins desc, stats.win_rate desc, stats.top25 desc
  )::int as rank
from stats;

