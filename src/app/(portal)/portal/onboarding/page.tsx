import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import { getOnboardingStatus } from "@/lib/onboarding";
import OnboardingFlow from "./OnboardingFlow";

export const dynamic = "force-dynamic";


export default async function PortalOnboardingPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const status = await getOnboardingStatus(client.id);
  if (status.isComplete) redirect("/portal/dashboard");

  const agreementUrl = "/portal/onboarding/prepare";

  return (
    <div className="onb-shell">
      <OnboardingFlow
        firstName={client.firstName}
        initialStep={status.currentStep as 1 | 2 | 3}
        agreementUrl={agreementUrl}
        consentUrl="/portal/onboarding/almost-done"
        totalSteps={status.needsRelease ? 3 : 2}
      />
    </div>
  );
}
