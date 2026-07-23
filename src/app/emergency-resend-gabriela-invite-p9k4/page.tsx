import { prisma } from "@/lib/prisma";
import { sendWelcomeActivationEmail } from "@/lib/email/service";
import { randomUUID } from "crypto";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";
const SITE_URL = "https://www.bodyshapersystem.com";
const GABRIELA_CLIENT_ID = "cmrtjfdeb0007ih04c5hp3h0s";

export default async function EmergencyResendGabrielaInvitePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const client = await prisma.client.findUnique({
    where: { id: GABRIELA_CLIENT_ID },
    include: { user: true, portalInvite: true },
  });

  if (!client) return <div style={{ padding: 40, fontFamily: "monospace" }}>Client not found.</div>;
  if (client.user.portalStatus === "ACTIVE") {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Already activated — nothing to resend.</div>;
  }
  if (!client.portalInvite) return <div style={{ padding: 40, fontFamily: "monospace" }}>No invitation record exists for this client at all.</div>;

  let { token: inviteToken, expiresAt } = client.portalInvite;
  const wasExpired = expiresAt < new Date();
  if (wasExpired) {
    inviteToken = randomUUID();
    expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await prisma.portalInvitation.update({
      where: { id: client.portalInvite.id },
      data: { token: inviteToken, expiresAt },
    });
  }

  const activationUrl = `${SITE_URL}/portal/activate?token=${inviteToken}`;
  const result = await sendWelcomeActivationEmail({
    clientId: client.id,
    firstName: client.firstName,
    email: client.email,
    activationUrl,
    invitationId: client.portalInvite.id,
  });

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      Regenerated link: {wasExpired ? "yes (old one was expired)" : "no (existing one was still valid)"}
      {"\n"}
      New expiry: {expiresAt.toISOString()}
      {"\n"}
      Sending to: {client.email}
      {"\n\n"}
      Send result: {JSON.stringify(result)}
    </div>
  );
}
