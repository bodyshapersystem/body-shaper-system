export type AddonType = "EMS" | "Exilis" | "Endospheres";

/**
 * Real midpoint-loyalty pricing — deliberately lower than the regular
 * per-session rate, offered specifically as a way to reward
 * commitment at the halfway point of a System. Not the standing
 * price list; if the regular rate ever needs representing elsewhere,
 * it's a separate number.
 */
export const TECH_SUPPORT_ADDONS: Record<AddonType, { label: string; description: string; pricePerSessionCents: number }> = {
  EMS: {
    label: "Muscle Activation Boost",
    description: "Add an individual EMS session to complement the muscle-focused component of your current System.",
    pricePerSessionCents: 20000,
  },
  Exilis: {
    label: "Skin Support Session",
    description: "Add an individual Exilis session to complement your current body-contouring strategy.",
    pricePerSessionCents: 17000,
  },
  Endospheres: {
    label: "Tissue Recovery Support",
    description: "Add an Endospheres session to complement tissue movement and recovery support within your current System.",
    pricePerSessionCents: 10000,
  },
};

/**
 * Real per-System configuration, per direction: Sculpt Start™ only
 * allows EMS + Exilis; every other System (Sculpt Signature™, Mom
 * Reset™, GLP-1 Reshape™, Total Body Optimization™) allows all
 * three. Not every add-on is exposed to every client automatically.
 */
export function getAllowedAddonsForSystem(systemName: string | null | undefined): AddonType[] {
  if (!systemName) return [];
  const normalized = systemName.toLowerCase();
  if (normalized.includes("sculpt start")) return ["EMS", "Exilis"];
  if (
    normalized.includes("sculpt signature") ||
    normalized.includes("mom reset") ||
    normalized.includes("glp-1 reshape") ||
    normalized.includes("total body optimization")
  ) {
    return ["EMS", "Exilis", "Endospheres"];
  }
  return [];
}
