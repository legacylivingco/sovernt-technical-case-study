/**
 * Label: Simplified illustrative example
 * Exercises code-examples/02-safe-next-path.ts with fictional paths.
 */

import { publicMfaError, safeNextPath, signInRoute } from "../code-examples/02-safe-next-path.ts";

const pass = (name: string, actual: unknown, expected: unknown) => {
  if (actual !== expected) {
    throw new Error(`${name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
};

pass("rejects protocol-relative", safeNextPath("//evil.example/phish"), "/account");
pass("rejects hash", safeNextPath("/account#token"), "/account");
pass("allows shop slug", safeNextPath("/shop/northwind-team"), "/shop/northwind-team");
pass("blocks query strings", safeNextPath("/shop/northwind-team?next=https://evil.example"), "/account");
pass(
  "mfa redirect uses allowlisted next",
  signInRoute({ failed: false, twoFactorRedirect: true, nextPath: "/admin" }),
  "/account/two-factor?next=%2Fadmin",
);
pass("strips totp material", publicMfaError("otpauth://totp/secret=ABC"), "That request was not accepted.");

console.log("safe-next-path tests passed");
