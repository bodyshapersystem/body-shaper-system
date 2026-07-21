import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";

export default async function EmergencyListBlueprintTxPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const txs = await prisma.rewardsTransaction.findMany({
    where: { action: "Completed Body Blueprint™" },
    include: { rewardsAccount: { include: { client: { select: { firstName: true, lastName: true } } } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      {txs.length} transaction(s):
      {"\n\n"}
      {txs.map(
        (t) =>
          `${t.rewardsAccount.client.firstName} ${t.rewardsAccount.client.lastName} | points: ${t.points} | created: ${t.createdAt.toISOString()} | txId: ${t.id}\n`
      )}
    </div>
  );
}
