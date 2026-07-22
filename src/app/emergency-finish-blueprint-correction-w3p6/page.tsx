import { prisma } from "@/lib/prisma";
import { computeTier } from "@/lib/rewards";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";

// Michelle Capri and Carolina Cordero's "Completed Body Blueprint™"
// transactions were logged at 50 (an even older version of the bug
// than Andrea/Gabriela's 15). The first correction pass
// (emergency-fix-blueprint-overpay-z5x8) already removed 35 from
// their balance based on the wrong assumption that everyone was at 15
// — so their balance has ALREADY had a partial -35 applied, while
// their transaction record and lifetimePoints still show the
// original 50. This finishes the job: brings the transaction down to
// 5, removes the remaining 10 from balance (45 total needed - 35
// already done), and removes the full 45 from lifetime (untouched
// until now).
const TARGET_TX_IDS = ["cmrsbsgbi0003jq04fa7zj6le", "cmrsbupri0003l7041z54cop0"];

export default async function EmergencyFinishBlueprintCorrectionPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const lines: string[] = [];

  for (const txId of TARGET_TX_IDS) {
    const tx = await prisma.rewardsTransaction.findUnique({ where: { id: txId } });
    if (!tx) {
      lines.push(`Transaction ${txId} not found — skipping.`);
      continue;
    }
    if (tx.points === 5) {
      lines.push(`Transaction ${txId} already at 5 pts — nothing to do.`);
      continue;
    }
    if (tx.points !== 50) {
      lines.push(`Transaction ${txId} has unexpected points value (${tx.points}), not 50 as expected — skipping to be safe.`);
      continue;
    }

    const account = await prisma.rewardsAccount.findUnique({
      where: { id: tx.rewardsAccountId },
      include: { client: { select: { firstName: true, lastName: true } } },
    });
    if (!account) continue;

    const lifetimeDiff = 45; // full, never adjusted before
    const balanceDiff = 10; // 45 total needed - 35 already removed in the first pass
    const newLifetime = account.lifetimePoints - lifetimeDiff;
    const newTier = computeTier(newLifetime);

    await prisma.$transaction([
      prisma.rewardsTransaction.update({ where: { id: tx.id }, data: { points: 5 } }),
      prisma.rewardsAccount.update({
        where: { id: account.id },
        data: { pointsBalance: { decrement: balanceDiff }, lifetimePoints: newLifetime, tier: newTier },
      }),
    ]);

    lines.push(
      `${account.client.firstName} ${account.client.lastName}: transaction 50 -> 5, balance ${account.pointsBalance} -> ${account.pointsBalance - balanceDiff}, lifetime ${account.lifetimePoints} -> ${newLifetime}, tier ${account.tier} -> ${newTier}`
    );
  }

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      {lines.join("\n")}
    </div>
  );
}
