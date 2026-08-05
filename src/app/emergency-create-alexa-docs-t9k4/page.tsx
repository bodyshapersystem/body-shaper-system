import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";
const ALEXA_CLIENT_ID = "cmsdqttxm0003jr04vjvawhzf";

export default async function EmergencyCreateAlexaDocsPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const client = await prisma.client.findUnique({ where: { id: ALEXA_CLIENT_ID }, include: { documents: true } });
  if (!client) return <div style={{ padding: 40, fontFamily: "monospace" }}>Client not found.</div>;

  const owner = await prisma.user.findFirst({ where: { email: "hello@bodyshapersystem.com" } });
  const lines: string[] = [];

  const hasPolicies = client.documents.some((d) => d.category === "POLICIES_APPOINTMENTS");
  if (!hasPolicies) {
    await prisma.document.create({
      data: {
        clientId: ALEXA_CLIENT_ID,
        category: "POLICIES_APPOINTMENTS",
        title: "Ambassador Intake — Prepare Your Experience™",
        storagePath: "",
        fileType: "manual-record",
        uploadedById: owner?.id,
      },
    });
    lines.push("Created POLICIES_APPOINTMENTS document (manual record — real webhook for this form failed with a 404).");
  } else {
    lines.push("POLICIES_APPOINTMENTS already existed — skipped.");
  }

  const hasConsent = client.documents.some((d) => d.category === "CONSENT_TREATMENT");
  if (!hasConsent) {
    await prisma.document.create({
      data: {
        clientId: ALEXA_CLIENT_ID,
        category: "CONSENT_TREATMENT",
        title: "Almost Ready™ — Waiver & Release",
        storagePath: "",
        fileType: "manual-record",
        uploadedById: owner?.id,
      },
    });
    lines.push("Created CONSENT_TREATMENT document (manual record).");
  } else {
    lines.push("CONSENT_TREATMENT already existed — skipped.");
  }

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      {lines.join("\n")}
    </div>
  );
}
