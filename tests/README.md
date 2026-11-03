# Tests

These scripts exercise the sanitized examples with fictional data. They are not the production Vitest suite and they do not connect to a database.

Run from this workspace (Node 22+):

```
node --experimental-strip-types tests/safe-next-path.test.ts
node --experimental-strip-types tests/storefront-slug.test.ts
node --experimental-strip-types tests/checkout-gating.test.ts
node --experimental-strip-types tests/order-edit-policy.test.ts
```
