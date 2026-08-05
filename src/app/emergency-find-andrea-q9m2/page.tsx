import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";

export default async function EmergencyFindAndreaPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const clients = await prisma.client.findMany({
    where: { firstName: { contains: "Andrea", mode: "insensitive" } },
    include: { blueprintAssessments: { orderBy: { version: "desc" }, take: 1 } },
  });

  const lines: string[] = [];
  for (const c of clients) {
    lines.push(`${c.firstName} ${c.lastName} — id: ${c.id}`);
    lines.push(`  active assessment id: ${c.blueprintAssessments[0]?.id ?? "NONE"}`);
  }

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      {clients.length === 0 ? "No client found matching Andrea." : lines.join("\n")}
    </div>
  );
}
