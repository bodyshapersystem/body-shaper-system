import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";

export default async function EmergencyApplySkipEmailsColumnPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const existing: { column_name: string }[] = await prisma.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'skipAutomatedEmails'`
  );

  if (existing.length > 0) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Column already exists — nothing to do.</div>;
  }

  await prisma.$executeRawUnsafe(`ALTER TABLE "appointments" ADD COLUMN "skipAutomatedEmails" BOOLEAN NOT NULL DEFAULT false`);

  const after: { column_name: string }[] = await prisma.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'skipAutomatedEmails'`
  );

  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      Applied: {after.length > 0 ? "column now exists on appointments" : "something went wrong"}
    </div>
  );
}
