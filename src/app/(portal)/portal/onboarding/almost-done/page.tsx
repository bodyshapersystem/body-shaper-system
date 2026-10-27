import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import { getOnboardingStatus } from "@/lib/onboarding";
export const dynamic = "force-dynamic";
export default async function AlmostDonePage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");
  const status = await getOnboardingStatus(client.id);
  if (status.isComplete) redirect("/portal/dashboard");
  if (!status.agreementComplete) redirect("/portal/onboarding/prepare");
  return <main className="onb-shell"><section className="onb-card"><p className="onb-eyebrow">BODY SHAPER SYSTEM™</p><h1 className="onb-title">Almost Done™</h1><p className="onb-sub">Medical Consent &amp; Treatment Waiver</p><p>We are preparing a secure, first-party consent experience. Your portal remains locked until you have reviewed and signed the complete, verified medical waiver.</p><a className="onb-cta" href="/portal/onboarding">Return to required consent</a></section></main>;
}
