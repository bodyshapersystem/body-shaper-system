import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";

// The bug: "Completed Body Blueprint™" always logged +15 to the
// transaction/lifetime, but silently added +50 to pointsBalance (a
// stale value left over from before the reward was changed from 50
// to 15). Every account with this transaction has a balance exactly
// 35 points too high, once per occurrence. This corrects all of them
// by decrementing 35 per "Completed Body Blueprint™" transaction —
// safe regardless of any redemptions since, because it corrects the
// overage directly rather than assuming balance should equal lifetime.
export default async function EmergencyFixBlueprintBonusOverpayPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const affected = await prisma.rewardsTransaction.groupBy({
    by: ["rewardsAccountId"],
    where: { action: "Completed Body Blueprint™" },
    _count: { rewardsAccountId: true },
  });

  const lines: string[] = [];

  for (const row of affected) {
    const overage = 35 * row._count.rewardsAccountId;
    const account = await prisma.rewardsAccount.findUnique({
      where: { id: row.rewardsAccountId },
      include: { client: { select: { firstName: true, lastName: true } } },
    });
    if (!account) continue;

    await prisma.rewardsAccount.update({
      where: { id: account.id },
      data: { pointsBalance: { decrement: overage } },
    });

    lines.push(
      `${account.client.firstName} ${account.client.lastName}: balance ${account.pointsBalance} -> ${account.pointsBalance - overage} (corrected -${overage})`
    );
  }

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      Corrected {lines.length} account(s):
      {"\n\n"}
      {lines.join("\n")}
    </div>
  );
}
