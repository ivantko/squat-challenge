> This website was generated with [PageAI](https://pageai.pro).
>
> 1-shot production-ready websites with a design system and AI-powered content generation.
> Get started on **[pageai.pro](https://pageai.pro)**.

Vibe Coding Starter
===================

This starter was created as part of the [Vibe Coding Starter](https://pageai.pro/vibe-coding-starter-guide) tutorial.

See the full video here:

[![Image](https://pageai.pro/static/images/blog/vibe-coding-starter-guide.jpg)](https://www.youtube.com/watch?v=p_q7-iW606U)

- [Installation](#installation)
- [Development](#development)
- [Build](#build)
- [Local Supabase (magic links)](#local-supabase-magic-links)

## Installation

```bash
npm i
```

## Development

First, run the development server:

```bash
npm run dev
```

## Local Supabase (magic links)

For repeatable testing of Supabase magic-link auth without relying on “real” email delivery, run Supabase locally and use Mailpit to read auth emails.

- Setup guide: [`docs/local-supabase.md`](docs/local-supabase.md)
- Next recommended work: [`docs/next-steps.md`](docs/next-steps.md)
- Useful scripts:
  - `npm run supabase:start`
  - `npm run supabase:stop`
  - `npm run supabase:reset`

## Build

To build the site for production, run the following command:

```bash
npm run build
```
