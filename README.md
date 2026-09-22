# mind-dump

Get the thought out of your head fast. AI untangles it into tasks, reminders and
insights that come back to you.

Built for people with ADHD: capture takes under two seconds and asks you for
nothing — no title, no folder, no category.

> The product is **mind-dump.com**, with `brain-dump.ai` forwarding to it. The
> repo keeps its original name; it is internal and does not need to match.

## Why this exists

Anyone can text themselves a note. Nothing they do for free will nag them about
it three days later, in their timezone, on the right channel. **The outbound
loop is the product.**

## Stack

Turborepo + npm workspaces, Node >= 22.

- `apps/web` — Vite, React 18, React Router 6, Tailwind, Clerk
- `apps/api` — NestJS 10, Prisma 5, Postgres, Anthropic SDK, Resend
- `packages/types` — shared domain types and `TIER_LIMITS`

## Getting started

```bash
npm install
docker compose up -d postgres
cp apps/api/.env.example apps/api/.env   # fill in keys
cp apps/web/.env.example apps/web/.env
npm run dev
```

Web on http://localhost:5173, API on http://localhost:3000.

```bash
npm run lint && npm run typecheck && npm run build && npm run test
```

There is **no migration yet**, so there is nothing to run `db:migrate` against.
The first one is blocked on the number-model decision in
[#5](https://github.com/chowworks/brain-dump.ai/issues/5), which shapes the
`User` table.

## Branches

- **`main`** → production
- **`beta`** → a real deployed test system

Flow: feature branch → PR into `beta` → soak on the beta app → promote `beta`
into `main`. CI runs on pushes and PRs to both.

Note that `Closes #N` in a commit only fires when the change reaches the default
branch, so issues close at promotion rather than at merge into `beta`.

## Plans

Source of truth is `TIER_LIMITS` in `packages/types/src/index.ts`. The AI splits
three ways and they are priced differently on purpose.

| | Free | Pro |
|---|---|---|
| Dumps | unlimited | unlimited |
| AI **extraction** — dump → tasks, dates, tags | unlimited | unlimited |
| AI **reasoning** — insights across everything you wrote | — | yes |
| AI **task execution** — it does the task | — | yes |
| Reminders | push, email | push, email, SMS |
| MCP connectors | — | yes |

Capture is never rationed, and neither is extraction — a counter on the core
experience makes the product something you hesitate to use. The cost control is
`maxDumpChars` (20k free / 100k pro), because spend tracks input size rather
than how many times you press the button.

See `CLAUDE.md` for the reasoning and the verified cost constraints behind it.

## Status

Early. The landing page is built; the capture box does not yet persist anything.
[#15](https://github.com/chowworks/brain-dump.ai/issues/15) tracks the gap
between what the landing page promises and what exists.

## Contributing

Backlog lives in [GitHub Issues](https://github.com/chowworks/brain-dump.ai/issues).
Project conventions, agent roles and the definition of done are in `CLAUDE.md`.
