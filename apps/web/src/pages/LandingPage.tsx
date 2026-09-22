import { useEffect, useState } from 'react';
import RotatingPhrase from '../components/RotatingPhrase';

/**
 * The landing page's whole job is to show the transformation rather than
 * describe it. The competitor sells "a place to put thoughts"; a notes app
 * already does that for free. What we sell is what happens after — so the hero
 * animates a real scrawl resolving into dated tasks, and the section below it
 * shows the thing coming back days later.
 */

const DUMP =
  "ugh ok — need to call the dentist back before they close, mom's birthday is the 14th " +
  "and I still haven't got anything, that onboarding idea keeps nagging me (the part " +
  'where we skip the tour?), and I have to renew the car registration at some point';

type Extracted = { title: string; when: string | null; kind: 'task' | 'idea' };

const EXTRACTED: Extracted[] = [
  { title: 'Call the dentist back', when: 'Today, before 5pm', kind: 'task' },
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
        <p className="text-sm font-medium leading-snug">{item.title}</p>
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
            <p className="font-hand text-2xl leading-snug text-ink/75">{DUMP}</p>
          </div>

          <div className="relative my-4 flex items-center justify-center">
            <div className="h-px flex-1 bg-rule" />
            <span className="px-3 text-xs tracking-widest text-muted">SORTED</span>
            <div className="h-px flex-1 bg-rule" />
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

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-display text-4xl tracking-tight">Free is actually free.</h2>
      <p className="mt-3 max-w-lg leading-relaxed text-muted">
        Capture is never rationed and never will be — a tool you hesitate to use is a tool you
        stop using. You pay when you want us doing the work while you&apos;re not looking.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-rule bg-card p-7">
          <p className="font-display text-2xl">Free</p>
          <p className="mt-1 text-sm text-muted">Everything you need to stop losing things.</p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              'Unlimited dumps, forever',
              '30 AI sorts a month',
              'Reminders by push and email',
              'Search everything you ever wrote',
            ].map((f) => (
              <li key={f} className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-2xl border-2 border-clay bg-card p-7">
          <span className="absolute -top-3 left-7 rounded-full bg-clay px-3 py-1 text-xs font-medium text-paper">
            For the relentless
          </span>
          <p className="font-display text-2xl">Pro</p>
          <p className="mt-1 text-sm text-muted">When forgetting costs you something.</p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              'Unlimited AI sorts',
              'Text your thoughts in from anywhere',
              "It keeps asking until it's done",
              'Connect it to Claude and other AI tools',
            ].map((f) => (
              <li key={f} className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                {f}
              </li>
            ))}
          </ul>
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
