import { useState } from 'react';

/**
 * The capture box is the whole product's front door. Everything here is in
 * service of "thought to saved" in under two seconds: no title field, no
 * folder picker, no category dropdown. Submit on Cmd/Ctrl+Enter.
 *
 * Wiring to the API lands with the capture endpoint — see the linked issue.
 */
export default function CapturePage() {
  const [body, setBody] = useState('');

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">What&apos;s on your mind?</h1>
      <p className="mb-4 text-sm text-neutral-500">
        Dump it here. We&apos;ll turn it into tasks and remind you.
      </p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Start typing&hellip;"
        rows={6}
        autoFocus
        className="w-full resize-none rounded-lg border border-neutral-300 p-4 text-base outline-none focus:border-neutral-900"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-neutral-400">{body.trim().length} characters</span>
        <button
          type="button"
          disabled={body.trim().length === 0}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Dump it
        </button>
      </div>
    </main>
  );
}
