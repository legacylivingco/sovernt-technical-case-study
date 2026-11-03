/**
 * Label: Sanitized excerpt from the application
 *
 * Admin-approved capability changes. Manager and Senior are never both
 * targets. Compensation rules are not included.
 */

export type HierarchyRole = "Affiliate" | "Senior" | "Manager";
export type HierarchyRoleTarget = "affiliate" | "senior" | "manager";

export function allowedRoleTransitions(role: HierarchyRole): HierarchyRoleTarget[] {
  if (role === "Affiliate") return ["senior", "manager"];
  if (role === "Senior") return ["affiliate", "manager"];
  return ["affiliate"];
}
