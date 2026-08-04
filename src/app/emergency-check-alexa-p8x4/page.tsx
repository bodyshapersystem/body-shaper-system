import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";

export default async function EmergencyCheckAlexaPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const clients = await prisma.client.findMany({
    where: {
      OR: [
        { firstName: { contains: "Alexa", mode: "insensitive" } },
        { lastName: { contains: "Olavarria", mode: "insensitive" } },
        { lastName: { contains: "Olavarría", mode: "insensitive" } },
      ],
    },
    include: { user: true, portalInvite: true },
  });

  const lines: string[] = [];
  for (const client of clients) {
    lines.push(`--- ${client.firstName} ${client.lastName} (id: ${client.id}) ---`);
    lines.push(`current email: ${client.email}`);
    lines.push(`user.portalStatus: ${client.user.portalStatus}`);
    lines.push(`user.authUserId: ${client.user.authUserId}`);
    if (client.portalInvite) {
      lines.push(
        `invite: acceptedAt=${client.portalInvite.acceptedAt}, expiresAt=${client.portalInvite.expiresAt.toISOString()}, createdAt=${client.portalInvite.createdAt.toISOString()}`
      );
    } else {
      lines.push("invite: none found");
    }
    lines.push("");
  }

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      {clients.length === 0 ? "No client found matching Alexa Olavarria." : lines.join("\n")}
    </div>
  );
}
