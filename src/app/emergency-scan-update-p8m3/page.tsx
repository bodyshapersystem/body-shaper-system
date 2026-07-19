import { prisma } from "@/lib/prisma";

const SECRET = "VUJBKjRZLK7SQ9kkUe74Bw";

export default async function EmergencyScanUpdatePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
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

  const scan = await prisma.measurement.findFirst({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
  });

  if (!scan) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>No existing scan found for this client.</div>;
  }

  const updated = await prisma.measurement.update({
    where: { id: scan.id },
    data: {
      weightKg: 69.45,
      boneMassKg: 3.2,
      muscleMassKg: 43.89,
      skeletalMuscleKg: 26.11,
    },
  });

  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      Updated existing scan for {client.firstName} {client.lastName} (measurement id: {updated.id}).
      <br />
      Weight: 69.45 kg | Bone Mass: 3.20 kg | Muscle Mass: 43.89 kg | Skeletal Muscle: 26.11 kg
      <br />
      <br />
      NOT added (no matching field or unit mismatch, not calculated): body fat mass (22.36 kg — field expects %), body water mass (34.52 kg — field expects %), protein mass (no value given).
    </div>
  );
}
