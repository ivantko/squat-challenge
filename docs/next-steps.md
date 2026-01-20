# Next steps (recommended order)

Now that the dashboard + auth + APIs are in place and we have a local Supabase testing setup, here’s the highest-value work to tackle next.

## 1) Product identity / routing (recommended next focus)

Right now `/` still renders the original finance landing template. The squat challenge experience is at `/dashboard`.

Suggested options:
- **Redirect `/` → `/dashboard`** (fastest): makes the app feel like the squat challenge immediately.
- **Replace the landing page** with a squat-challenge landing (marketing + CTA → dashboard).

## 2) Auth UX + dev clarity

- On `/auth/login`, improve the error message when Supabase rejects an email (e.g. reserved/test domains) so it’s obvious what to do:
  - “Use a real inbox domain or run local Supabase + Mailpit.”
- Add a small “Local testing” hint linking to [`docs/local-supabase.md`](./local-supabase.md).

## 3) Data correctness + permissions

We already tightened caching/auth in the API routes, but the next pass should ensure:
- RLS aligns with all queries we run in the dashboard
- membership checks are consistent for any route that returns challenge-scoped data
- cache keys are invalidated in all write paths (entries/join, etc.)

## 4) Clean up remaining warnings

- Investigate the recurring browser console `400` resource error seen on `/auth/login` (it’s not blocking, but it’s noisy).
- Optional: address ESLint warnings (image optimization + missing hook deps) when you have time.

