import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";

export default async function EmergencyApplyFirstSessionCheckinEnumPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const existing: { enumlabel: string }[] = await prisma.$queryRawUnsafe(
    `SELECT enumlabel FROM pg_enum WHERE enumtypid = 'public."EmailTemplate"'::regtype ORDER BY enumsortorder`
  );

  if (existing.some((e) => e.enumlabel === "FIRST_SESSION_CHECKIN")) {
    return (
      <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
        Already applied — nothing to do.
        {"\n\n"}
        Current EmailTemplate values: {existing.map((e) => e.enumlabel).join(", ")}
      </div>
    );
  }

  await prisma.$executeRawUnsafe(`ALTER TYPE "EmailTemplate" ADD VALUE 'FIRST_SESSION_CHECKIN'`);

  const after: { enumlabel: string }[] = await prisma.$queryRawUnsafe(
    `SELECT enumlabel FROM pg_enum WHERE enumtypid = 'public."EmailTemplate"'::regtype ORDER BY enumsortorder`
  );

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      Applied. EmailTemplate now has: {after.map((e) => e.enumlabel).join(", ")}
    </div>
  );
}
