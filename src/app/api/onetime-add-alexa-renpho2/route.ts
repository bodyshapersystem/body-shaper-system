import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: adds Alexa Olavarria's corrected RENPHO re-scan for today (Aug 21, 2026, 8:17pm).
export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Alexa", mode: "insensitive" }, lastName: { equals: "Olavarria", mode: "insensitive" } },
    include: { blueprintAssessments: { orderBy: { updatedAt: "desc" }, take: 1 } },
  });
  if (!client) return NextResponse.json({ success: false, error: "Alexa Olavarria not found" });

  const assessmentId = client.blueprintAssessments[0]?.id ?? null;
  const scanDate = new Date("2026-08-21T20:17:16");

  const measurement = await prisma.measurement.create({
    data: {
      clientId: client.id,
      assessmentId,
      scanDate,
      weightKg: 55.00,
      bodyFatPercent: 26.3,
      muscleMassKg: 37.78,
      skeletalMuscleKg: 22.11,
      bodyWaterPercent: 54.0,
      proteinPercent: 14.69,
      bmi: 20.2,
      visceralFat: 5,
      subcutaneousFatPercent: 18.8,
      boneMassKg: 2.70,
      bmr: 1244,
      bodyAge: 39,
      fatFreeWeightKg: 40.54,
      notes: "Added from RENPHO report screenshot — corrected re-scan (first scan today was a bad reading).",
    },
  });

  return NextResponse.json({ success: true, clientId: client.id, measurementId: measurement.id });
}
