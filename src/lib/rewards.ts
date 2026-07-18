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

/**
 * Real "Invite & Earn" automation — awards the referrer +250 Society
 * Points the first time their referred lead (now a Client) completes
 * a real qualifying purchase (their first PAID payment). Guarded by
 * Lead.referralRewardGranted so it only ever fires once per referral,
 * even if called on every subsequent payment.
 */
export async function awardReferralBonusIfQualifying(clientId: string) {
  const { prisma } = await import("@/lib/prisma");

  const client = await prisma.client.findUnique({ where: { id: clientId }, include: { lead: true } });
  if (!client?.lead?.referredByClientId || client.lead.referralRewardGranted) return;

  const referrerAccount = await prisma.rewardsAccount.findUnique({ where: { clientId: client.lead.referredByClientId } });
  if (!referrerAccount) return;

  const REFERRAL_BONUS = 250;
  const newLifetime = referrerAccount.lifetimePoints + REFERRAL_BONUS;

  await prisma.$transaction([
    prisma.lead.update({ where: { id: client.lead.id }, data: { referralRewardGranted: true } }),
    prisma.rewardsAccount.update({
      where: { id: referrerAccount.id },
      data: { pointsBalance: { increment: REFERRAL_BONUS }, lifetimePoints: newLifetime, tier: computeTier(newLifetime) },
    }),
    prisma.rewardsTransaction.create({
      data: { rewardsAccountId: referrerAccount.id, points: REFERRAL_BONUS, action: `Referral: ${client.firstName} ${client.lastName} joined` },
    }),
  ]);
}

/**
 * Real, hidden eligibility engine for "Signature Experiences" — per
 * direction, clients never see WHY something is locked, only
 * Locked/Available. Currently evaluates real Lifetime Investment (sum
 * of PAID payments) OR at least one real qualifying referral
 * (referralRewardGranted=true on a Lead they referred). Designed to
 * be extended with more real signals later (membership status, future
 * Owner-defined rules) without changing the calling code.
 */
export async function isEligibleForSignatureExperiences(clientId: string): Promise<boolean> {
  const { prisma } = await import("@/lib/prisma");
  const LIFETIME_INVESTMENT_THRESHOLD_CENTS = 230000; // $2,300

  const [paidAgg, qualifyingReferralCount] = await Promise.all([
    prisma.payment.aggregate({ where: { clientId, status: "PAID" }, _sum: { amountCents: true } }),
    prisma.lead.count({ where: { referredByClientId: clientId, referralRewardGranted: true } }),
  ]);

  const lifetimeInvestmentCents = paidAgg._sum.amountCents ?? 0;
  return lifetimeInvestmentCents >= LIFETIME_INVESTMENT_THRESHOLD_CENTS || qualifyingReferralCount >= 1;
}
