import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";
const GABRIELA_CLIENT_ID = "cmrtjfdeb0007ih04c5hp3h0s";

export default async function EmergencyCheckGabrielaInvitePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const invites = await prisma.portalInvitation.findMany({
    where: { clientId: GABRIELA_CLIENT_ID },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      {invites.length} invitation(s) found:
      {"\n\n"}
      {invites.map(
        (i) =>
          `id: ${i.id}\ntoken: ${i.token}\ncreatedAt: ${i.createdAt.toISOString()}\nexpiresAt: ${i.expiresAt.toISOString()} (${i.expiresAt < now ? "EXPIRED" : "still valid"})\nacceptedAt: ${i.acceptedAt ? i.acceptedAt.toISOString() : "NEVER ACCEPTED"}\n\n`
      )}
    </div>
  );
}
