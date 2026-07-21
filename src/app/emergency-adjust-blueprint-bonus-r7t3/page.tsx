import { prisma } from "@/lib/prisma";
import { computeTier } from "@/lib/rewards";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";
const OLD_POINTS = 15;
const NEW_POINTS = 5;
const DIFF = OLD_POINTS - NEW_POINTS; // 10

export default async function EmergencyAdjustBlueprintBonusPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const oldTransactions = await prisma.rewardsTransaction.findMany({
    where: { action: "Completed Body Blueprint™", points: OLD_POINTS },
  });

  const lines: string[] = [];

  for (const tx of oldTransactions) {
    const account = await prisma.rewardsAccount.findUnique({
      where: { id: tx.rewardsAccountId },
      include: { client: { select: { firstName: true, lastName: true } } },
    });
    if (!account) continue;

    const newLifetime = account.lifetimePoints - DIFF;
    const newTier = computeTier(newLifetime);

    await prisma.$transaction([
      prisma.rewardsTransaction.update({ where: { id: tx.id }, data: { points: NEW_POINTS } }),
      prisma.rewardsAccount.update({
        where: { id: account.id },
        data: { pointsBalance: { decrement: DIFF }, lifetimePoints: newLifetime, tier: newTier },
      }),
    ]);

    lines.push(
      `${account.client.firstName} ${account.client.lastName}: transaction 15 -> 5, balance ${account.pointsBalance} -> ${account.pointsBalance - DIFF}, lifetime ${account.lifetimePoints} -> ${newLifetime}, tier ${account.tier} -> ${newTier}`
    );
  }

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      Adjusted {lines.length} account(s):
      {"\n\n"}
      {lines.length > 0 ? lines.join("\n") : "No accounts had the old 15pt transaction — nothing to adjust."}
    </div>
  );
}
