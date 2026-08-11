import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Adriana", mode: "insensitive" }, lastName: { equals: "Rojas", mode: "insensitive" } },
  });
  if (!client) return NextResponse.json({ success: false, error: "not found" });

  const photos = await prisma.photo.findMany({
    where: { clientId: client.id, visibility: "CLIENT_VISIBLE" },
    orderBy: { uploadedAt: "desc" },
    take: 4,
  });

  const admin = createSupabaseAdminClient();
  const out: { type: string; base64: string; mimeType: string }[] = [];
  for (const p of photos) {
    const { data, error } = await admin.storage.from("client-documents").download(p.storagePath);
    if (error || !data) continue;
    const buf = Buffer.from(await data.arrayBuffer());
    out.push({ type: p.type, base64: buf.toString("base64"), mimeType: data.type || "image/jpeg" });
  }

  return NextResponse.json({ success: true, photos: out });
}
