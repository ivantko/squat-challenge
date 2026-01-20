Follow these instructions carefully and do not deviate from them.

## Project Overview & Structure

Comprehensive guide to the folder structure and organization of the project, including all main directories, key files, and their purposes.

@.cursor/rules/project-structure.mdc

## Tech Stack & Dependencies

Complete listing of the tech stack, frameworks, libraries, and dependencies used throughout the project, with version information and usage patterns.

@.cursor/rules/tech-stack-dependencies.mdc

## TypeScript Code Style Guide

TypeScript conventions including parameter passing patterns, type safety rules, import organization, functional programming practices, and documentation standards.

@.cursor/rules/typescript-style.mdc

## Next.js

Expert guidance on React, Next.js App Router, and related technologies including code structure, naming conventions, React best practices, UI styling, forms, metadata, error handling, accessibility, and security.

@.cursor/rules/nextjs.mdc

## UI Components from Shadcn UI

Guidelines for using Shadcn UI components from the shared UI library, including usage, import conventions, and best practices for composing user interfaces.

@.cursor/rules/ui-components.mdc

## Tailwind CSS Styling Practices

Tailwind CSS conventions covering class organization, responsive design, color system usage, layout patterns, design system integration, and styling best practices.

@.cursor/rules/tailwind-styling.mdc

## Landing Page Components Rule

Instructions for building public-facing pages using landing page components, including component sources, documentation references, structure examples, and implementation best practices.

@.cursor/rules/landing-components.mdc

## Self-Improvement

Guidelines for continuously improving rules based on emerging code patterns, including analysis processes, rule updates, quality checks, and documentation maintenance.

@.cursor/rules/self-improve.mdc

## Git & Version Control

- Add and commit automatically whenever an entire task is finished
- Use descriptive commit messages that capture the full scope of changes

## Retrieving library documentation by using Context 7

When the user requests code examples, setup or configuration steps, or library/API documentation, use the context7 mcp server to get the information.

## Browser Testing & Automation

**Playwright** - Use for repeatable, committed tests:
- E2E tests, CI runs, regression coverage
- Deterministic flows, fixtures, network mocking
- Traces/videos, parallel runs, cross-browser

**agent-browser** - Use for quick exploration:
- Fast manual verification, debugging UI state
- Checking deployed URLs, screenshots
- Lightweight one-off tasks

Run `agent-browser --help` for commands.

**Setup** (one-time):
```bash
npm install -g agent-browser
agent-browser install  # downloads Chromium
```

Core workflow:
1. `agent-browser open <url>` - Navigate to page
2. `agent-browser snapshot -i` - Get interactive elements with refs (@e1, @e2)
3. `agent-browser click @e1` / `fill @e2 "text"` - Interact using refs
4. Re-snapshot after page changes

Check for console errors to verify features work as expected.

## Local Supabase Testing

For testing auth flows (magic links) without relying on hosted Supabase email delivery, use local Supabase with Mailpit.

**Prerequisites:**
- Docker running (OrbStack recommended on macOS)
- Supabase CLI installed

**Start local Supabase:**
```bash
npm run supabase:start
```

**Update `.env.local` for local testing:**
```bash
# Replace hosted values with local:
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

**Test magic link flow:**
1. Restart dev server after env changes
2. Go to login page, enter any email (e.g., `test@local.dev`)
3. Open Mailpit at `http://localhost:54324`
4. Click the magic link from the email
5. You'll be authenticated and redirected to dashboard

**Supabase Studio:** `http://localhost:54323` (manage users, view data)

**Stop local Supabase:**
```bash
npm run supabase:stop
```

**Restore hosted Supabase:** Revert `.env.local` to use hosted URL and anon key, then restart dev server.

See `docs/local-supabase.md` for complete setup guide.

## **EXTREMELY IMPORTANT:** Code Quality Checks

**ALWAYS follow these instructions before completing a task.**

Automatically use the IDE's built-in diagnostics tool to check for linting and type errors:
   - Run `mcp__ide__getDiagnostics` to check all files for diagnostics
   - Fix any linting or type errors before considering the task complete
   - Do this for *each* file you create or edit

This is a CRITICAL step that must NEVER be skipped when working on any code-related task.
