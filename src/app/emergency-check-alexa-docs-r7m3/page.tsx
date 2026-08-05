import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";
const ALEXA_CLIENT_ID = "cmsdqttxm0003jr04vjvawhzf";

export default async function EmergencyCheckAlexaDocsPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const client = await prisma.client.findUnique({
    where: { id: ALEXA_CLIENT_ID },
    include: { user: true, documents: { orderBy: { uploadedAt: "desc" } } },
  });

  if (!client) return <div style={{ padding: 40, fontFamily: "monospace" }}>Client not found.</div>;

  const lines: string[] = [];
  lines.push(`clientType: ${client.clientType}`);
  lines.push(`portalStatus: ${client.user.portalStatus}`);
  lines.push(`total documents: ${client.documents.length}`);
  lines.push("");
  for (const doc of client.documents) {
    lines.push(`- category: ${doc.category} | title: ${doc.title} | uploadedAt: ${doc.uploadedAt.toISOString()} | storagePath: ${doc.storagePath}`);
  }

  const hasPolicies = client.documents.some((d) => d.category === "POLICIES_APPOINTMENTS");
  const hasConsent = client.documents.some((d) => d.category === "CONSENT_TREATMENT");
  lines.push("");
  lines.push(`Step 1 (POLICIES_APPOINTMENTS) present: ${hasPolicies}`);
  lines.push(`Step 2 (CONSENT_TREATMENT) present: ${hasConsent}`);

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      {lines.join("\n")}
    </div>
  );
}
