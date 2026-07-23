import { prisma } from "@/lib/prisma";
import { getOnboardingStatus } from "@/lib/onboarding";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";

export default async function EmergencyCheckGabrielaPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const clients = await prisma.client.findMany({
    where: { OR: [{ firstName: { contains: "Gabriela", mode: "insensitive" } }, { lastName: { contains: "Escalante", mode: "insensitive" } }] },
    include: { user: true, documents: true },
  });

  const lines: string[] = [];
  for (const client of clients) {
    lines.push(`--- ${client.firstName} ${client.lastName} (id: ${client.id}) ---`);
    lines.push(`email: ${client.email}`);
    lines.push(`archivedAt: ${client.archivedAt}`);
    lines.push(`pausedAt: ${client.pausedAt}`);
    lines.push(`user: id=${client.user.id}, status=${client.user.status}, portalStatus=${client.user.portalStatus}, authUserId=${client.user.authUserId}, email=${client.user.email}`);
    lines.push(`documents (${client.documents.length}): ${client.documents.map((d) => d.category).join(", ")}`);

    const onboarding = await getOnboardingStatus(client.id);
    lines.push(`onboarding: ${JSON.stringify(onboarding)}`);
    lines.push("");
  }

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      {clients.length === 0 ? "No client found matching Gabriela Escalante." : lines.join("\n")}
    </div>
  );
}
