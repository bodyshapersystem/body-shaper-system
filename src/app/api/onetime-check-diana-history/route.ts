import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Diana", mode: "insensitive" }, lastName: { equals: "Escalante", mode: "insensitive" } },
  });
  if (!client) return NextResponse.json({ success: false, error: "not found" });

  const measurements = await prisma.measurement.findMany({
    where: { clientId: client.id },
    orderBy: { scanDate: "asc" },
    select: { id: true, scanDate: true, weightKg: true, bodyFatPercent: true, waistCm: true, abdomenCm: true, hipCm: true },
  });

  return NextResponse.json({ success: true, count: measurements.length, measurements });
}
