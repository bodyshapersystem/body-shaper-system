import { prisma } from "@/lib/prisma";

/**
 * Real onboarding gate — checks the two real signed documents that
 * already exist in this system (created by the real Jotform webhooks,
 * with real e-signatures, not a simplified in-app checkbox):
 *   Step 1: "Prepare Your Experience™" -> Document.category = POLICIES_APPOINTMENTS
 *   Step 2: "Almost Ready™" (Waiver)   -> Document.category = CONSENT_TREATMENT
 * A client's onboarding is complete only when both real documents
 * exist for them.
 */
export async function getOnboardingStatus(clientId: string) {
  const [agreementDoc, consentDoc] = await Promise.all([
    prisma.document.findFirst({ where: { clientId, category: "POLICIES_APPOINTMENTS" } }),
    prisma.document.findFirst({ where: { clientId, category: "CONSENT_TREATMENT" } }),
  ]);

  const agreementComplete = !!agreementDoc;
  const consentComplete = !!consentDoc;

  return {
    agreementComplete,
    consentComplete,
    isComplete: agreementComplete && consentComplete,
    currentStep: !agreementComplete ? 1 : !consentComplete ? 2 : 3,
  };
}
