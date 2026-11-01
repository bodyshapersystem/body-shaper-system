import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { buildProposalView } from "@/lib/proposals/server";
import ProposalExperience from "@/components/proposals/ProposalExperience";
import "@/components/proposals/proposal.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Owner preview: same master template, checkout disabled, does not count as a client view. */
export default async function ProposalPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  if (!hasPermission(user, "payments.manage")) redirect("/hub/dashboard");
  const { id } = await params;
  const p = await prisma.clientProposal.findUnique({ where: { id } });
  if (!p) notFound();
  const view = await buildProposalView(p, { sample: true });
  return <ProposalExperience view={view} />;
}
