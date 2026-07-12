import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const doc = await prisma.document.findUnique({ where: { id: "cmri8cnyv0001l5043689sg8h" } });
  if (!doc) return NextResponse.json({ error: "document not found" });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from("client-documents").createSignedUrl(doc.storagePath, 60 * 10);

  return NextResponse.json({
    storagePath: doc.storagePath,
    visibility: doc.visibility,
    signedUrlError: error?.message ?? null,
    signedUrl: data?.signedUrl ?? null,
  });
}
