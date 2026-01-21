-- Add challenge type column to challenges table
alter table public.challenges
add column if not exists type text
check (type in ('fitness', 'finance', 'gaming'));

-- Add comment for documentation
comment on column public.challenges.type is 'Challenge category: fitness, finance, or gaming';
