/**
 * Label: Sanitized excerpt from the application
 *
 * After password sign-in, the app may resume a path. Anything that looks like
 * an open redirect returns to /account. Error text must never echo TOTP setup
 * material. Hostnames and product-specific query strings are generalized.
 */

const fixedPaths = ["/account", "/account/security", "/admin", "/orders", "/shop"] as const;

const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const storefrontPath = /^\/shop\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
const orderPath = new RegExp(`^/orders/${uuid}$`, "i");
const invitePath = /^\/onboarding\/[A-Za-z0-9_-]{32,128}$/;

export function safeNextPath(value: string | undefined | null): string {
  if (!value || value.includes("#") || value.includes("\\") || value.includes("//")) {
    return "/account";
  }
  if (value.includes("?")) {
    return "/account";
  }
  if ((fixedPaths as readonly string[]).includes(value)) return value;
  if (storefrontPath.test(value) || orderPath.test(value) || invitePath.test(value)) {
    return value;
  }
  return "/account";
}

export function signInRoute(input: {
  failed: boolean;
  twoFactorRedirect: boolean;
  nextPath: string | undefined | null;
}): string | null {
  if (input.failed) return null;
  const next = safeNextPath(input.nextPath);
  if (input.twoFactorRedirect) return `/account/two-factor?next=${encodeURIComponent(next)}`;
  return next;
}

/** Error text shown to a person. Setup material is never copied into it. */
export function publicMfaError(message: string | undefined): string {
  const text = message?.trim() || "That request was not accepted.";
  if (/otpauth:|secret=/i.test(text)) return "That request was not accepted.";
  return text;
}
