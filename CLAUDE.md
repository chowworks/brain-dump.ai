# Project memory — brain-dump

## What this is

A capture tool for people with ADHD. Dump a thought fast, and AI turns it into
tasks, reminders and insights that come *back* to you.

**The moat is the outbound loop, not the capture and not the transform.** Anyone
can text themselves a note. Nothing they can do for free will nag them about it
three days later, in their timezone, on the right channel. Every scoping
decision resolves toward that loop.

Competitor: MindChuk (text a number, feed, search, tags, one-time payment). We
are strictly downstream of it — we take the dump and make it actionable.

## Business model

Source of truth for limits is `TIER_LIMITS` in `packages/types/src/index.ts`.
Change it there, never hardcode a quota.

| | FREE | PRO (monthly) |
|---|---|---|
| Dumps | unlimited | unlimited |
| AI transforms | 30/month | unlimited |
| Reminder channels | push, email | push, email, **SMS** |
| MCP connectors | no | yes |

Rationale: capture is cheap to serve and is the habit we need, so it is never
rationed. The transform is the meter and the conversion moment. SMS is the tier
wall because it is the only channel with real per-user marginal cost.

We charge monthly where MindChuk charges once. That is only defensible because
our costs recur. Every PRO feature must strengthen that answer.

## Verified cost constraints

Do not re-litigate these without new sources.

- **Telnyx all-in ≈ $0.008 per message part**, not $0.004. The $0.004 is the base
  rate; US carriers add a surcharge per part (T-Mobile $0.003, AT&T $0.0035,
  Verizon $0.0045). Telnyx still beats Twilio, which passes through the same
  surcharges on a higher base — but budget $0.008, not $0.004.
- SMS long code rental: **$1.00/month per number**. A free user can never have a
  dedicated number.
- **Sendblue is disqualified**: $100/line/month. Consumer scale is impossible.
- **Transform cost is dominated by model choice, not by the quota.** Haiku 4.5
  ≈ $0.003/transform vs Opus 5 ≈ $0.020 — 6.5x for the same structured
  extraction job. Pin the transform to Haiku and keep the model a config value.
  `Transform.model` exists so this can be measured per model.
- **Anything that runs on a schedule costs money per user whether they engage or
  not.** Scheduled work must be gated on tier AND recent activity AND capped
  input, and must use the Batch API (50% off, no latency requirement).
- **A2P 10DLC is mandatory and provider-independent.** US carriers have blocked
  100% of unregistered 10DLC traffic since Feb 2025 (The Campaign Registry).
  ~5–7 business days to approve; registering EIN must be ≥15 days old. Switching
  vendors does not avoid this. It gates any SMS launch date.

## Open decisions

- **Dedicated SMS number per user, or a shared pool?** `User.smsNumber` in
  `packages/types` currently assumes one number per user — that is $10,000/month
  in rental at 10k PRO users. Inbound SMS identifies the sender by caller ID, so
  a pool sized to *throughput* rather than user count plausibly costs $50–100/month
  instead. The only thing forcing more numbers is 10DLC per-campaign throughput
  and daily volume caps, which nobody has looked up yet. **Resolve this before the
  field reaches a migration.**
- **MindChuk's actual price is unknown.** mindchuk.com is blocked by the egress
  proxy. Every argument about our subscription reads differently at $15 than at
  $79. Highest-value open lookup.
- **The meter may be on the wrong thing.** CLAUDE.md calls the outbound loop the
  moat, but TIER_LIMITS meters the transform and gives push/email reminders away
  free and unlimited. Open question whether persistent re-surfacing should move to
  PRO — it improves the pricing story but weakens a free tier we want to be better
  than the competitor's. Unresolved; this is a positioning call.
- **Name.** `getbraindump.com` already ships "Brain Dump: AI Notes & Writing" on
  the App Store. "Brain dump" is descriptive and therefore a weak trademark, so
  the real exposure is SEO and App Store confusion rather than legal. `mind-dump`
  is the fallback. Needs a USPTO TESS search in classes 9 and 42 — unresolved.

## Stack

Turborepo + npm workspaces, Node ≥22. Mirrors `ludakhris/interview-differently`.

- `apps/web` — Vite, React 18, React Router 6, Tailwind 3, Clerk
- `apps/api` — NestJS 10, Prisma 5, Postgres, Clerk backend, Anthropic SDK, Resend
- `packages/types` — shared domain types and `TIER_LIMITS`

`docker compose up -d postgres` for local DB. Dev servers via `.claude/launch.json`
(web 5173, api 3000).

## Schema invariant

**`Dump` is append-only.** It holds the user's raw thought. Transforms, tasks,
reminders and insights hang off it and may be re-run, corrected or discarded —
the original text must survive all of it intact. Any code path that mutates or
deletes a Dump is a defect until proven otherwise.

## Agents

`.claude/agents/` — invoke by name:

- **biz-analyst** — rules on which tier a feature belongs to and what it costs
  at 10k users. Consult *before* building, not after.
- **code-reviewer** — reviews the diff for real defects before commit or PR.
- **product-manager** — owns GitHub Issues, enforces definition of done.
- **qa-tester** — drives the running app as a distracted user and reports breaks.

## Workflow

**Backlog lives in [GitHub Issues](https://github.com/chowworks/brain-dump.ai/issues), not files.**
One issue per coherent feature, checklist inside for sub-tasks. Reference issues
in commits with `Closes #N` (or `Refs #N` for partial work). Do not create a
`TASKS.md` — file-based backlogs drift.

## Screenshots on issues

Screenshots are evidence that closes a ticket, captured **after** implementation.
They never block opening one.

1. Start dev servers via `.claude/launch.json`.
2. Capture with Playwright. Chromium is preinstalled at `/opt/pw-browsers/chromium`
   — **never run `playwright install`**.
3. Save to `docs/screenshots/<feature>/NN-name.png`. Name folders after the
   feature, never `phase1/`, `phaseN/`.
4. Commit and push so images have a stable URL.
5. Reference from the issue comment pinned to the **commit SHA**:
   `https://raw.githubusercontent.com/chowworks/brain-dump.ai/<sha>/docs/screenshots/<feature>/NN-name.png`
6. Update the issue's checklist.

Backend-only changes don't need screenshots — don't invent a UI to photograph.

# How We Develop (Company Std Guidance for all projects)

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.
- Remove imports/variables/functions that YOUR changes made unused.

Every changed line should trace directly to the user's request.

## 4. Always Confirm Before Committing

**Never commit or push without explicit user approval.** Summarize what will be
committed and ask. This applies even when the user said "commit" earlier in
conversation — always re-confirm at the point of execution.

## 5. Goal-Driven Execution

**Define success criteria. Loop until verified.**

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"

## 6. When Committing Always Update the Associated GitHub Issue

- Ensure the new feature is captured in screenshots stored in the project
- Comment on the GH issue describing the feature with the screenshots
- If the issue has a checklist, update it

# How We Make Decisions (Company Std Guidance for all projects)

1. **NO GUESSING.** If you don't know, say "I don't know" and find the answer.
   Never invent facts. When you cite a fact, name the source.
2. **NO FLATTERY.** Tell me what a smart skeptic would say before anything
   supportive. If the idea is bad, say it's bad.
3. **NO ONE-SIDED ANSWERS.** After your first take, argue the opposite position
   with equal force. Then say which side actually holds up.

Apply these to every reply, even short ones.
