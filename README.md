<div align="center">

# Signalor Web

**The web app for [signalor.ai](https://signalor.ai) — an AI visibility / GEO (Generative Engine Optimization) platform.**

Track and improve how AI engines — ChatGPT, Gemini, Perplexity, Claude and Google AI Overviews — see, cite and describe your brand.

[![CI](https://github.com/Optiminastic/signalor-web/actions/workflows/ci.yml/badge.svg)](https://github.com/Optiminastic/signalor-web/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

<br>

<img src="./public/hero.png" width="900" alt="The Signalor dashboard showing LLM visibility score, share of voice across AI engines, and prioritised actions">

</div>

---

## What this is

This repository is the **Next.js front end** of Signalor: the marketing site, the free tools, and the customer dashboard where brands see their GEO score, tracked prompts, competitors, recommendations and fixes.

**Please read this before you start:** the **analyzer backend is a separate, proprietary service and is not included here.** This repo is its client. That means:

- You **can** run the entire UI locally, click through every screen, and develop against it — using the built-in stub mode. **No database, no backend, no API keys.**
- You **cannot** produce real GEO scores from this repo alone, because the crawling/scoring/LLM pipeline lives in the closed backend.

We would rather say that plainly up front than have you discover it after an hour of setup.

---

## Quick start (stub mode — nothing to set up but dependencies)

```bash
git clone https://github.com/Optiminastic/signalor-web.git
cd signalor-web
pnpm install

cp .env.example .env.local
# then set these two in .env.local:
#   NEXT_PUBLIC_USE_STUBS=true
#   SKIP_ENV_VALIDATION=1

pnpm dev
```

Open <http://localhost:3000>. Onboarding and analysis return mocked data, so the full UI is clickable with no infrastructure.

> Requires **Node 20+** and **pnpm**. This project uses pnpm — npm/yarn installs are not supported.

### Running with real data

You need Postgres (for auth) and a reachable Signalor backend:

1. Set `DATABASE_URL`, `BETTER_AUTH_SECRET` (`openssl rand -base64 32`), `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` in `.env.local`.
2. Point `NEXT_PUBLIC_API_URL` at a Signalor backend.
3. Set `NEXT_PUBLIC_USE_STUBS=false` and remove `SKIP_ENV_VALIDATION`.

Every variable is documented in [`.env.example`](./.env.example). Nothing else is required — Google OAuth, email, Sanity, analytics and billing are all optional and degrade gracefully when unset.

---

## Tech stack

|                |                                                                              |
| -------------- | ---------------------------------------------------------------------------- |
| **Framework**  | Next.js 16 (App Router, Turbopack), React 19                                 |
| **Language**   | TypeScript (strict)                                                          |
| **Styling**    | Tailwind CSS 4 + shadcn/ui                                                   |
| **Auth**       | better-auth (email OTP + Google OAuth)                                       |
| **Data**       | Postgres via `pg`; TanStack Query for server state; Zustand for client state |
| **Validation** | Zod everywhere (env, forms, API responses)                                   |
| **CMS**        | Sanity (blog)                                                                |
| **Tests**      | Vitest (unit) + Playwright (e2e)                                             |

> Dev must run on **Turbopack** (the default). `next dev --webpack` breaks `NEXT_PUBLIC_*` inlining.

---

## Project layout

```
app/          Next.js App Router — routes, layouts, route handlers
features/     Self-contained feature modules
  ├─ landing/   marketing homepage
  ├─ site/      marketing site, blog, tools, docs
  └─ catalyst/  the customer dashboard
components/   Shared UI (no business logic); components/ui = shadcn primitives
hooks/        Shared React hooks
lib/          env, auth, logger, query client, validators
services/     External API / data access — the only place that fetches
stores/       Zustand stores
```

Architectural rules (file size limits, server-vs-client defaults, naming, state management) are documented in [`CLAUDE.md`](./CLAUDE.md). Read it before adding code — it applies to humans and AI assistants alike.

---

## Scripts

| Command                             | What it does                   |
| ----------------------------------- | ------------------------------ |
| `pnpm dev`                          | Dev server (Turbopack)         |
| `pnpm build` / `pnpm start`         | Production build / serve       |
| `pnpm type-check`                   | `tsc --noEmit`                 |
| `pnpm lint` / `pnpm lint:fix`       | ESLint (zero warnings allowed) |
| `pnpm format` / `pnpm format:check` | Prettier                       |
| `pnpm test` / `pnpm test:e2e`       | Vitest / Playwright            |
| `pnpm analyze`                      | Bundle analysis                |
| `pnpm dead-code`                    | Unused code/deps (knip)        |

CI runs type-check, lint, tests and build on every PR.

---

## Contributing

Contributions are welcome. Start with [`CONTRIBUTING.md`](./CONTRIBUTING.md), and please follow the conventions in [`CLAUDE.md`](./CLAUDE.md) — most review comments are just those rules.

Found a security issue? **Do not open a public issue** — see [`SECURITY.md`](./SECURITY.md).

By participating you agree to our [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## License

[Apache License 2.0](./LICENSE) — © Optiminastic.

Apache-2.0 is permissive: you may use, modify and distribute this code, including commercially, provided you keep the notices and state your changes. It also grants you a patent licence from the contributors.

"Signalor" and the Signalor logo are trademarks of Optiminastic. The licence covers the code, **not** the brand — please don't ship a fork that looks like it's us.
