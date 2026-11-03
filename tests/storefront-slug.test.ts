/**
 * Label: Simplified illustrative example
 */

import {
  storefrontSegmentIssue,
  storefrontSegmentMessage,
} from "../code-examples/03-storefront-slug.ts";

const pass = (name: string, actual: unknown, expected: unknown) => {
  if (actual !== expected) {
    throw new Error(`${name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
};

pass("accepts hyphenated slug", storefrontSegmentIssue("northwind-team"), null);
pass("flags space", storefrontSegmentIssue("north wind"), "space");
pass("flags reserved", storefrontSegmentIssue("general"), "reserved");
pass("flags leading hyphen", storefrontSegmentIssue("-north"), "invalid_hyphen");
pass(
  "message",
  storefrontSegmentMessage("underscore"),
  "Underscores are not allowed. Use a hyphen instead.",
);

console.log("storefront-slug tests passed");
