/**
 * Real tier thresholds, based on lifetime Body Credits™ (never
 * decreases, unlike the spendable balance). A defined, consistent
 * rule — not a fabricated per-client status.
 */
export const TIERS = [
  { name: "Standard", threshold: 0 },
  { name: "Gold", threshold: 500 },
  { name: "Platinum", threshold: 1000 },
  { name: "Signature", threshold: 2000 },
] as const;

export function computeTier(lifetimePoints: number): string {
  let current: string = TIERS[0].name;
  for (const t of TIERS) {
    if (lifetimePoints >= t.threshold) current = t.name;
  }
  return current;
}

export function nextTierInfo(lifetimePoints: number): { nextTier: string | null; creditsToNext: number | null } {
  const next = TIERS.find((t) => t.threshold > lifetimePoints);
  if (!next) return { nextTier: null, creditsToNext: null };
  return { nextTier: next.name, creditsToNext: next.threshold - lifetimePoints };
}

export const CATEGORY_LABELS: Record<string, string> = {
  BEAUTY: "Beauty",
  WELLNESS: "Wellness",
  EXPERIENCES: "Experiences",
  HOLISTIC: "Holistic",
  VIP: "VIP",
  PARTNER: "Partner Rewards",
  MOMS: "Moms",
  FOOD: "Food",
};

export const CATEGORY_ICONS: Record<string, string> = {
  BEAUTY: "💄",
  WELLNESS: "🌿",
  EXPERIENCES: "✨",
  HOLISTIC: "🧘",
  VIP: "👑",
  PARTNER: "🤝",
  MOMS: "🤱",
  FOOD: "🍽️",
};
