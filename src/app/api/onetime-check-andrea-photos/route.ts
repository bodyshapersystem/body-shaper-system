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
    select: { id: true, type: true, visibility: true, sessionNumber: true, uploadedAt: true },
  });

  const SESSION_SIZE = 4;
  const hasExplicit = photos.length > 0 && photos.every((p) => p.sessionNumber != null);
  let grouped: unknown;
  if (hasExplicit) {
    const bySession = new Map<number, typeof photos>();
    for (const p of photos) {
      const n = p.sessionNumber as number;
      if (!bySession.has(n)) bySession.set(n, []);
      bySession.get(n)!.push(p);
    }
    grouped = Array.from(bySession.entries()).sort((a, b) => a[0] - b[0]);
  } else {
    const sessions: (typeof photos)[] = [];
    for (let i = 0; i < photos.length; i += SESSION_SIZE) sessions.push(photos.slice(i, i + SESSION_SIZE));
    grouped = sessions;
  }

  return NextResponse.json({ success: true, clientId: client.id, hasExplicitSessionNumbers: hasExplicit, totalPhotos: photos.length, grouped });
}
