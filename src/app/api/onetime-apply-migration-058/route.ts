import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "peptideJourneyInviteSentAt" TIMESTAMP(3);`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "peptideJourneyInviteSentByName" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TYPE "EmailTemplate" ADD VALUE IF NOT EXISTS 'PEPTIDE_JOURNEY_INVITE';`);
    const check = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'clients' AND column_name IN ('peptideJourneyInviteSentAt','peptideJourneyInviteSentByName');
    `);
    return NextResponse.json({ success: true, columns: check });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
