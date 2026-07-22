import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";

export default async function EmergencyApplyPaymentReminderEnumPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  // Check current enum values first, since Postgres errors (rather
  // than no-ops) if you try to ADD VALUE an already-existing label.
  const existing: { enumlabel: string }[] = await prisma.$queryRawUnsafe(
    `SELECT enumlabel FROM pg_enum WHERE enumtypid = 'public."EmailTemplate"'::regtype ORDER BY enumsortorder`
  );

  if (existing.some((e) => e.enumlabel === "PAYMENT_REMINDER")) {
    return (
      <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
        Already applied — nothing to do.
        {"\n\n"}
        Current EmailTemplate values: {existing.map((e) => e.enumlabel).join(", ")}
      </div>
    );
  }

  await prisma.$executeRawUnsafe(`ALTER TYPE "EmailTemplate" ADD VALUE 'PAYMENT_REMINDER'`);

  const after: { enumlabel: string }[] = await prisma.$queryRawUnsafe(
    `SELECT enumlabel FROM pg_enum WHERE enumtypid = 'public."EmailTemplate"'::regtype ORDER BY enumsortorder`
  );

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      Applied. EmailTemplate now has: {after.map((e) => e.enumlabel).join(", ")}
    </div>
  );
}
