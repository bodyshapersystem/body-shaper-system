import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";
const ANDREA_CLIENT_ID = "cmrtfsgbe0003jp04h57dkoji";

export default async function EmergencyAndreaTransactionsPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const account = await prisma.rewardsAccount.findUnique({
    where: { clientId: ANDREA_CLIENT_ID },
    include: { transactions: { orderBy: { createdAt: "asc" } } },
  });

  if (!account) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>No rewards account found.</div>;
  }

  let running = 0;

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      Current: pointsBalance={account.pointsBalance}, lifetimePoints={account.lifetimePoints}, tier={account.tier}
      {"\n\n"}
      Full transaction history ({account.transactions.length}):
      {"\n\n"}
      {account.transactions.map((t) => {
        running += t.points;
        return `${t.createdAt.toISOString()} | ${t.points > 0 ? "+" : ""}${t.points} pts | "${t.action}" | running total: ${running} | notes: ${t.notes ?? "—"}\n`;
      })}
      {"\n"}
      Sum of all transactions: {account.transactions.reduce((s, t) => s + t.points, 0)}
    </div>
  );
}
