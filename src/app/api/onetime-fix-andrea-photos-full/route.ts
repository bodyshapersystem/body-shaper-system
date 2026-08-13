import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

// One-time cleanup for Andrea Trujillo's photo mess:
// - Deletes the duplicate FRONT (same file uploaded twice, 2 min apart, July 21)
// - Deletes the stray photo she uploaded today that's actually one of
//   the before/after composite SOURCE images (not a real session photo)
// - Fixes the two Aug 5 photos still stuck on INTERNAL_ONLY
// - Assigns real, permanent sessionNumber to the 10 real photos:
//     Session 1 = July 21 (FRONT, BACK, LEFT — missing RIGHT, that's
//     real, not something to fabricate)
//     Session 2 = Aug 5 (RIGHT, FRONT — incomplete, real)
//     Session 3 = Aug 13 today (FRONT, BACK, RIGHT, LEFT — complete)
export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Andrea", mode: "insensitive" }, lastName: { equals: "Trujillo", mode: "insensitive" } },
  });
  if (!client) return NextResponse.json({ success: false, error: "not found" });

  const photos = await prisma.photo.findMany({ where: { clientId: client.id }, orderBy: { uploadedAt: "asc" } });

  const duplicateFront = photos.find((p) => p.storagePath.includes("1784653369746-IMG_7904"));
  const strayComposite = photos.find((p) => p.storagePath.includes("60C58957-6CDF-490C-9609-CF4799A54FEC"));
  const admin = createSupabaseAdminClient();

  const removed: string[] = [];
  for (const p of [duplicateFront, strayComposite]) {
    if (!p) continue;
    await admin.storage.from("client-documents").remove([p.storagePath]);
    await prisma.photo.delete({ where: { id: p.id } });
    removed.push(p.id);
  }

  const remaining = await prisma.photo.findMany({ where: { clientId: client.id }, orderBy: { uploadedAt: "asc" } });
  const session1 = remaining.filter((p) => p.uploadedAt < new Date("2026-07-22T00:00:00Z"));
  const session2 = remaining.filter((p) => p.uploadedAt >= new Date("2026-08-05T00:00:00Z") && p.uploadedAt < new Date("2026-08-06T00:00:00Z"));
  const session3 = remaining.filter((p) => p.uploadedAt >= new Date("2026-08-13T00:00:00Z"));

  await prisma.photo.updateMany({ where: { id: { in: session1.map((p) => p.id) } }, data: { sessionNumber: 1 } });
  await prisma.photo.updateMany({ where: { id: { in: session2.map((p) => p.id) } }, data: { sessionNumber: 2, visibility: "CLIENT_VISIBLE" } });
  await prisma.photo.updateMany({ where: { id: { in: session3.map((p) => p.id) } }, data: { sessionNumber: 3 } });

  const final = await prisma.photo.findMany({
    where: { clientId: client.id },
    orderBy: [{ sessionNumber: "asc" }, { uploadedAt: "asc" }],
    select: { id: true, type: true, visibility: true, sessionNumber: true },
  });

  return NextResponse.json({ success: true, removed, final });
}
