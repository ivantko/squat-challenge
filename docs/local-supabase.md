# Local Supabase + Mailpit (magic link testing)

This app uses Supabase Auth magic links. In hosted Supabase, some emails/domains may be rejected or restricted. For **repeatable dev/testing**, run Supabase locally and read the auth emails from **Mailpit**.

## Prerequisites

- Supabase CLI installed (`supabase --version`)
- Docker running
- Node \(>= 22\)

## Start Supabase locally

From the repo root:

```bash
supabase start
```

Mailpit UI (captures auth emails):

- `http://localhost:54324`

## Configure the app env

Supabase local URL/keys are printed by:

```bash
supabase status
```

Copy [`env.example`](../env.example) to `.env.local` and fill:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (needed for E2E/admin helpers)

Then run the app:

```bash
npm run dev
```

## Test the magic-link login flow

1. Go to `http://localhost:6006/dashboard` \(\`/dashboard\` is auth-gated\)
2. You should be redirected to `/auth/login`
3. Enter any disposable email (e.g. `dev@local.test`) and submit
4. Open Mailpit `http://localhost:54324`
5. Open the newest email and click the magic link
6. You should land on `http://localhost:6006/dashboard`

## Run E2E locally

E2E uses the Supabase **service role** key (local) to generate a magic link and navigate to it (no real inbox needed).

1. Ensure Supabase is running:

```bash
npm run supabase:start
```

2. Run tests:

```bash
npm run test:e2e
```

## Reset local DB state (optional)

```bash
supabase db reset
```

## Stop Supabase

```bash
supabase stop
```

