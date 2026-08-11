import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Adriana", mode: "insensitive" }, lastName: { equals: "Rojas", mode: "insensitive" } },
    include: {
      photos: { where: { visibility: "CLIENT_VISIBLE" }, orderBy: { uploadedAt: "asc" }, select: { id: true, type: true, uploadedAt: true, sessionNumber: true } },
      blueprintAssessments: { orderBy: { updatedAt: "desc" }, take: 1, select: { id: true, completionPhotoUrls: true } },
    },
  });
  if (!client) return NextResponse.json({ success: false, error: "Adriana Rojas not found" });

  return NextResponse.json({
    success: true,
    clientId: client.id,
    assessmentId: client.blueprintAssessments[0]?.id ?? null,
    currentCompletionPhotoUrls: client.blueprintAssessments[0]?.completionPhotoUrls ?? null,
    photos: client.photos,
  });
}
