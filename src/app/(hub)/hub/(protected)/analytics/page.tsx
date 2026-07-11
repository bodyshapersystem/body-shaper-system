import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function HubAnalyticsPage() {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");

  const [
    totalLeads,
    convertedLeads,
    totalClients,
    activeAppointments,
    paidPayments,
    pendingPayments,
    totalAssessments,
    validatedAssessments,
  ] = await Promise.all([
    prisma.lead.count({ where: { archivedAt: null } }),
    prisma.lead.count({ where: { status: "CONVERTED" } }),
    prisma.client.count({ where: { archivedAt: null } }),
    prisma.appointment.count({ where: { status: "SCHEDULED" } }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amountCents: true } }),
    prisma.payment.aggregate({ where: { status: "PENDING" }, _sum: { amountCents: true } }),
    prisma.blueprintAssessment.count({ where: { clientId: { not: null } } }),
    prisma.blueprintAssessment.count({ where: { status: "VALIDATED" } }),
  ]);

  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0.0";
  const money = (cents: number | null) => `$${(((cents ?? 0) as number) / 100).toFixed(2)}`;

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Business</p>
        <h1>analytics.</h1>
      </div>

      <div className="pd-stats">
        <div className="pd-stat">
          <span className="pd-stat-label">Lead → Client Conversion</span>
          <strong>{conversionRate}%</strong>
          <span className="pd-stat-sub">{convertedLeads} of {totalLeads} leads</span>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Active Clients</span>
          <strong>{totalClients}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Scheduled Appointments</span>
          <strong>{activeAppointments}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Revenue Collected</span>
          <strong>{money(paidPayments._sum.amountCents)}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Revenue Pending</span>
          <strong>{money(pendingPayments._sum.amountCents)}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Blueprint Assessments Validated</span>
          <strong>{validatedAssessments}</strong>
          <span className="pd-stat-sub">of {totalAssessments} total</span>
        </div>
      </div>
    </div>
  );
}
