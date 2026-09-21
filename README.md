# brain-dump.ai

Get the thought out of your head fast. AI turns it into tasks, reminders and
insights that come back to you.

Built for people with ADHD: capture takes under two seconds and asks you for
nothing — no title, no folder, no category.

## Why this exists

Anyone can text themselves a note. Nothing they do for free will nag them about
it three days later, in their timezone, on the right channel. **The outbound
loop is the product.**

## Stack

Turborepo + npm workspaces, Node >= 22.

- `apps/web` — Vite, React 18, React Router 6, Tailwind, Clerk
- `apps/api` — NestJS 10, Prisma 5, Postgres, Anthropic SDK, Resend
- `packages/types` — shared domain types and tier limits

## Getting started

```bash
npm install
docker compose up -d postgres
cp apps/api/.env.example apps/api/.env   # fill in keys
cp apps/web/.env.example apps/web/.env
npm run -w @bd/api db:migrate
npm run dev
```

Web on http://localhost:5173, API on http://localhost:3000.

```bash
npm run lint && npm run typecheck && npm run build && npm run test
```

## Plans

| | Free | Pro |
|---|---|---|
| Dumps | unlimited | unlimited |
| AI transforms | 30 / month | unlimited |
| Reminders | push, email | push, email, SMS |
| MCP connectors | — | yes |

Capture is never rationed. See `CLAUDE.md` for the reasoning and the cost
constraints behind it.

## Contributing

Backlog lives in [GitHub Issues](https://github.com/chowworks/brain-dump.ai/issues).
Project conventions, agent roles and the definition of done are in `CLAUDE.md`.
