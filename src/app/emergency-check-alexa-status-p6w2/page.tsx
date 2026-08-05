import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";
const ALEXA_CLIENT_ID = "cmsdqttxm0003jr04vjvawhzf";

export default async function EmergencyCheckAlexaStatusPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const client = await prisma.client.findUnique({
    where: { id: ALEXA_CLIENT_ID },
    include: { user: true, portalInvite: true },
  });

  if (!client) return <div style={{ padding: 40, fontFamily: "monospace" }}>Client not found.</div>;

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      email: {client.email}
      {"\n"}
      portalStatus: {client.user.portalStatus}
      {"\n"}
      invite.acceptedAt: {client.portalInvite?.acceptedAt?.toISOString() ?? "NOT ACCEPTED"}
      {"\n"}
      invite.expiresAt: {client.portalInvite?.expiresAt.toISOString() ?? "n/a"}
    </div>
  );
}
