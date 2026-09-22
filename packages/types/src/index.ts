/**
 * Shared domain types for brain-dump.
 *
 * The centre of gravity here is the *outbound loop*: a Dump is only worth
 * capturing if something later drags the user back to it. Reminder is
 * therefore a first-class entity, not a field on Task.
 */

/** Billing tiers. Free is deliberately generous on capture, metered on transform. */
export type Tier = 'FREE' | 'PRO';

/** Where a raw capture came from. SMS is PRO-only; the rest cost us ~nothing. */
export type CaptureSource = 'WEB' | 'PWA_SHARE' | 'EMAIL' | 'SMS' | 'VOICE';

/** Channels we can nag a user through. PUSH and EMAIL are free-tier viable. */
export type ReminderChannel = 'PUSH' | 'EMAIL' | 'SMS';

export type TransformStatus = 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED';

export type TaskStatus = 'OPEN' | 'DONE' | 'DISMISSED';

export type ReminderStatus = 'SCHEDULED' | 'SENT' | 'ACKED' | 'CANCELLED' | 'FAILED';

export interface User {
  id: string;
  clerkId: string;
  email: string;
  tier: Tier;
  /** IANA zone, e.g. 'America/New_York'. Required to schedule reminders sanely. */
  timezone: string;
  /**
   * The user's OWN phone number, E.164 — NOT a number we rent for them.
   * Inbound SMS/iMessage carries the sender's caller ID, so one shared number
   * serves every user and this is how we recognize who texted. Null until the
   * user opts into text capture.
   */
  phoneNumber: string | null;
  /**
   * Set once the user has proved they control `phoneNumber` via a one-time
   * code. Inbound routing MUST ignore an unverified number — otherwise anyone
   * who claims someone else's number receives that person's dumps.
   */
  phoneVerifiedAt: Date | null;
  createdAt: Date;
}

/** A raw, unprocessed thought. Never mutated after capture — the transform is separate. */
export interface Dump {
  id: string;
  userId: string;
  body: string;
  source: CaptureSource;
  capturedAt: Date;
}

/** One AI pass over a Dump. Metered: this is the unit the FREE tier caps. */
export interface Transform {
  id: string;
  dumpId: string;
  status: TransformStatus;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  error: string | null;
  completedAt: Date | null;
}

export interface Task {
  id: string;
  dumpId: string;
  userId: string;
  title: string;
  /** Null means "no date inferred" — we do not invent due dates. */
  dueAt: Date | null;
  status: TaskStatus;
  createdAt: Date;
}

/** The moat. Self-texting cannot do this. */
export interface Reminder {
  id: string;
  userId: string;
  /** A reminder always points at something — a Task, or the Dump itself. */
  taskId: string | null;
  dumpId: string | null;
  channel: ReminderChannel;
  scheduledFor: Date;
  sentAt: Date | null;
  status: ReminderStatus;
}

export interface Tag {
  id: string;
  userId: string;
  /** Stored without the leading '#'. */
  name: string;
}

/** A cross-dump observation, e.g. "you've mentioned quitting your job 6 times". */
export interface Insight {
  id: string;
  userId: string;
  body: string;
  /** Dumps this insight was drawn from. */
  sourceDumpIds: string[];
  createdAt: Date;
}

/**
 * Per-tier limits. Single source of truth — the API and the pricing page both
 * read this.
 *
 * The AI splits three ways, and they are priced differently on purpose:
 *
 * - **Extraction** (`transformsPerMonth`) turns one dump into tasks, dates and
 *   tags. One bounded model call, ~$0.003 on Haiku. Metered but free, because a
 *   user who has never watched their own mess become a list is being asked to
 *   pay for a promise they have not seen work.
 * - **Reasoning** (`aiReasoning`) is cross-dump: patterns, insights, the weekly
 *   digest. It runs on a schedule, so it costs per user whether they engage or
 *   not. PRO.
 * - **Execution** (`taskExecution`) is the AI doing the task rather than filing
 *   it — a research question answered, not a reminder to go research it. Cost is
 *   unbounded per run, so it does not belong on a per-transform meter at all.
 *   PRO, and see #14 for the metering that still needs designing.
 */
export interface TierLimits {
  /** Null = unlimited. Capture is never the thing we ration. */
  dumpsPerMonth: number | null;
  /** Extraction only. The taste of the product, and the conversion moment. */
  transformsPerMonth: number | null;
  /** Cross-dump reasoning: insights, patterns, the scheduled digest. */
  aiReasoning: boolean;
  /** Agentic execution — the AI completes the task. Needs its own meter (#14). */
  taskExecution: boolean;
  channels: ReminderChannel[];
  mcpConnectors: boolean;
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  FREE: {
    dumpsPerMonth: null,
    transformsPerMonth: 30,
    aiReasoning: false,
    taskExecution: false,
    channels: ['PUSH', 'EMAIL'],
    mcpConnectors: false,
  },
  PRO: {
    dumpsPerMonth: null,
    transformsPerMonth: null,
    aiReasoning: true,
    taskExecution: true,
    channels: ['PUSH', 'EMAIL', 'SMS'],
    mcpConnectors: true,
  },
};
