import { prisma } from "@/lib/prisma";
import { sendSocietyWelcomeEmail } from "@/lib/email/service";

const SECRET = "VY-76TdXm7gjYH__40CfNQ";

export default async function EmergencySendSocietyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const client = await prisma.client.findFirst({
    where: { firstName: { contains: "Michelle", mode: "insensitive" } },
  });

  if (!client) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>No client named "Michelle" found.</div>;
  }

  const result = await sendSocietyWelcomeEmail({
    clientId: client.id,
    firstName: client.firstName,
    email: client.email,
    portalUrl: "https://www.bodyshapersystem.com/portal/rewards",
  });

  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      {result.success ? (
        <>Sent the Society Welcome email to {client.firstName} {client.lastName} ({client.email}).</>
      ) : (
        <>Failed to send: {JSON.stringify(result)}</>
      )}
    </div>
  );
}
