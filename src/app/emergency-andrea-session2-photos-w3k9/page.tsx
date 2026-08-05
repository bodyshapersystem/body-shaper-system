import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PHOTO1_B64, PHOTO2_B64 } from "./data";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";
const ANDREA_CLIENT_ID = "cmrtfsgbe0003jp04h57dkoji";
const ANDREA_ASSESSMENT_ID = "cmrr0c5910002i6041roqfofe";

export default async function EmergencyAndreaSession2Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const owner = await prisma.user.findFirst({ where: { email: "hello@bodyshapersystem.com" } });
  const admin = createSupabaseAdminClient();
  const now = new Date();
  const lines: string[] = [];

  const photos = [
    { key: "photo1", b64: PHOTO1_B64, type: "RIGHT" as const },
    { key: "photo2", b64: PHOTO2_B64, type: "FRONT" as const },
  ];

  for (const p of photos) {
    const buffer = Buffer.from(p.b64, "base64");
    const path = `photos/${ANDREA_CLIENT_ID}/${Date.now()}-second-session-${p.key}.jpg`;
    const { error: uploadError } = await admin.storage.from("client-documents").upload(path, buffer, { contentType: "image/jpeg" });
    if (uploadError) {
      lines.push(`FAILED to upload ${p.key}: ${uploadError.message}`);
      continue;
    }
    await prisma.photo.create({
      data: {
        clientId: ANDREA_CLIENT_ID,
        assessmentId: ANDREA_ASSESSMENT_ID,
        type: p.type,
        storagePath: path,
        takenAt: now,
        specialistId: owner?.id,
        notes: "Second Session",
      },
    });
    lines.push(`Uploaded and recorded ${p.key} as ${p.type} at ${path}`);
  }

  const measurement = await prisma.bodyMeasurement.create({
    data: {
      clientId: ANDREA_CLIENT_ID,
      assessmentId: ANDREA_ASSESSMENT_ID,
      measuredAt: now,
      waistCm: 77.3,
      hipsCm: 101.2,
      lowerAbdomenCm: 86.3,
      notes: "Second Session measurements",
      specialistId: owner?.id ?? undefined,
    },
  });
  lines.push(`\nMeasurement recorded: ${measurement.id} — waist 77.3cm, hips 101.2cm, lower abdomen 86.3cm`);

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      {lines.join("\n")}
    </div>
  );
}
