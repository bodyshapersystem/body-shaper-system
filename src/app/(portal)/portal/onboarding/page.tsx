import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import { getOnboardingStatus } from "@/lib/onboarding";
import OnboardingFlow from "./OnboardingFlow";

export const dynamic = "force-dynamic";

// Real signed-document links (same forms already wired to the real
// Jotform webhooks — genuine e-signatures, not a simplified checkbox).
const AGREEMENT_FORM_URL = "https://form.jotform.com/261860243106046"; // "Prepare Your Experience™"
const AMBASSADOR_AGREEMENT_FORM_URL = "https://form.jotform.com/262157878805066"; // "Prepare Your Experience™ — Ambassador" (shorter intake)
const WAIVER_FORM_BASE_URL = "https://form.jotform.com/beautyboxmia/waiver---release-form"; // "Almost Ready™" — same waiver for every client type

export default async function PortalOnboardingPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const status = await getOnboardingStatus(client.id);
  if (status.isComplete) redirect("/portal/dashboard");

  const agreementUrl = client.clientType === "AMBASSADOR" ? AMBASSADOR_AGREEMENT_FORM_URL : AGREEMENT_FORM_URL;

  return (
    <div className="onb-shell">
      <OnboardingFlow
        firstName={client.firstName}
        initialStep={status.currentStep as 1 | 2 | 3}
        agreementUrl={agreementUrl}
        consentUrl={`${WAIVER_FORM_BASE_URL}?email=${encodeURIComponent(client.email)}`}
        totalSteps={status.needsRelease ? 3 : 2}
      />
    </div>
  );
}
