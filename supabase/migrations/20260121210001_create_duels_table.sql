-- Create duels table for tracking 1v1 challenges between participants
create table if not exists public.duels (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references public.challenges(id) on delete cascade,
  challenger_id uuid not null references auth.users(id) on delete cascade,
  challenged_id uuid not null references auth.users(id) on delete cascade,
  scoring_type text not null default 'win_loss' check (scoring_type in ('win_loss', 'score_based')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  winner_id uuid references auth.users(id) on delete set null,
  challenger_score int,
  challenged_score int,
  notes text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Trigger for updated_at
create trigger duels_set_updated_at
before update on public.duels
for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.duels enable row level security;

-- RLS policies
create policy "Users can view duels they're involved in"
on public.duels for select to authenticated
using (challenger_id = auth.uid() or challenged_id = auth.uid());

create policy "Users can create duels"
on public.duels for insert to authenticated
with check (challenger_id = auth.uid());

create policy "Involved users can update duels"
on public.duels for update to authenticated
using (challenger_id = auth.uid() or challenged_id = auth.uid());

-- Add indexes for common queries
create index if not exists duels_challenger_id_idx on public.duels(challenger_id);
create index if not exists duels_challenged_id_idx on public.duels(challenged_id);
create index if not exists duels_challenge_id_idx on public.duels(challenge_id);
create index if not exists duels_status_idx on public.duels(status);

-- Add comments
comment on table public.duels is 'Tracks 1v1 duels between participants';
comment on column public.duels.scoring_type is 'How the duel is scored: win_loss (simple winner) or score_based (points comparison)';
comment on column public.duels.status is 'Duel lifecycle: pending -> accepted -> completed, or pending -> declined/cancelled';
