/**
 * Label: Simplified illustrative example
 *
 * Production uses file reads as architecture tests: domain must not import
 * email/payment SDKs, and Admin list functions must not take row locks.
 * This sample shows the idea with in-memory source strings.
 */

export function domainImportsProviderSdk(source: string): boolean {
  return /from\s+["'](resend|@vendor\/payments)["']/.test(source);
}

export function adminReadUsesRowLock(source: string): boolean {
  return /for update/i.test(source);
}

export function adminReadHelper(source: string): boolean {
  return source.includes("requireReadAdmin") && !source.includes("requireCurrentAdmin");
}
