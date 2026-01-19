-- Seed data for local/dev

insert into public.challenges (slug, name, status)
values
  ('all', 'All Time', 'active'),
  ('spring-2024', 'Spring Shred 2024', 'active'),
  ('summer-2024', 'Summer Sweat 2024', 'active'),
  ('fall-2024', 'Fall Fitness 2024', 'active'),
  ('winter-2025', 'Winter Warrior 2025', 'active')
on conflict do nothing;

