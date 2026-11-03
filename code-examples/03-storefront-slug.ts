/**
 * Label: Sanitized excerpt from the application
 *
 * Client-side classification of a storefront URL segment. The database unique
 * constraint and format check remain the authority on submit. Production
 * hostname replaced with a fictional prefix.
 */

export const storefrontLinkPrefix = "https://shop.example.com/shop/";

const canonicalStorefrontSegment = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type StorefrontSegmentIssue =
  | "space"
  | "underscore"
  | "invalid_character"
  | "too_short"
  | "too_long"
  | "reserved"
  | "invalid_hyphen";

export function normalizeStorefrontSegment(value: string): string {
  return value.trim().toLowerCase();
}

export function storefrontSegmentIssue(value: string): StorefrontSegmentIssue | null {
  const trimmed = value.toLowerCase().trim();
  if (!trimmed) return null;
  if (/\s/.test(trimmed)) return "space";
  if (trimmed.includes("_")) return "underscore";
  if (/[^a-z0-9-]/.test(trimmed)) return "invalid_character";
  if (trimmed.length > 48) return "too_long";
  if (trimmed === "general") return "reserved";
  if (trimmed.length < 3) return "too_short";
  if (!canonicalStorefrontSegment.test(trimmed)) return "invalid_hyphen";
  return null;
}

export function storefrontSegmentMessage(issue: StorefrontSegmentIssue): string {
  switch (issue) {
    case "space":
      return "Spaces are not allowed. Use lowercase letters, numbers, and hyphens.";
    case "underscore":
      return "Underscores are not allowed. Use a hyphen instead.";
    case "invalid_character":
      return "Use only lowercase letters, numbers, and hyphens.";
    case "too_short":
      return "Use at least 3 characters.";
    case "too_long":
      return "Use 48 characters or fewer.";
    case "reserved":
      return "That storefront link is reserved.";
    case "invalid_hyphen":
      return "Use a single hyphen between letters or numbers, not at the start or end.";
  }
}
