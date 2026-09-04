import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmry7ihpb0007l204syoij8dl";

export async function GET() {
  try {
    const assessments = await prisma.blueprintAssessment.findMany({
      where: { clientId: CLIENT_ID },
      orderBy: { version: "desc" },
      select: { id: true, version: true, status: true, recommendedSystem: true, createdAt: true },
    });

    const photos = await prisma.photo.findMany({
      where: { clientId: CLIENT_ID },
      orderBy: { uploadedAt: "desc" },
      take: 10,
      select: { id: true, type: true, assessmentId: true, uploadedAt: true, sessionNumber: true },
    });

    return NextResponse.json({ success: true, assessments, photos });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
