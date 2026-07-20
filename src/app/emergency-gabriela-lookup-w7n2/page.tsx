import { prisma } from "@/lib/prisma";

const SECRET = "veL19BEaQo0gLPd1YOcZaQ";

export default async function EmergencyGabrielaLookupPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const leads = await prisma.lead.findMany({
    where: { firstName: { contains: "Gabriela", mode: "insensitive" } },
  });
  const clients = await prisma.client.findMany({
    where: { firstName: { contains: "Gabriela", mode: "insensitive" } },
  });

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      <strong>Leads matching "Gabriela":</strong>
      {"\n"}
      {leads.length === 0
        ? "  (none found)\n"
        : leads.map(
            (l) =>
              `  - Lead id: ${l.id} | name: ${l.firstName} ${l.lastName} | status: ${l.status} | email: ${l.email} | phone: ${l.phone ?? "none"} | archived: ${l.archivedAt ? "yes" : "no"} | created: ${l.createdAt.toISOString()}\n`
          )}
      {"\n"}
      <strong>Clients matching "Gabriela":</strong>
      {"\n"}
      {clients.length === 0 ? "  (none found)\n" : clients.map((c) => `  - Client id: ${c.id} | email: ${c.email}\n`)}
    </div>
  );
}
