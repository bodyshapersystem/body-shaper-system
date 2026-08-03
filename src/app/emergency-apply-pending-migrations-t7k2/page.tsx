import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";

export default async function EmergencyApplyPendingMigrationsPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const lines: string[] = [];

  // 1. priorCompletedSessions column
  const colExists: { column_name: string }[] = await prisma.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'blueprint_assessments' AND column_name = 'priorCompletedSessions'`
  );
  if (colExists.length > 0) {
    lines.push("priorCompletedSessions column: already exists.");
  } else {
    await prisma.$executeRawUnsafe(`ALTER TABLE "blueprint_assessments" ADD COLUMN "priorCompletedSessions" INTEGER NOT NULL DEFAULT 0`);
    lines.push("priorCompletedSessions column: applied.");
  }

  // 2. NEW_PROGRESS_PHOTOS enum value
  const enumValues: { enumlabel: string }[] = await prisma.$queryRawUnsafe(
    `SELECT enumlabel FROM pg_enum WHERE enumtypid = 'public."EmailTemplate"'::regtype ORDER BY enumsortorder`
  );
  if (enumValues.some((e) => e.enumlabel === "NEW_PROGRESS_PHOTOS")) {
    lines.push("NEW_PROGRESS_PHOTOS enum value: already exists.");
  } else {
    await prisma.$executeRawUnsafe(`ALTER TYPE "EmailTemplate" ADD VALUE 'NEW_PROGRESS_PHOTOS'`);
    lines.push("NEW_PROGRESS_PHOTOS enum value: applied.");
  }

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      {lines.join("\n")}
    </div>
  );
}
