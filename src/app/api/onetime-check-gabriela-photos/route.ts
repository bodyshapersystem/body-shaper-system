import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Gabriela", mode: "insensitive" }, lastName: { equals: "Escalona", mode: "insensitive" } },
  });
  if (!client) return NextResponse.json({ success: false, error: "not found" });

  const photos = await prisma.photo.findMany({
    where: { clientId: client.id },
    orderBy: { uploadedAt: "asc" },
    select: { id: true, type: true, visibility: true, sessionNumber: true, uploadedAt: true },
  });

  const bodyMeasurements = await prisma.bodyMeasurement.findMany({
    where: { clientId: client.id },
    select: { measuredAt: true },
  });

  return NextResponse.json({ success: true, clientId: client.id, totalPhotos: photos.length, photos, bodyMeasurements });
}
