/**
 * Label: Simplified illustrative example
 *
 * Teaches the production idea: a session user is identity only.
 * Authorization is loaded from memberships and then checked with
 * fail-closed helpers. This file is not Production source.
 */

export type Actor = {
  userId: string;
  sessionId: string;
};

export type ActorContext = {
  userId: string;
  emailVerified: boolean;
  business: {
    businessAccountId: string;
    designation: "primary" | "secondary";
    managerCapability: boolean;
    organizationalStatus: "active" | "inactive";
  } | null;
  customer: { partyId: string } | null;
  admin: { membershipId: string } | null;
  mfa: { enrolled: boolean; sessionVerified: boolean };
};

export type AuthorizationCode =
  | "unauthenticated"
  | "email_unverified"
  | "business_membership_required"
  | "business_inactive"
  | "admin_unavailable"
  | "mfa_enrollment_required"
  | "mfa_verification_required";

export class AuthorizationError extends Error {
  readonly code: AuthorizationCode;
  constructor(code: AuthorizationCode, message: string) {
    super(message);
    this.name = "AuthorizationError";
    this.code = code;
  }
}

/** Session lookup would go here. It does not decide permissions. */
export function requireUser(context: ActorContext | null): ActorContext {
  if (!context?.userId) {
    throw new AuthorizationError("unauthenticated", "Sign in is required.");
  }
  return context;
}

/**
 * Historical reads may use an inactive business.
 * New orders, invites, and fulfillment writes must use requireBusinessOperation.
 * Primary and secondary designations are equal.
 */
export function requireBusinessMember(
  context: ActorContext | null,
  businessAccountId: string,
): ActorContext {
  const actor = requireUser(context);
  if (!actor.business || actor.business.businessAccountId !== businessAccountId) {
    throw new AuthorizationError(
      "business_membership_required",
      "An active membership in this Business Account is required.",
    );
  }
  return actor;
}

export function requireBusinessOperation(
  context: ActorContext | null,
  businessAccountId: string,
): ActorContext {
  const member = requireBusinessMember(context, businessAccountId);
  if (member.business?.organizationalStatus !== "active") {
    throw new AuthorizationError(
      "business_inactive",
      "This Business Account is inactive, so operational actions are unavailable.",
    );
  }
  return member;
}

/**
 * Admin is a separate membership. Enrollment is not enough:
 * this session must have completed TOTP or a backup code.
 */
export function requireAdmin(context: ActorContext | null): ActorContext {
  const actor = requireUser(context);
  if (!actor.admin) {
    throw new AuthorizationError("admin_unavailable", "An active Admin membership is required.");
  }
  if (!actor.emailVerified) {
    throw new AuthorizationError("email_unverified", "A verified email address is required.");
  }
  if (!actor.mfa.enrolled) {
    throw new AuthorizationError("mfa_enrollment_required", "Admin access requires TOTP enrollment.");
  }
  if (!actor.mfa.sessionVerified) {
    throw new AuthorizationError(
      "mfa_verification_required",
      "Admin access requires MFA verification for this session.",
    );
  }
  return actor;
}
