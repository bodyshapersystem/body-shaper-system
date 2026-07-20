import { prisma } from "@/lib/prisma";

const SECRET = "MlDreTs9F4b5f6mvvWRX5A";

export default async function EmergencyLeadLookupPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const names = [
    { firstName: "Adriana", lastName: "Rojas" },
    { firstName: "Maria", lastName: "Escalona" },
  ];

  const results = [];
  for (const n of names) {
    const leads = await prisma.lead.findMany({
      where: {
        firstName: { contains: n.firstName, mode: "insensitive" },
        lastName: { contains: n.lastName, mode: "insensitive" },
      },
    });
    const clients = await prisma.client.findMany({
      where: {
        firstName: { contains: n.firstName, mode: "insensitive" },
        lastName: { contains: n.lastName, mode: "insensitive" },
      },
    });
    results.push({ name: `${n.firstName} ${n.lastName}`, leads, clients });
  }

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      {results.map((r) => (
        <div key={r.name} style={{ marginBottom: 30 }}>
          <strong>{r.name}</strong>
          {"\n"}
          Leads found: {r.leads.length}
          {"\n"}
          {r.leads.map((l) => `  - Lead id: ${l.id} | status: ${l.status} | email: ${l.email} | phone: ${l.phone ?? "none"} | created: ${l.createdAt.toISOString()}\n`)}
          Clients found (already converted): {r.clients.length}
          {"\n"}
          {r.clients.map((c) => `  - Client id: ${c.id} | email: ${c.email}\n`)}
        </div>
      ))}
    </div>
  );
}
