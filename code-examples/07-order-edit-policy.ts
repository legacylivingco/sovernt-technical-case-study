/**
 * Label: Sanitized excerpt from the application
 *
 * Financial editing stays closed after a purchase is recorded, even if
 * fulfillment status is later reversed. Who may edit or cancel is a
 * snapshotted-party check, not a live price check. Amounts omitted.
 */

export type FulfillmentStatus = "not_fulfilled" | "fulfilled";

export function financialEditAllowed(input: {
  lifecycle: "active" | "cancelled";
  fulfillmentStatus: FulfillmentStatus;
  purchaseRecorded: boolean;
}): boolean {
  return (
    input.lifecycle === "active" &&
    input.fulfillmentStatus === "not_fulfilled" &&
    !input.purchaseRecorded
  );
}

export type OrderAccess = {
  isAdmin: boolean;
  actorCustomerPartyId: string | null;
  actorBusinessAccountId: string | null;
};

export type ManagedOrder = {
  purpose: "customer_purchase" | "personal_use";
  customerPartyId: string | null;
  sellerBusinessAccountId: string | null;
  managerBusinessAccountId: string | null;
  buyerBusinessAccountId: string | null;
  currentFulfillmentBusinessAccountId: string | null;
  storefrontBusinessAccountId?: string | null;
};

export function canManageOrder(actor: OrderAccess, order: ManagedOrder): boolean {
  if (actor.isAdmin) return true;
  if (order.purpose === "personal_use") {
    return (
      actor.actorBusinessAccountId !== null &&
      actor.actorBusinessAccountId === order.buyerBusinessAccountId
    );
  }
  if (actor.actorCustomerPartyId && actor.actorCustomerPartyId === order.customerPartyId) {
    return true;
  }
  if (!actor.actorBusinessAccountId) return false;
  return (
    actor.actorBusinessAccountId === order.sellerBusinessAccountId ||
    actor.actorBusinessAccountId === order.managerBusinessAccountId ||
    actor.actorBusinessAccountId === order.currentFulfillmentBusinessAccountId ||
    actor.actorBusinessAccountId === order.storefrontBusinessAccountId
  );
}
