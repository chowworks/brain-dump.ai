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
- **Sendblue is NOT disqualified — that call was based on a wrong assumption.**
  It was ruled out at $100/line/month on the assumption that lines scale with
  users. Under an inbound-only design where one shared number serves everyone via
  caller-ID routing, $100/month is flat. Their "AI Agent" plan is inbound-first,
  which is a limitation for sales teams and exactly what we want. See the
  messaging vendor entry under Open decisions.
- **Transform cost is dominated by model choice, not by the quota.** Haiku 4.5
  ≈ $0.003/transform vs Opus 5 ≈ $0.020 — 6.5x for the same structured
  extraction job. Pin the transform to Haiku and keep the model a config value.
  `Transform.model` exists so this can be measured per model.
- **Anything that runs on a schedule costs money per user whether they engage or
  not.** Scheduled work must be gated on tier AND recent activity AND capped
  input, and must use the Batch API (50% off, no latency requirement).
- **A2P 10DLC is mandatory for any traffic that touches carrier SMS, and is
  provider-independent.** US carriers have blocked 100% of unregistered 10DLC
  traffic since Feb 2025 (The Campaign Registry). ~5–7 business days to approve;
  registering EIN must be ≥15 days old. It gates any carrier-SMS launch date.
  Native iMessage does *not* need it — but an iMessage provider's RCS/SMS
  fallback leg runs on our registration, so a fallback chain does not avoid it,
  it only narrows it to the Android slice.
- **Never route reminders through the iMessage vendor.** This is a contract
  constraint, not a preference. Sendblue's ~$100/month AI Agent plan is
  *inbound-first*; proactive outbound moves you to their unpriced "Blue Ocean"
  plan, quoted by sales. A reply inside a conversation the user just started
  ("got it, saved") is fine — a reminder three days later is proactive by
  definition and is exactly what the cheap plan excludes. So a ticket that says
  "send reminders over iMessage, it's nicer" is a vendor contract change wearing
  a feature's clothes, and it goes to the founder, never into a sprint. Reminders
  ride push + email.
- **Outbound is the volume multiplier, not inbound.** Reminders run ~100
  messages/user/month; capture runs ~30 dumps/user/month and only from paying
  users. So outbound is where per-message pricing compounds and must stay on
  push + email (~$0 marginal, no ceiling, every device). Inbound is low enough
  volume that a flat-rate messaging vendor can make sense. Treat iMessage as a
  *capture* channel, not a delivery channel.

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
- **Name.** `getbraindump.com` already ships "Brain Dump: AI Notes & Writing".
  We are building a website, not a mobile app, so store confusion is not the
  mechanism — the exposure is (a) SEO, since their App Store page ranks in Google
  for our brand terms, and (b) trademark, since Class 42 covers SaaS and websites
  regardless of how we distribute. "Brain dump" is descriptive and therefore a
  weak mark. `mind-dump` is the fallback. Needs a USPTO TESS search in classes 9
  and 42 — unresolved.
- **Messaging vendor.** Linq does iMessage + RCS + SMS fallback through one API.
  Hobby is $0/mo but capped at **20 contacts** — a development tier, good for
  building and testing the integration at no cost, not something users can be
  served on. Pro is "Starting at $289/mo", and "starting at" is doing real work
  in that sentence: a genuinely volume-independent plan would say unlimited, and
  iMessage throughput is capped by Apple's per-account rate limits, which is a
  physical ceiling rather than a commercial one. Unresolved: whether $289 is per
  line or per account, what volume it covers, the overage rate, and whether
  inbound-only avoids 10DLC. Evaluate in their free sandbox before committing.
  Decision for now: **build against Hobby, keep outbound on push + email.**

  Sendblue is back in contention on the same inbound-only logic: its AI Agent
  plan is ~$100/month with a dedicated number, iMessage + RCS + SMS fallback,
  an MCP server, and SOC 2 — cheaper than Linq Pro if the number is shared.
  **The deciding figure is its "up to 1,000 inbound contacts/day" cap:** if that
  counts distinct contacts rather than messages, it is a hard ceiling on daily
  active senders and breaks well before 10k users. Nobody has confirmed which.

  **Treat vendor comparison tables as marketing, not data.** Sendblue's own
  comparison page states Linq is "~$250/mo with $1,000+ setup and contact-sales
  for a free tier"; Linq's actual pricing page shows $289/mo with a $0 Hobby tier
  and no credit card required. A vendor that is wrong about the one competitor we
  can verify is not a source for the ones we cannot. Confirm every number in a
  free sandbox or directly with the vendor before it enters this file.

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

# How we work

The company-wide development and decision standards are deliberately NOT applied
to this project — we are running it through agents instead. Three rules survive,
and they exist so a bad change can be found and undone:

1. **Every feature has a GitHub Issue.** Backlog lives in Issues, never a file.
2. **Every UI feature closes with screenshots** committed to the repo and linked
   from its issue by commit SHA (see above).
3. **One commit per feature**, referencing its issue (`Closes #N` / `Refs #N`).
   Commits stay feature-sized specifically so a single feature can be reverted
   without unpicking unrelated work.

Commits do not need approval before landing.
