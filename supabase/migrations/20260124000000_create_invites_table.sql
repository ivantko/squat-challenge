-- =============================================================================
-- Invite Links for Buddies
-- =============================================================================

-- Table for storing invite tokens
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  display_name text not null,
  email text,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'claimed', 'completed')),
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  completed_at timestamptz
);

-- Index for fast token lookups
create index if not exists idx_invites_token on public.invites(token);

-- Enable RLS
alter table public.invites enable row level security;

-- Allow anyone to view valid invites by token (for landing page)
drop policy if exists "Anyone can view valid invites by token" on public.invites;
create policy "Anyone can view valid invites by token"
on public.invites for select to anon, authenticated
using (status in ('pending', 'claimed') and expires_at > now());

-- Allow service role to update invites (via API routes)
-- Note: API routes use service role key for invite updates

-- ---------------------------------------------------------------------------
-- Trigger: On invite completion, update profile name + enroll in challenges
-- ---------------------------------------------------------------------------

create or replace function public.handle_invite_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only run when status changes to 'completed' and user_id is set
  if new.status = 'completed' and new.user_id is not null then
    -- Update profile display name
    update public.profiles
    set display_name = new.display_name
    where id = new.user_id;

    -- Auto-enroll in all challenges
    insert into public.challenge_participants (challenge_id, user_id)
    select c.id, new.user_id
    from public.challenges c
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_invite_completed on public.invites;
create trigger on_invite_completed
after update of status on public.invites
for each row
when (old.status != 'completed' and new.status = 'completed')
execute function public.handle_invite_completion();
