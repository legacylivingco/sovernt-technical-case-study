# Authorization design

**Label:** Simplified illustrative example. Role names match the product; implementation details that would help attack the live app are omitted.

## Session is not permission

`getActor()` returns `{ userId, sessionId }` from the Better Auth cookie. It does not decide whether the user may administer, fulfill, or invite. Those decisions load memberships, customer profile, Admin membership, and MFA state from the database (`loadActorContext`).

Client-supplied user ids are not accepted as the actor.

## Fail-closed helpers

| Helper | Passes when |
| --- | --- |
| `requireUser` | A session user exists |
| `requireVerifiedEmail` | Email is verified |
| `requireBusinessMember` | Active membership in that Business Account (inactive org still readable) |
| `requireBusinessOperation` | Membership **and** organizational status is active |
| `requireManager` | Operational membership **and** manager capability (Manager) |
| `requireCustomerSelf` | Customer profile matches the requested user/party |
| `requireAdmin` | Active Admin membership, verified email, TOTP enrolled, **this session** MFA-verified |
| `requireCurrentUpline` | Manager may act only on businesses currently assigned to them |

Typed `AuthorizationError` codes map to user-facing notices. UI hiding is presentation only.

## Admin read vs mutate

Admin layouts and list pages use a read helper that does **not** take `FOR UPDATE` row locks (avoids deadlocks under Next.js parallel rendering). Mutations lock the user, session, and Admin membership inside a transaction, then re-check Admin.

A source-level test asserts that named read functions call the read helper and named write functions call the locking helper.

## Primary and secondary owners

Designation is a label. Permissions are equal. Partial unique indexes enforce:

- One active membership per user
- One active primary per Business Account
- One active secondary per Business Account
