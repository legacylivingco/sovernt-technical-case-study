/**
 * Label: Simplified illustrative example
 *
 * Production onboarding takes a client UUID, locks the transaction with a
 * Postgres advisory lock, inserts a unique completion row, and replays the
 * original ids when the payload matches. A mismatched retry is a conflict.
 * Upline, pricing, and live tokens are omitted.
 */

export type OnboardingPayload = {
  idempotencyKey: string;
  slug: string;
  displayName: string;
};

export type CompletionRecord = OnboardingPayload & {
  businessAccountId: string;
};

export type CompleteResult =
  | { replayed: false; businessAccountId: string }
  | { replayed: true; businessAccountId: string };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class OnboardingError extends Error {
  readonly code: "idempotency_required" | "idempotency_conflict";
  constructor(code: "idempotency_required" | "idempotency_conflict") {
    super(code);
    this.code = code;
  }
}

export function assertIdempotencyKey(value: string): string {
  const key = value.trim();
  if (!key) throw new OnboardingError("idempotency_required");
  if (!uuidPattern.test(key)) throw new OnboardingError("idempotency_conflict");
  return key;
}

export function replayOrInsert(
  existing: CompletionRecord | undefined,
  request: OnboardingPayload,
  create: () => CompletionRecord,
): CompleteResult {
  if (!existing) {
    const created = create();
    return { replayed: false, businessAccountId: created.businessAccountId };
  }
  if (existing.slug !== request.slug || existing.displayName !== request.displayName) {
    throw new OnboardingError("idempotency_conflict");
  }
  return { replayed: true, businessAccountId: existing.businessAccountId };
}
