-- Fix infinite recursion in challenge_participants RLS policy
-- The original SELECT policy referenced challenge_participants in its own check,
-- causing infinite recursion when querying the table.

-- Drop the problematic policy
drop policy if exists "Participants can view membership for joined challenges" on public.challenge_participants;

-- Create a simpler policy that allows all authenticated users to view participants
-- This is consistent with challenges being viewable by all authenticated users
create policy "Authenticated users can view challenge participants"
on public.challenge_participants for select
to authenticated
using (true);
