import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Alexa", mode: "insensitive" }, lastName: { equals: "Olavarria", mode: "insensitive" } },
  });
  if (!client) return NextResponse.json({ success: false, error: "not found" });

  const photos = await prisma.photo.findMany({
    where: { clientId: client.id },
    orderBy: { uploadedAt: "asc" },
    select: { id: true, type: true, sessionNumber: true, storagePath: true, uploadedAt: true },
  });

  const admin = createSupabaseAdminClient();
  const withUrls = await Promise.all(
    photos.map(async (p) => {
      const { data } = await admin.storage.from("client-documents").createSignedUrl(p.storagePath, 3600);
      return { ...p, url: data?.signedUrl ?? null };
    })
  );

  return NextResponse.json({ success: true, photos: withUrls });
}
