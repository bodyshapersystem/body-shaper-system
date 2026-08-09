import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time diagnostic: find Andrea Trujillo's client id and list her
// CLIENT_VISIBLE photos in upload order, chunked into sessions of 4
// (same grouping logic as the real Progress Photos page), so we can
// identify which photo ids are session 1 vs session 2 per angle.
export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Andrea", mode: "insensitive" }, lastName: { equals: "Trujillo", mode: "insensitive" } },
  });

  if (!client) {
    return NextResponse.json({ success: false, error: "No client found matching Andrea Trujillo" });
  }

  const photos = await prisma.photo.findMany({
    where: { clientId: client.id, visibility: "CLIENT_VISIBLE" },
    orderBy: { uploadedAt: "asc" },
    select: { id: true, type: true, uploadedAt: true, takenAt: true, notes: true },
  });

  const SESSION_SIZE = 4;
  const sessions: (typeof photos)[] = [];
  for (let i = 0; i < photos.length; i += SESSION_SIZE) {
    sessions.push(photos.slice(i, i + SESSION_SIZE));
  }

  return NextResponse.json({
    success: true,
    clientId: client.id,
    firstName: client.firstName,
    lastName: client.lastName,
    totalPhotos: photos.length,
    sessions,
  });
}
