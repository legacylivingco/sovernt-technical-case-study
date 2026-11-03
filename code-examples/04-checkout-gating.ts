/**
 * Label: Sanitized excerpt from the application
 *
 * Primary registration cannot complete unless a checkout URL was resolved
 * and the person confirmed they finished that step. The confirmation is not
 * stored and does not activate the account. Vendor URLs and prices omitted.
 */

export const checkoutUnavailableMessage =
  "Subscription checkout is temporarily unavailable. Registration cannot be completed until the checkout link is available.";

export const subscriptionUnconfirmedMessage =
  "Confirm that you have completed the subscription checkout.";

export function registrationCheckoutBlock(input: {
  checkoutUrl: string | null;
  confirmed: boolean;
}): string | null {
  if (!input.checkoutUrl) return checkoutUnavailableMessage;
  if (!input.confirmed) return subscriptionUnconfirmedMessage;
  return null;
}

/** Rejects non-HTTPS links and URLs that embed credentials. */
export function resolvedCheckoutUrl(candidate: string | undefined): string | null {
  if (!candidate) return null;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  if (parsed.username || parsed.password) return null;
  return parsed.toString();
}
