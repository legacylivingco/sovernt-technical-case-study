/**
 * Label: Simplified illustrative example
 *
 * Production plans a graph of whole-amount payment hops from an order
 * snapshot. Amounts, commission rates, and supplier cost are omitted.
 * Paid rows are never rewritten: unmatched unpaid hops are voided and a
 * new row is inserted. Refunds reverse payer and payee.
 */

export type PartyKind = "customer" | "business_account" | "platform";

export type PartyRef = { id: string; kind: PartyKind };

export type Hop = "buyer_payment" | "owner_upstream" | "manager_upstream" | "optional_commission";

export type Purpose = "order_payment" | "additional_payment" | "refund" | "commission";

export type HopStatus = "unpaid" | "paid" | "voided" | "awaiting_fulfillment";

export type PlannedHop = {
  hop: Hop;
  purpose: "order_payment" | "commission";
  payer: PartyRef;
  payee: PartyRef;
  payableOn: "submission" | "fulfillment";
};

export type OrderParties = {
  channel: "public_catalog" | "affiliate" | "manager";
  customer: PartyRef | null;
  storefrontOwner: PartyRef | null;
  manager: PartyRef | null;
  platform: PartyRef;
  hasOptionalCommission: boolean;
};

export function planSubmissionHops(order: OrderParties): PlannedHop[] {
  const planned: PlannedHop[] = [];

  if (order.channel === "public_catalog") {
    if (!order.customer) throw new Error("A public-catalog order needs the customer party.");
    planned.push({
      hop: "buyer_payment",
      purpose: "order_payment",
      payer: order.customer,
      payee: order.platform,
      payableOn: "submission",
    });
    return planned;
  }

  const owner = order.storefrontOwner;
  if (!owner) throw new Error("This order needs the snapshotted storefront owner.");
  const upstreamPayee = order.manager ?? order.platform;

  if (order.customer) {
    planned.push({
      hop: "buyer_payment",
      purpose: "order_payment",
      payer: order.customer,
      payee: owner,
      payableOn: "submission",
    });
  }

  if (order.channel === "affiliate") {
    planned.push({
      hop: "owner_upstream",
      purpose: "order_payment",
      payer: owner,
      payee: upstreamPayee,
      payableOn: "submission",
    });
    if (order.manager) {
      planned.push({
        hop: "manager_upstream",
        purpose: "order_payment",
        payer: order.manager,
        payee: order.platform,
        payableOn: "submission",
      });
    }
  } else {
    planned.push({
      hop: "manager_upstream",
      purpose: "order_payment",
      payer: owner,
      payee: order.platform,
      payableOn: "submission",
    });
  }

  if (order.hasOptionalCommission && order.manager) {
    planned.push({
      hop: "optional_commission",
      purpose: "commission",
      payer: order.platform,
      payee: order.manager,
      payableOn: "fulfillment",
    });
  }

  return planned;
}

export type StoredHop = {
  id: string;
  hop: Hop;
  purpose: Purpose;
  payer: PartyRef;
  payee: PartyRef;
  status: HopStatus;
};

export type Adjustment =
  | { action: "void"; obligationId: string }
  | { action: "insert"; hop: Hop; purpose: Purpose; payer: PartyRef; payee: PartyRef };

/**
 * Cancel: void unpaid hops. Paid hops get a refund insert with parties swapped.
 * Amounts are omitted on purpose.
 */
export function planCancelAdjustments(existing: StoredHop[]): Adjustment[] {
  const changes: Adjustment[] = [];
  for (const row of existing) {
    if (row.status === "voided") continue;
    if (row.status === "unpaid" || row.status === "awaiting_fulfillment") {
      changes.push({ action: "void", obligationId: row.id });
      continue;
    }
    if (row.status === "paid") {
      changes.push({
        action: "insert",
        hop: row.hop,
        purpose: "refund",
        payer: row.payee,
        payee: row.payer,
      });
    }
  }
  return changes;
}
