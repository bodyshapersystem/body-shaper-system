import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: creates the correct BodyMeasurement record for Diana
// Escalante (her tape measurements were mistakenly written onto the
// Measurement/RENPHO table in a prior step). Scoped by name.
export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Diana", mode: "insensitive" }, lastName: { equals: "Escalante", mode: "insensitive" } },
    include: { blueprintAssessments: { orderBy: { updatedAt: "desc" }, take: 1 } },
  });
  if (!client) return NextResponse.json({ success: false, error: "Diana Escalante not found" });

  const assessmentId = client.blueprintAssessments[0]?.id ?? null;

  const bm = await prisma.bodyMeasurement.create({
    data: {
      clientId: client.id,
      assessmentId,
      measuredAt: new Date("2026-08-10T13:36:58"),
      neckCm: 31.4,
      shoulderCm: 98.9,
      chestCm: 85.2,
      waistCm: 72.2,
      lowerAbdomenCm: 82.7,
      hipsCm: 100.9,
      leftArmCm: 26.7,
      rightArmCm: 28.1,
      leftThighCm: 54.7,
      rightThighCm: 56.1,
      notes: "Added from tape measurement app screenshot.",
    },
  });

  return NextResponse.json({ success: true, clientId: client.id, bodyMeasurementId: bm.id });
}
