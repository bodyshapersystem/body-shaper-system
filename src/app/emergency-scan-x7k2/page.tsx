import { prisma } from "@/lib/prisma";

const SECRET = "KwzsVk1e6FvYFcQNfxlSSg";

export default async function EmergencyScanPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const client = await prisma.client.findFirst({
    where: { firstName: { contains: "Carolina", mode: "insensitive" }, lastName: { contains: "Cordero", mode: "insensitive" } },
  });

  if (!client) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Client "Carolina Cordero" not found.</div>;
  }

  const assessment = await prisma.blueprintAssessment.findFirst({
    where: { clientId: client.id },
    orderBy: { version: "desc" },
  });

  const scan = await prisma.measurement.create({
    data: {
      clientId: client.id,
      assessmentId: assessment?.id ?? null,
      scanDate: new Date(),
      visceralFat: 9,
      bmr: 1386,
      fatFreeWeightKg: 47.09,
      bodyAge: 37,
      notes: "Entered manually from a RENPHO scan screenshot (visceral fat, BMR, fat-free weight, metabolic age only).",
    },
  });

  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      Scan recorded for {client.firstName} {client.lastName} (client id: {client.id}).
      <br />
      Measurement id: {scan.id}
      <br />
      Visceral Fat: 9 | BMR: 1386 kcal | Fat-Free Weight: 47.09 kg | Metabolic Age: 37
    </div>
  );
}
