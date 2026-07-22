import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";
const ANDREA_CLIENT_ID = "cmrtfsgbe0003jp04h57dkoji";

export default async function EmergencyAndreaAssessmentPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const assessments = await prisma.blueprintAssessment.findMany({
    where: { clientId: ANDREA_CLIENT_ID },
    orderBy: { version: "desc" },
  });

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      {assessments.map((a) => `id: ${a.id} | version: ${a.version} | recommendedSystem: ${a.recommendedSystem}\n`)}
    </div>
  );
}
