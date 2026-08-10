import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time diagnostic: list Diana Escalante's photos in the exact
// order/chunking the Progress Photos page uses, to see why today's
// upload isn't landing as "Session 3". Read-only.
export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Diana", mode: "insensitive" }, lastName: { equals: "Escalante", mode: "insensitive" } },
  });
  if (!client) return NextResponse.json({ success: false, error: "Diana Escalante not found" });

  const photos = await prisma.photo.findMany({
    where: { clientId: client.id },
    orderBy: { uploadedAt: "asc" },
    select: { id: true, type: true, visibility: true, uploadedAt: true, takenAt: true },
  });

  const SESSION_SIZE = 4;
  const sessions: (typeof photos)[] = [];
  for (let i = 0; i < photos.length; i += SESSION_SIZE) {
    sessions.push(photos.slice(i, i + SESSION_SIZE));
  }

  return NextResponse.json({ success: true, clientId: client.id, totalPhotos: photos.length, sessions });
}
