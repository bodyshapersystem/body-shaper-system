import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Andrea", mode: "insensitive" }, lastName: { equals: "Trujillo", mode: "insensitive" } },
  });
  if (!client) return NextResponse.json({ success: false, error: "not found" });

  const photo = await prisma.photo.findFirst({
    where: { clientId: client.id, type: "LEFT", visibility: "INTERNAL_ONLY" },
    orderBy: { uploadedAt: "desc" },
  });
  if (!photo) return NextResponse.json({ success: false, error: "No INTERNAL_ONLY LEFT photo found" });

  await prisma.photo.update({ where: { id: photo.id }, data: { visibility: "CLIENT_VISIBLE" } });

  return NextResponse.json({ success: true, photoId: photo.id });
}
