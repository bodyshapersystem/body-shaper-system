import { prisma } from "@/lib/prisma";
import { getOnboardingStatus } from "@/lib/onboarding";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";

export default async function EmergencyAndreaCheckPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const client = await prisma.client.findFirst({
    where: { firstName: { contains: "Andrea", mode: "insensitive" } },
    include: { documents: true },
  });

  if (!client) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>No client named "Andrea" found.</div>;
  }

  const status = await getOnboardingStatus(client.id);

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      Client: {client.firstName} {client.lastName} ({client.email}), id: {client.id}
      {"\n"}
      clientType: {client.clientType} | requiresContentRelease: {String(client.requiresContentRelease)}
      {"\n\n"}
      Onboarding status: {JSON.stringify(status, null, 2)}
      {"\n\n"}
      Documents on file ({client.documents.length}):
      {"\n"}
      {client.documents.map((d) => `  - category: ${d.category} | title: ${d.title} | uploadedAt: ${d.uploadedAt.toISOString()}\n`)}
    </div>
  );
}
