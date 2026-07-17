import { prisma } from "@/lib/prisma";

/**
 * Real onboarding gate — checks the real signed documents that
 * already exist in this system (created by the real Jotform webhooks,
 * with real e-signatures, not a simplified in-app checkbox):
 *   Step 1: "Prepare Your Experience™" -> Document.category = POLICIES_APPOINTMENTS
 *   Step 2: "Almost Ready™" (Waiver)   -> Document.category = CONSENT_TREATMENT
 * Ambassadors will eventually have a required Step 3 (Content Release
 * Agreement -> PHOTOGRAPHY_AUTHORIZATION), but per direction that form
 * doesn't exist in Jotform yet — left OPEN/non-blocking for now so
 * Ambassador onboarding isn't stuck waiting on a form that can't be
 * completed. Once the real form is built, flip
 * REQUIRE_RELEASE_FOR_AMBASSADORS to true to enforce it.
 */
const REQUIRE_RELEASE_FOR_AMBASSADORS = false;

export async function getOnboardingStatus(clientId: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId }, select: { clientType: true } });
  const isAmbassador = client?.clientType === "AMBASSADOR";

  const [agreementDoc, consentDoc, releaseDoc] = await Promise.all([
    prisma.document.findFirst({ where: { clientId, category: "POLICIES_APPOINTMENTS" } }),
    prisma.document.findFirst({ where: { clientId, category: "CONSENT_TREATMENT" } }),
    isAmbassador && REQUIRE_RELEASE_FOR_AMBASSADORS ? prisma.document.findFirst({ where: { clientId, category: "PHOTOGRAPHY_AUTHORIZATION" } }) : Promise.resolve(null),
  ]);

  const agreementComplete = !!agreementDoc;
  const consentComplete = !!consentDoc;
  const releaseComplete = !isAmbassador || !REQUIRE_RELEASE_FOR_AMBASSADORS || !!releaseDoc;

  return {
    agreementComplete,
    consentComplete,
    releaseComplete,
    isAmbassador,
    isComplete: agreementComplete && consentComplete && releaseComplete,
    currentStep: !agreementComplete ? 1 : !consentComplete ? 2 : !releaseComplete ? 3 : 4,
  };
}
