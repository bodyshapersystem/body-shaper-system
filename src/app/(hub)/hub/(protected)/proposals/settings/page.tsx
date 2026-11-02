import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { getProposalSettings } from "@/lib/proposals/server";
import { COPY } from "@/lib/proposals/copy";
import SettingsForm from "./SettingsForm";
import "../hub-proposals.css";

export const dynamic = "force-dynamic";

export default async function ProposalSettingsPage() {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  if (!hasPermission(user, "payments.manage")) redirect("/hub/dashboard");
  const s = await getProposalSettings();
  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow"><Link href="/hub/proposals">client proposals</Link></p>
        <h1>founder & seasonal offer.</h1>
        <p className="dash-subtitle">Shared by every proposal.</p>
      </div>
      <SettingsForm
        initial={{
          founderTitle: s?.founderTitle ?? "the vision behind body shaper system™",
          founderBio: s?.founderBio ?? COPY.en.founderDefaultBio,
          founderBioEs: s?.founderBioEs ?? COPY.es.founderDefaultBio,
          activeCampaign: s ? s.activeCampaign : "holiday_333",
          assessmentDollars: (s?.assessmentCents ?? 35000) / 100,
        }}
      />
    </div>
  );
}
