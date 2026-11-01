import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { RESULT_CASES, WELCOME_VIDEO_SRC } from "@/lib/proposals/server";
import ProposalBuilder from "../ProposalBuilder";
import "../hub-proposals.css";

export const dynamic = "force-dynamic";

export default async function NewProposalPage() {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  if (!hasPermission(user, "payments.manage")) redirect("/hub/dashboard");
  const clients = await prisma.client.findMany({ where: { archivedAt: null }, orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true, city: true } });
  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow"><Link href="/hub/proposals">client proposals</Link></p>
        <h1>new proposal.</h1>
      </div>
      <ProposalBuilder
        initial={null}
        clients={clients.map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName}`, firstName: c.firstName, city: c.city }))}
        resultCases={RESULT_CASES.map((c) => ({ id: c.id, label: c.label + (c.kind === "card" && c.id.includes("side") ? " (side)" : "") }))}
        videoAvailable={!!WELCOME_VIDEO_SRC}
      />
    </div>
  );
}
