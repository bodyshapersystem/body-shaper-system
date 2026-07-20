import { prisma } from "@/lib/prisma";

/**
 * Real onboarding gate — checks the real signed documents that
 * already exist in this system (created by the real Jotform webhooks,
 * with real e-signatures, not a simplified in-app checkbox):
 *   Step 1: "Prepare Your Experience™" -> Document.category = POLICIES_APPOINTMENTS
 *   Step 2: "Almost Ready™" (Waiver)   -> Document.category = CONSENT_TREATMENT
 *   Step 3 (only when it genuinely applies): Content Release Agreement
 *   -> PHOTOGRAPHY_AUTHORIZATION
 *
 * Per direction: NOT every Ambassador needs the Content Release
 * Agreement — some are collab-only and don't need it, while other
 * real Ambassadors do. Gated by the real per-client
 * Client.requiresContentRelease flag (defaults to false for
 * everyone, including all existing clients), not just clientType —
 * the Owner turns it on specifically for the clients who actually
 * need it.
 */
export async function getOnboardingStatus(clientId: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId }, select: { clientType: true, requiresContentRelease: true } });
  const isAmbassador = client?.clientType === "AMBASSADOR";
  const needsRelease = !!client?.requiresContentRelease;

  const [agreementDoc, consentDoc, releaseDoc] = await Promise.all([
    prisma.document.findFirst({ where: { clientId, category: "POLICIES_APPOINTMENTS" } }),
    prisma.document.findFirst({ where: { clientId, category: "CONSENT_TREATMENT" } }),
    needsRelease ? prisma.document.findFirst({ where: { clientId, category: "PHOTOGRAPHY_AUTHORIZATION" } }) : Promise.resolve(null),
  ]);

  const agreementComplete = !!agreementDoc;
  const consentComplete = !!consentDoc;
  const releaseComplete = !needsRelease || !!releaseDoc;

  return {
    agreementComplete,
    consentComplete,
    releaseComplete,
    isAmbassador,
    needsRelease,
    isComplete: agreementComplete && consentComplete && releaseComplete,
    currentStep: !agreementComplete ? 1 : !consentComplete ? 2 : !releaseComplete ? 3 : 4,
  };
}
