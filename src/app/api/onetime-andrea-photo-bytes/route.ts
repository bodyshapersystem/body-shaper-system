import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

// One-time: returns a single Photo's bytes as base64, scoped to Andrea
// Trujillo's client id for safety (won't serve any other client's
// photo even if an id is guessed). Used to pull her session 1 / session
// 2 photos out for a before/after composite — never committed to git,
// just read here and processed locally.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const photoId = searchParams.get("id");
  if (!photoId) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });

  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) return NextResponse.json({ success: false, error: "Photo not found" }, { status: 404 });

  const client = await prisma.client.findUnique({ where: { id: photo.clientId } });
  if (!client || client.firstName?.toLowerCase() !== "andrea" || client.lastName?.toLowerCase() !== "trujillo") {
    return NextResponse.json({ success: false, error: "Not authorized for this photo" }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from("client-documents").download(photo.storagePath);
  if (error || !data) {
    return NextResponse.json({ success: false, error: error?.message ?? "Download failed" }, { status: 500 });
  }

  const arrayBuffer = await data.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = data.type || "image/jpeg";

  return NextResponse.json({ success: true, base64, mimeType, type: photo.type, uploadedAt: photo.uploadedAt });
}
