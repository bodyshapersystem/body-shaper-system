import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";

export default async function EmergencyCheckMichellePhotosPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const client = await prisma.client.findFirst({
    where: { firstName: { contains: "Michelle", mode: "insensitive" } },
    include: { photos: { orderBy: { uploadedAt: "asc" } } },
  });

  if (!client) return <div style={{ padding: 40, fontFamily: "monospace" }}>No client found matching Michelle.</div>;

  const lines: string[] = [];
  lines.push(`${client.firstName} ${client.lastName} — id: ${client.id}`);
  lines.push(`total photos: ${client.photos.length}`);
  lines.push("");
  for (const p of client.photos) {
    lines.push(
      `- type: ${p.type} | takenAt: ${p.takenAt?.toISOString() ?? "null"} | uploadedAt: ${p.uploadedAt.toISOString()} | visibility: ${p.visibility} | notes: ${p.notes ?? "none"}`
    );
  }

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      {lines.join("\n")}
    </div>
  );
}
