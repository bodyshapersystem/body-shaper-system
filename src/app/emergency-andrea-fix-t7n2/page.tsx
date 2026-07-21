import { fetchAndStoreJotformSubmissionPdf } from "@/lib/jotform-pdf";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA"; // same token as emergency-andrea-check-b8q3

// Andrea Trujillo's real, confirmed Almost Ready (Waiver) submission —
// her most recent of 3 attempts today, all with Email left blank (the
// exact bug fixed in api/webhooks/jotform-document/route.ts). This
// page processes that one real submission into the CONSENT_TREATMENT
// document she's genuinely earned, exactly as the webhook would have
// done had her email come through. One-time use, not a general tool.
const CLIENT_ID = "cmrtfsgbe0003jp04h57dkoji";
const FORM_ID = "230686448903161";
const SUBMISSION_ID = "6604637694411968543";

export default async function EmergencyAndreaFixPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const client = await prisma.client.findUnique({ where: { id: CLIENT_ID } });
  if (!client) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Client not found — nothing changed.</div>;
  }

  const existing = await prisma.document.findFirst({ where: { clientId: CLIENT_ID, category: "CONSENT_TREATMENT" } });
  if (existing) {
    return (
      <div style={{ padding: 40, fontFamily: "monospace" }}>
        Already has a CONSENT_TREATMENT document ({existing.title}, uploaded {existing.uploadedAt.toISOString()}) — nothing changed. Safe: this page never creates a duplicate.
      </div>
    );
  }

  const result = await fetchAndStoreJotformSubmissionPdf({
    clientId: CLIENT_ID,
    jotformFormId: FORM_ID,
    jotformSubmissionId: SUBMISSION_ID,
    title: "Consent for Treatment.pdf",
    category: "CONSENT_TREATMENT",
  });

  if (!result.success) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Failed: {result.error}</div>;
  }

  await createNotification({
    clientId: CLIENT_ID,
    category: "FORMS",
    description: `${client.firstName} ${client.lastName} signed their Waiver Form (recovered manually after the blank-email bug)`,
    linkUrl: `/hub/clients/${CLIENT_ID}?tab=documents`,
  });

  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      Done. Created document {result.documentId} for {client.firstName} {client.lastName}. Her onboarding should now show
      isComplete: true — check /emergency-andrea-check-b8q3?token={SECRET} to confirm, then her portal should unlock on
      next load.
    </div>
  );
}
