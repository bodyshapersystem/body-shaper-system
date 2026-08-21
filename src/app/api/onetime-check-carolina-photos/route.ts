import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const client = await prisma.client.findFirst({
    where: {
      OR: [
        { AND: [{ firstName: { contains: "Carolina", mode: "insensitive" } }, { lastName: { contains: "Cordero", mode: "insensitive" } }] },
        { AND: [{ firstName: { contains: "Caro", mode: "insensitive" } }, { lastName: { contains: "Cordero", mode: "insensitive" } }] },
      ],
    },
  });
  if (!client) return NextResponse.json({ success: false, error: "not found" });

  const photos = await prisma.photo.findMany({
    where: { clientId: client.id },
    orderBy: { uploadedAt: "asc" },
    select: { id: true, type: true, visibility: true, sessionNumber: true, uploadedAt: true },
  });

  const measurements = await prisma.measurement.findMany({
    where: { clientId: client.id },
    orderBy: { scanDate: "asc" },
    select: { id: true, scanDate: true },
  });

  const bodyMeasurements = await prisma.bodyMeasurement.findMany({
    where: { clientId: client.id },
    orderBy: { measuredAt: "asc" },
    select: { id: true, measuredAt: true },
  });

  return NextResponse.json({ success: true, clientId: client.id, photos, measurements, bodyMeasurements });
}
