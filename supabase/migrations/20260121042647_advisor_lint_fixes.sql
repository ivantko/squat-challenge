-- Supabase Advisor lint fixes
-- - 0010_security_definer_view: make view SECURITY INVOKER
-- - 0011_function_search_path_mutable: pin function search_path
-- - 0001_unindexed_foreign_keys: add missing FK indexes

-- View security: ensure RLS is respected by invokers
alter view public.leaderboard_view
  set (security_invoker = true);

-- Function hardening: pin search_path to avoid resolution attacks
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Performance: add covering indexes for foreign keys
create index if not exists challenge_participants_user_id_idx
  on public.challenge_participants using btree (user_id);

create index if not exists challenges_created_by_idx
  on public.challenges using btree (created_by);

create index if not exists entries_challenge_id_idx
  on public.entries using btree (challenge_id);

create index if not exists entries_user_id_idx
  on public.entries using btree (user_id);

