import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Adriana", mode: "insensitive" }, lastName: { equals: "Rojas", mode: "insensitive" } },
    include: {
      blueprintAssessments: {
        orderBy: { updatedAt: "desc" },
        take: 3,
        select: { id: true, status: true, recommendedSystem: true, updatedAt: true, completionHighlights: true, nextSystemName: true, nextSystemProposal: true, completionPhotoUrls: true },
      },
      photos: { where: { visibility: "CLIENT_VISIBLE" }, select: { id: true, type: true, uploadedAt: true } },
    },
  });
  if (!client) return NextResponse.json({ success: false, error: "Adriana Rojas not found" });

  return NextResponse.json({
    success: true,
    clientId: client.id,
    assessments: client.blueprintAssessments,
    clientVisiblePhotos: client.photos,
  });
}
