import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: finds Adriana Rojas's most recently uploaded DETAIL /
// CLIENT_VISIBLE photo (the before/after comparison graphic she just
// uploaded), labels it "B/A" in notes, and appends it to her
// completionPhotoUrls (after the 4 session photos) so it renders as
// the featured comparison image on her System Completion page.
export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Adriana", mode: "insensitive" }, lastName: { equals: "Rojas", mode: "insensitive" } },
    include: { blueprintAssessments: { orderBy: { updatedAt: "desc" }, take: 1 } },
  });
  if (!client) return NextResponse.json({ success: false, error: "Adriana Rojas not found" });

  const baPhoto = await prisma.photo.findFirst({
    where: { clientId: client.id, type: "DETAIL", visibility: "CLIENT_VISIBLE" },
    orderBy: { uploadedAt: "desc" },
  });
  if (!baPhoto) return NextResponse.json({ success: false, error: "No DETAIL photo found — did the upload finish?" });

  await prisma.photo.update({ where: { id: baPhoto.id }, data: { notes: "B/A" } });

  const assessment = client.blueprintAssessments[0];
  if (!assessment) return NextResponse.json({ success: false, error: "No assessment found" });

  const existingIds = Array.isArray(assessment.completionPhotoUrls)
    ? (assessment.completionPhotoUrls as unknown[]).filter((v): v is string => typeof v === "string")
    : [];

  // completionPhotoUrls was never actually set with her 4 session
  // photos yet (only used in a read-only preview earlier) — seed them
  // now, in FRONT/BACK/LEFT/RIGHT order, then append the B/A photo.
  const sessionPhotoIds = [
    "cmso0d6gk0003l5041i8fehhn", // FRONT
    "cmso0dt5l0007l504wawjhvvt", // BACK
    "cmso0e9je000bl504h888fd28", // LEFT
    "cmso0ep4b000fl504yriytk3v", // RIGHT
  ];
  const base = existingIds.length > 0 ? existingIds : sessionPhotoIds;
  const newIds = base.includes(baPhoto.id) ? base : [...base, baPhoto.id];

  const updated = await prisma.blueprintAssessment.update({
    where: { id: assessment.id },
    data: { completionPhotoUrls: newIds },
  });

  return NextResponse.json({ success: true, photoId: baPhoto.id, completionPhotoUrls: updated.completionPhotoUrls });
}
