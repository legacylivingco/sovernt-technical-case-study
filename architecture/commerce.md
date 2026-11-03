# Commerce workflow (technical design)

**Label:** Simplified illustrative example. No pricing formulas.

## Lifecycle

1. Draft lines on an order list
2. Submit with an idempotency key → freeze parties, lots, and payment hops
3. Active: quantities may change while financially editable
4. Cancel: unpaid hops voided; paid hops get reverse-direction refund rows
5. Fulfill: current fulfiller records a purchase; that lock is sticky

Payment status and fulfillment status are independent.

## Snapshots

Catalog prices and payment handles may change later. The order keeps the copies taken at submit (and at each edit lot). Organizational reporting lines may move fulfillment ownership without rewriting snapshotted seller/manager ids.

## Obligation hops (roles, not rates)

- Public catalog: customer → platform
- Affiliate storefront: customer → owner → manager (or platform) → platform
- Optional commission hop payable on fulfillment, not on submit

Confirmations are whole-obligation. There is no partial paid amount. Instructions are copied onto the hop so later profile edits do not rewrite history.
