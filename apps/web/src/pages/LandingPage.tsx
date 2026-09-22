import { useEffect, useState } from 'react';
import RotatingPhrase from '../components/RotatingPhrase';

/**
 * The landing page's whole job is to show the transformation rather than
 * describe it. The competitor sells "a place to put thoughts"; a notes app
 * already does that for free. What we sell is what happens after — so the hero
 * animates a real scrawl resolving into dated tasks, and the section below it
 * shows the thing coming back days later.
 */

const DUMP_BEFORE = 'ugh ok — need to ';
const DUMP_TRACED = 'call the dentist back before they close';
const DUMP_AFTER =
  ", mom's birthday is the 14th and I still haven't got anything, that onboarding idea " +
  'keeps nagging me (the part where we skip the tour?), and I have to renew the car ' +
  'registration at some point';

type Extracted = { title: string; when: string | null; kind: 'task' | 'idea'; traced?: boolean };

const EXTRACTED: Extracted[] = [
  { title: 'Call the dentist back', when: 'Today, before 5pm', kind: 'task', traced: true },
  { title: "Get mom's birthday gift", when: 'Thu 14th', kind: 'task' },
  { title: 'Onboarding: skip the tour?', when: null, kind: 'idea' },
  { title: 'Renew car registration', when: 'No date found', kind: 'task' },
];

function useStaggered(count: number, startAfter: number, gap: number) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const timers = Array.from({ length: count }, (_, i) =>
      setTimeout(() => setShown((n) => Math.max(n, i + 1)), startAfter + i * gap),
    );
    return () => timers.forEach(clearTimeout);
  }, [count, startAfter, gap]);
  return shown;
}

function Nav() {
  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <a href="/" className="font-display text-2xl tracking-tight">
        mind<span className="text-clay">-</span>dump
      </a>
      <div className="flex items-center gap-6 text-sm">
        <a href="#pricing" className="text-muted transition-colors hover:text-ink">
          Pricing
        </a>
        <a
          href="/capture"
          className="rounded-full bg-ink px-4 py-2 font-medium text-paper transition-transform hover:-translate-y-px"
        >
          Start dumping
        </a>
      </div>
    </nav>
  );
}

function TaskRow({ item, visible }: { item: Extracted; visible: boolean }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-rule bg-card p-3 transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <span
        className={`mt-1 h-4 w-4 shrink-0 rounded border-2 ${
          item.kind === 'idea' ? 'rounded-full border-sage' : 'border-clay'
        }`}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium leading-snug">
          <span className={item.traced ? 'rounded bg-claySoft px-1' : undefined}>{item.title}</span>
        </p>
        {item.when && (
          <p className={`text-xs ${item.when.startsWith('No') ? 'text-muted' : 'text-clay'}`}>
            {item.when}
          </p>
        )}
      </div>
    </div>
  );
}

