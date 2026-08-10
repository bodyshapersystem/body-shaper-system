import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: adds Diana Escalante's after-session measurement (waist +
// abdomen only — the two fields she had confirmed post-session).
// Scoped by name as a safety check.
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
      measuredAt: new Date("2026-08-10T14:31:00"),
      waistCm: 71.3,
      lowerAbdomenCm: 77.4,
      notes: "After-session measurement (same-day comparison to the morning scan).",
    },
  });

  return NextResponse.json({ success: true, clientId: client.id, bodyMeasurementId: bm.id });
}
