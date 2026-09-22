import { useEffect, useState } from 'react';

/**
 * A phrase in the headline that swaps itself out on a timer.
 *
 * Two deliberate departures from the competitor version that inspired it:
 *
 * 1. It rotates the *return* — "we'll bring it back <when>" — not the thing you
 *    captured. Rotating nouns ("ideas", "notes", "memories") sells the notebook;
 *    rotating the moment it comes back sells the one thing a plain notes app
 *    cannot do.
 * 2. It changes every 3.2s, not every second, and holds still entirely under
 *    prefers-reduced-motion. A word flickering once a second is a distraction
 *    magnet — a bad thing to put in front of an audience whose stated problem is
 *    that their attention gets grabbed.
 */
export default function RotatingPhrase({ phrases }: { phrases: string[] }) {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const swap = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setI((n) => (n + 1) % phrases.length);
        setVisible(true);
      }, 280);
    }, 3200);
    return () => clearInterval(swap);
  }, [phrases.length]);

  // Reserve the widest phrase's width so the headline never reflows mid-swap.
  const widest = phrases.reduce((a, b) => (b.length > a.length ? b : a), '');

  return (
    <span className="relative inline-block">
      <span aria-hidden className="invisible whitespace-nowrap">
        {widest}
      </span>
      <span
        aria-live="polite"
        className={`absolute inset-0 whitespace-nowrap transition-all duration-300 ${
          visible ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
        }`}
      >
        {phrases[i]}
      </span>
      {/* Hand-drawn underline, deliberately not a straight rule — it belongs to
          the same hand that wrote the scrawl in the panel beside it. */}
      <svg
        aria-hidden
        viewBox="0 0 200 8"
        preserveAspectRatio="none"
        className="absolute -bottom-2 left-0 h-2.5 w-full text-clay/40"
      >
        <path
          d="M2 5.5C38 2.2 74 1.6 110 3.2c30 1.3 58 2.6 88 1.1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
