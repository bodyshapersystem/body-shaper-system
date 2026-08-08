import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: applies migration 00000000000043_system_completion_landing_page
// (Vercel's build only runs `prisma generate`, not `prisma migrate deploy`,
// so new columns need to be applied manually). Idempotent — safe to hit
// more than once. Delete this route after confirming success.
export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "completionHighlights" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "completionPhotoUrls" JSONB;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "nextSystemName" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "nextSystemProposal" TEXT;`);

    const check = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'blueprint_assessments'
        AND column_name IN ('completionHighlights','completionPhotoUrls','nextSystemName','nextSystemProposal');
    `);

    return NextResponse.json({ success: true, columns: check });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
