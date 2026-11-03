/**
 * Label: Simplified illustrative example
 */

import {
  registrationCheckoutBlock,
  resolvedCheckoutUrl,
  subscriptionUnconfirmedMessage,
} from "../code-examples/04-checkout-gating.ts";

const pass = (name: string, actual: unknown, expected: unknown) => {
  if (actual !== expected) {
    throw new Error(`${name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
};

pass("rejects http", resolvedCheckoutUrl("http://pay.example/checkout"), null);
pass("rejects credentials in url", resolvedCheckoutUrl("https://user:pass@pay.example/checkout"), null);
pass("accepts https", Boolean(resolvedCheckoutUrl("https://pay.example/checkout")), true);
pass(
  "requires confirmation",
  registrationCheckoutBlock({ checkoutUrl: "https://pay.example/checkout", confirmed: false }),
  subscriptionUnconfirmedMessage,
);
pass(
  "ready",
  registrationCheckoutBlock({ checkoutUrl: "https://pay.example/checkout", confirmed: true }),
  null,
);

console.log("checkout-gating tests passed");