function Hero() {
  const shown = useStaggered(EXTRACTED.length, 900, 260);

  return (
    <header className="mx-auto max-w-6xl px-6 pb-20 pt-10 md:pt-16">
      <div className="grid items-center gap-14 md:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="mb-5 inline-block rounded-full bg-claySoft px-3 py-1 text-xs font-medium tracking-wide text-clay">
            An ADHD tool, built by someone who needs it
          </p>
          <h1 className="font-display text-5xl leading-[1.15] tracking-tight md:text-6xl">
            Get it out of your head.
            <br />
            <span className="italic text-clay">
              We&apos;ll bring it back{' '}
              <RotatingPhrase
                phrases={[
                  'on Thursday morning.',
                  'right before dinner.',
                  'when you can act on it.',
                  'the moment it matters.',
                  'once the AI has finished it.',
                ]}
              />
            </span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            Dump the whole tangled mess in one go — no title, no folder, no tidying up.
            It comes back to you as things you can actually do, on the day you can do them.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="/capture"
              className="rounded-full bg-clay px-6 py-3 font-medium text-paper transition-transform hover:-translate-y-px"
            >
              Dump something now
            </a>
            <span className="text-sm text-muted">Free, no card, no setup.</span>
          </div>
        </div>

        <div className="relative">
          {/* Before: the scrawl. */}
          <div className="-rotate-1 rounded-xl border border-rule bg-card p-5 shadow-sm">
            <p className="mb-2 text-[11px] uppercase tracking-widest text-muted">11:48pm</p>
            <p className="font-hand text-2xl leading-snug text-ink/75">
              {DUMP_BEFORE}
              <span className="relative whitespace-nowrap rounded bg-claySoft px-1 text-ink">
                {DUMP_TRACED}
              </span>
              {DUMP_AFTER}
            </p>
          </div>

          <div className="relative my-3 h-12">
            <svg
              aria-hidden
              viewBox="0 0 400 48"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full text-clay/55"
            >
              <path
                d="M236 2 C236 22, 214 24, 214 44"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="4 5"
              />
              <path
                d="M209 38 L214 45 L219 38"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs tracking-widest text-muted">
              MADE USABLE
            </span>
          </div>

          {/* After: the same thing, usable. */}
          <div className="space-y-2">
            {EXTRACTED.map((item, i) => (
              <TaskRow key={item.title} item={item} visible={i < shown} />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function TheLoop() {
  return (
    <section className="border-y border-rule bg-card/60 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div>
            <h2 className="font-display text-4xl leading-tight tracking-tight">
              Anyone can text themselves a note.
            </h2>
            <p className="mt-5 max-w-sm leading-relaxed text-muted">
              Nothing you do for free will come back three days later and ask about it. That&apos;s
              the part that actually changes anything — and it&apos;s the part we built first.
            </p>
          </div>

          {/* A reminder landing on a phone, three days after the dump. */}
          <div className="mx-auto w-full max-w-sm rounded-2xl border border-rule bg-paper p-4 shadow-sm">
            <p className="mb-3 text-center text-xs tracking-widest text-muted">THURSDAY, 9:02 AM</p>
            <div className="rounded-xl border border-rule bg-card p-4">
              <p className="text-xs font-semibold tracking-wide text-clay">mind-dump</p>
              <p className="mt-1 text-sm leading-snug">
                Mom&apos;s birthday is today. You wrote this down eleven days ago at 11:48pm —
                want the gift ideas you had then?
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-lg bg-ink py-2 text-xs font-medium text-paper">
                Show me
              </button>
              <button className="flex-1 rounded-lg border border-rule py-2 text-xs font-medium text-muted">
                Later today
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FounderNote() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <div className="rounded-2xl border border-rule bg-card p-8 md:p-10">
        <p className="mb-5 text-xs uppercase tracking-widest text-muted">Why this exists</p>
        <blockquote className="font-display text-2xl leading-snug md:text-3xl">
          &ldquo;I have ADHD. Right now I have a million tabs open, every one of them an idea
          I&rsquo;m probably never coming back to.
          <span className="mt-4 block">
            So I built an app that comes back to{' '}
            <span className="italic text-clay">me</span>, keeps{' '}
            <span className="italic text-clay">me</span> organized, and works with{' '}
            <span className="italic text-clay">me</span>.&rdquo;
          </span>
        </blockquote>
        <p className="mt-6 text-sm text-muted">Building this in the open, one tab at a time.</p>
      </div>
    </section>
  );
}

type Feature = { label: string; note?: string };

function FeatureList({ items, dot }: { items: Feature[]; dot: string }) {
  return (
    <ul className="mt-6 space-y-3.5 text-sm">
      {items.map((f) => (
        <li key={f.label} className="flex gap-2.5">
          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
          <span>
            {f.label}
            {f.note && <span className="mt-0.5 block text-xs text-muted">{f.note}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

const FREE: Feature[] = [
  { label: 'Unlimited dumps, forever', note: 'We never ration capture. Not now, not later.' },
  {
    label: 'We untangle every one of them',
    note: 'Typos tidied, tasks pulled out, dates found, tags added, reminders set. No allowance, no counter.',
  },
  { label: 'Reminders by push and email', note: 'The loop, in full. Not a trial of it.' },
  { label: 'Search everything you ever wrote', note: 'Including the half-finished ones you never came back to.' },
];

const PRO: Feature[] = [
  {
    label: 'It thinks about your dumps, not just this one',
    note: 'Spots what you keep circling back to and tells you.',
  },
  {
    label: 'It does the task, not just the reminding',
    note: '"Find out if we need a permit" comes back as the answer.',
  },
  { label: 'Text your thoughts in from anywhere', note: 'No app, no login. Just text it.' },
  { label: 'It keeps asking until it is done', note: 'The nag that escalates instead of giving up.' },
  { label: 'Connect it to Claude and other AI tools' },
];

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-display text-4xl tracking-tight">Free is actually free.</h2>
      <p className="mt-3 max-w-xl leading-relaxed text-muted">
        Free gets the whole loop — dump it, we untangle it, it comes back. You pay when you want it
        working while you are not: thinking across everything you have written, and going off and
        doing the thing instead of reminding you to.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-rule bg-card p-7">
          <p className="font-display text-2xl">Free</p>
          <p className="mt-1 text-sm text-muted">Everything you need to stop losing things.</p>
          <FeatureList items={FREE} dot="bg-sage" />
          <p className="mt-6 border-t border-rule pt-4 text-xs leading-relaxed text-muted">
            The AI untangles your dump — cleans it up, pulls out the tasks, finds the dates, tags
            it. It does not go and <em>do</em> any of it, and it does not reason across everything
            you have ever written. Those are Pro.
          </p>
        </div>

        <div className="relative rounded-2xl border-2 border-clay bg-card p-7">
          <span className="absolute -top-3 left-7 rounded-full bg-clay px-3 py-1 text-xs font-medium text-paper">
            For the relentless
          </span>
          <p className="font-display text-2xl">Pro</p>
          <p className="mt-1 text-sm text-muted">
            Everything in Free, plus the AI working while you are not.
          </p>
          <FeatureList items={PRO} dot="bg-clay" />
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper font-sans text-ink antialiased">
      <Nav />
      <Hero />
      <TheLoop />
      <FounderNote />
      <Pricing />
      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <span className="font-display text-lg text-ink">
            mind<span className="text-clay">-</span>dump
          </span>
          <span>Built in the open. Slowly, then all at once.</span>
        </div>
      </footer>
    </div>
  );
}
