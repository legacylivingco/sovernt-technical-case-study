/**
 * Label: Simplified illustrative example
 */

import { canManageOrder, financialEditAllowed } from "../code-examples/07-order-edit-policy.ts";

const pass = (name: string, actual: unknown, expected: unknown) => {
  if (actual !== expected) {
    throw new Error(`${name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
};

pass(
  "lock after purchase",
  financialEditAllowed({
    lifecycle: "active",
    fulfillmentStatus: "not_fulfilled",
    purchaseRecorded: true,
  }),
  false,
);

pass(
  "customer manages own order",
  canManageOrder(
    { isAdmin: false, actorCustomerPartyId: "cust-1", actorBusinessAccountId: null },
    {
      purpose: "customer_purchase",
      customerPartyId: "cust-1",
      sellerBusinessAccountId: "seller-1",
      managerBusinessAccountId: "mgr-1",
      buyerBusinessAccountId: null,
      currentFulfillmentBusinessAccountId: "mgr-1",
    },
  ),
  true,
);

pass(
  "unrelated business cannot manage",
  canManageOrder(
    { isAdmin: false, actorCustomerPartyId: null, actorBusinessAccountId: "other" },
    {
      purpose: "customer_purchase",
      customerPartyId: "cust-1",
      sellerBusinessAccountId: "seller-1",
      managerBusinessAccountId: "mgr-1",
      buyerBusinessAccountId: null,
      currentFulfillmentBusinessAccountId: "mgr-1",
    },
  ),
  false,
);

console.log("order-edit-policy tests passed");
