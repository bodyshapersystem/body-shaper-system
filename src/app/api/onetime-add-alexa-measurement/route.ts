import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: adds Alexa Olavarria's RENPHO scan from her screenshot (Aug 11, 2026).
export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Alexa", mode: "insensitive" }, lastName: { equals: "Olavarria", mode: "insensitive" } },
    include: { blueprintAssessments: { orderBy: { updatedAt: "desc" }, take: 1 } },
  });
  if (!client) return NextResponse.json({ success: false, error: "Alexa Olavarria not found" });

  const assessmentId = client.blueprintAssessments[0]?.id ?? null;
  const scanDate = new Date("2026-08-11T19:13:41");

  const measurement = await prisma.measurement.create({
    data: {
      clientId: client.id,
      assessmentId,
      scanDate,
      weightKg: 55.55,
      bodyFatPercent: 26.8,
      muscleMassKg: 37.94,
      skeletalMuscleKg: 22.22,
      bodyWaterPercent: 53.59,
      proteinPercent: 14.6,
      bmi: 20.4,
      visceralFat: 5,
      subcutaneousFatPercent: 19.2,
      boneMassKg: 2.70,
      bmr: 1248,
      bodyAge: 39,
      fatFreeWeightKg: 40.66,
      notes: "Added from RENPHO report screenshot.",
    },
  });

  return NextResponse.json({ success: true, clientId: client.id, measurementId: measurement.id });
}
