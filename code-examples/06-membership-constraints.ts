/**
 * Label: Simplified illustrative example
 *
 * Production uses Drizzle + PostgreSQL partial unique indexes and CHECKs so
 * these rules hold even if application code is wrong. This file shows the
 * SQL shape with generic names. It is not a schema dump.
 */

export const membershipConstraintSql = `
-- One platform party
CREATE UNIQUE INDEX party_one_platform_idx ON party (kind) WHERE kind = 'platform';

-- A business cannot hold two elevated capabilities at once
ALTER TABLE business_account
  ADD CONSTRAINT one_elevated_capability_check
  CHECK (NOT (manager_capability AND senior_capability));

-- One active membership per user
CREATE UNIQUE INDEX membership_one_active_per_user_idx
  ON business_membership (user_id)
  WHERE status = 'active';

-- One active primary and one active secondary per business
CREATE UNIQUE INDEX membership_one_active_primary_idx
  ON business_membership (business_account_id)
  WHERE status = 'active' AND designation = 'primary';

CREATE UNIQUE INDEX membership_one_active_secondary_idx
  ON business_membership (business_account_id)
  WHERE status = 'active' AND designation = 'secondary';

-- One pending secondary invitation per business
CREATE UNIQUE INDEX invitation_one_pending_per_business_idx
  ON business_invitation (business_account_id)
  WHERE status = 'pending';

-- Assignment periods cannot overlap (temporal upline)
-- EXCLUDE USING gist (business_account_id WITH =, period WITH &&)
`;
