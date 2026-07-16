import { prisma } from "@/lib/prisma";

/**
 * Real onboarding gate — checks the real signed documents that
 * already exist in this system (created by the real Jotform webhooks,
 * with real e-signatures, not a simplified in-app checkbox):
 *   Step 1: "Prepare Your Experience™" -> Document.category = POLICIES_APPOINTMENTS
 *   Step 2: "Almost Ready™" (Waiver)   -> Document.category = CONSENT_TREATMENT
 *   Step 3 (Ambassadors only): Content Release Agreement -> Document.category = PHOTOGRAPHY_AUTHORIZATION
 * The Content Release Agreement's own Jotform form doesn't exist yet
 * (per direction: "do not build the form yet, prepare the workflow") -
 * until it does, the Owner can satisfy this step by uploading the
 * signed document manually via the existing Documents upload flow,
 * same as any other document category.
 */
export async function getOnboardingStatus(clientId: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId }, select: { clientType: true } });
  const isAmbassador = client?.clientType === "AMBASSADOR";

  const [agreementDoc, consentDoc, releaseDoc] = await Promise.all([
    prisma.document.findFirst({ where: { clientId, category: "POLICIES_APPOINTMENTS" } }),
    prisma.document.findFirst({ where: { clientId, category: "CONSENT_TREATMENT" } }),
    isAmbassador ? prisma.document.findFirst({ where: { clientId, category: "PHOTOGRAPHY_AUTHORIZATION" } }) : Promise.resolve(null),
  ]);

  const agreementComplete = !!agreementDoc;
  const consentComplete = !!consentDoc;
  const releaseComplete = !isAmbassador || !!releaseDoc;

  return {
    agreementComplete,
    consentComplete,
    releaseComplete,
    isAmbassador,
    isComplete: agreementComplete && consentComplete && releaseComplete,
    currentStep: !agreementComplete ? 1 : !consentComplete ? 2 : !releaseComplete ? 3 : 4,
  };
}
