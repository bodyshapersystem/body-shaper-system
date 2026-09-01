import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmrs6gl0l0003jx040j1y7zlk";
const ASSESSMENT_ID = "cmrs41tqb0002jp04p1k35b1a";
const SESSION_NUMBER = 5;

export async function GET() {
  try {
    const scanDate = new Date();

    const measurement = await prisma.measurement.create({
      data: {
        clientId: CLIENT_ID,
        assessmentId: ASSESSMENT_ID,
        scanDate,
        sessionNumber: SESSION_NUMBER,
        weightKg: 66.55,
        bodyFatPercent: 35.7,
        proteinPercent: 12.8,
        bodyWaterPercent: 47.1,
        muscleMassKg: 39.86,
        skeletalMuscleKg: 23.49,
        boneMassKg: 2.90,
        deviceSource: "RENPHO Health",
        notes: "Imported from RENPHO report. Body fat/protein/water given as mass (kg); converted to percentages using the reported weight (23.76/66.55=35.7% fat, 8.52/66.55=12.8% protein, 31.35/66.55=47.1% water).",
      },
    });

    const bodyMeasurement = await prisma.bodyMeasurement.create({
      data: {
        clientId: CLIENT_ID,
        assessmentId: ASSESSMENT_ID,
        measuredAt: scanDate,
        sessionNumber: SESSION_NUMBER,
        waistCm: 68.88,
        hipsCm: 106.78,
        lowerAbdomenCm: 78.18,
        leftThighCm: 60.96,
        rightThighCm: 61.80,
        leftArmCm: 30.00,
        rightArmCm: 30.38,
        notes: "Measurements taken in inches, converted to cm (x2.54). Client has been training legs heavily, so the leg increase may reflect muscle gain.",
      },
    });

    return NextResponse.json({ success: true, measurement, bodyMeasurement });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
