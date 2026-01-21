# Local Supabase + Mailpit (Magic Link Testing)

This app uses Supabase Auth magic links. In hosted Supabase, some emails/domains may be rejected or restricted. For **repeatable dev/testing**, run Supabase locally and read the auth emails from **Mailpit**.

## Prerequisites

- Supabase CLI installed (`supabase --version`)
- Docker running (OrbStack recommended on macOS)
- Node (>= 22)

## Quick Start

```bash
# 1. Start local Supabase (one time per session)
npm run supabase:start

# 2. Start dev server
npm run dev

# 3. Develop at http://localhost:6006
#    - Magic link emails: http://localhost:54324 (Mailpit)
#    - Supabase Studio: http://localhost:54323
```

## Configure the App Environment

Copy `env.example` to `.env.local` and fill values. The example already includes local Supabase defaults:

```bash
cp env.example .env.local
```

Local Supabase keys (these are standard and safe to use):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `http://127.0.0.1:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Standard local anon key (in env.example) |
| `SUPABASE_SERVICE_ROLE_KEY` | Standard local service role key (in env.example) |

Then run the app:

```bash
npm run dev
```

## Test the Magic-Link Login Flow

1. Go to `http://localhost:6006/dashboard` (auth-gated)
2. You'll be redirected to `/auth/login`
3. Enter any email (e.g., `dev@local.test`) and submit
4. Open Mailpit at `http://localhost:54324`
5. Click the magic link from the email
6. You should land on `http://localhost:6006/dashboard`

## Run E2E Tests Locally

E2E tests use the Supabase service role key to generate magic links programmatically (no real inbox needed).

1. Ensure Supabase is running:

```bash
npm run supabase:start
```

2. Run tests:

```bash
npm run test:e2e
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run supabase:start` | Start local Supabase |
| `npm run supabase:stop` | Stop local Supabase |
| `npm run supabase:reset` | Reset local database |

## Troubleshooting

### Local Supabase not starting

```bash
# Check Docker is running
docker ps

# Reset if needed
npm run supabase:stop
npm run supabase:start
```

### PostgreSQL version mismatch

If you see "database files are incompatible with server":

```bash
supabase stop --no-backup
docker volume rm supabase_db_<project-name>
npm run supabase:start
```

### Magic link goes to wrong URL

- Check `NEXT_PUBLIC_SITE_URL` in `.env.local`
- Restart dev server after changing env vars

## Stop Local Supabase

```bash
npm run supabase:stop
```
