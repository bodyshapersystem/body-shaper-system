import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";
import LeadStatusForm from "./LeadStatusForm";
import LeadConversionPanel from "./LeadConversionPanel";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "leads.view")) {
    redirect("/hub/dashboard");
  }

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      statusHistory: { orderBy: { changedAt: "desc" }, include: { changedBy: true } },
      convertedClient: true,
    },
  });

  if (!lead) notFound();

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Leads</p>
        <h1>
          {lead.firstName} {lead.lastName}
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 720, marginBottom: 32 }}>
        <div>
          <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>Email</strong>
          {lead.email}
        </div>
        <div>
          <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>Phone</strong>
          {lead.phone ?? "—"}
        </div>
        <div>
          <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>City</strong>
          {lead.city ?? "—"}
        </div>
        <div>
          <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>Source</strong>
          {lead.source ?? "—"}
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>Goals</strong>
          {lead.goals ?? "—"}
        </div>
      </div>

      {hasPermission(user, "leads.edit") && <LeadStatusForm leadId={lead.id} currentStatus={lead.status} />}

      <div style={{ marginTop: 32 }}>
        <LeadConversionPanel
          leadId={lead.id}
          currentPaymentStatus={lead.paymentStatus}
          canEdit={hasPermission(user, "leads.edit")}
          canConvert={hasPermission(user, "clients.convert")}
          alreadyConvertedClientId={lead.convertedClient?.id ?? null}
        />
      </div>

      <h2 style={{ marginTop: 40, fontSize: 16 }}>Timeline</h2>
      <ul style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        {lead.statusHistory.map((entry) => (
          <li key={entry.id} style={{ fontSize: 13 }}>
            <strong>{entry.toStatus.replace(/_/g, " ")}</strong>
            {entry.fromStatus && <> (from {entry.fromStatus.replace(/_/g, " ")})</>} —{" "}
            {entry.changedAt.toLocaleString()}
            {entry.changedBy && <> by {entry.changedBy.fullName}</>}
            {entry.note && <div style={{ opacity: 0.6 }}>{entry.note}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
