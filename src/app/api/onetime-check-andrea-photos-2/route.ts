import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Andrea", mode: "insensitive" }, lastName: { equals: "Trujillo", mode: "insensitive" } },
  });
  if (!client) return NextResponse.json({ success: false, error: "not found" });

  const photos = await prisma.photo.findMany({
    where: { clientId: client.id },
    orderBy: { uploadedAt: "asc" },
    select: { id: true, type: true, visibility: true, sessionNumber: true, uploadedAt: true, takenAt: true, storagePath: true },
  });

  return NextResponse.json({ success: true, clientId: client.id, totalPhotos: photos.length, photos });
}
