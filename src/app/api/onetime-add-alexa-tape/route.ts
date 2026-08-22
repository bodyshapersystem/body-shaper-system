import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: adds Alexa Olavarria's tape measurements for today (Aug 21, 2026).
// RENPHO scan intentionally excluded — today's scan gave physiologically
// implausible readings (3.7% body fat, muscle mass jumping ~11kg in 10
// days), flagged as a likely bad scan; Emmy is re-scanning separately.
export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Alexa", mode: "insensitive" }, lastName: { equals: "Olavarria", mode: "insensitive" } },
    include: { blueprintAssessments: { orderBy: { updatedAt: "desc" }, take: 1 } },
  });
  if (!client) return NextResponse.json({ success: false, error: "Alexa Olavarria not found" });

  const assessmentId = client.blueprintAssessments[0]?.id ?? null;
  const measuredAt = new Date("2026-08-21T08:11:00");

  const bodyMeasurement = await prisma.bodyMeasurement.create({
    data: {
      clientId: client.id,
      assessmentId,
      measuredAt,
      rightArmCm: 25.1,
      chestCm: 25.6,
      waistCm: 68.2,
      lowerAbdomenCm: 77.0,
      notes: "Added from tape measurement app screenshot — today's session. RENPHO scan withheld (implausible reading, being redone).",
    },
  });

  return NextResponse.json({ success: true, clientId: client.id, bodyMeasurementId: bodyMeasurement.id });
}
