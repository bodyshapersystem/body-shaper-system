import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const photoId = request.nextUrl.searchParams.get("photoId");
  if (!photoId) return NextResponse.json({ success: false, error: "photoId required" });

  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) return NextResponse.json({ success: false, error: "not found" });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from("client-documents").download(photo.storagePath);
  if (error || !data) return NextResponse.json({ success: false, error: error?.message ?? "download failed" });

  const buffer = Buffer.from(await data.arrayBuffer());
  return NextResponse.json({ success: true, base64: buffer.toString("base64") });
}
