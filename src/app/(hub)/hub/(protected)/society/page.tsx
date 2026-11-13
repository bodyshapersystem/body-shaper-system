import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { getLevels } from "@/lib/society";
import HubSociety from "./HubSociety";
import "../proposals/hub-proposals.css";

export const dynamic = "force-dynamic";

export default async function HubSocietyPage() {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  if (!hasPermission(user, "payments.manage")) redirect("/hub/dashboard");

  const [participants, commissions, payouts, levels] = await Promise.all([
    prisma.societyParticipant.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { _count: { select: { visits: true, leads: true } } },
    }),
    prisma.societyCommission.findMany({ orderBy: { createdAt: "desc" }, take: 300, include: { participant: { select: { firstName: true, lastName: true } } } }),
    prisma.societyPayout.findMany({ orderBy: { requestedAt: "desc" }, take: 100, include: { participant: { select: { firstName: true, lastName: true } } } }),
    getLevels(),
  ]);

  const earned = new Map<string, { sales: number; owed: number; paid: number }>();
  for (const c of commissions) {
    const e = earned.get(c.participantId) ?? { sales: 0, owed: 0, paid: 0 };
    if (c.status !== "VOID") e.sales += 1;
    if (c.status === "PENDING" || c.status === "APPROVED") e.owed += c.amountCents;
    if (c.status === "PAID") e.paid += c.amountCents;
    earned.set(c.participantId, e);
  }

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">business</p>
        <h1>shaper society.</h1>
        <p className="dash-subtitle">Referral program with money commissions — participants, commissions, payouts and levels.</p>
      </div>
      <HubSociety
        participants={participants.map((p) => ({
          id: p.id,
          name: `${p.firstName} ${p.lastName ?? ""}`.trim(),
          email: p.email,
          phone: p.phone,
          instagram: p.instagram,
          note: p.applicationNote,
          code: p.code,
          type: p.type,
          status: p.status,
          discountCents: p.referralDiscountCents,
          percentOverride: p.percentOverride,
          notes: p.internalNotes,
          agreement: !!p.agreementAcceptedAt,
          payout: p.payoutMethod ? `${p.payoutMethod}: ${p.payoutHandle ?? ""}` : null,
          visits: p._count.visits,
          leads: p._count.leads,
          ...(earned.get(p.id) ?? { sales: 0, owed: 0, paid: 0 }),
        }))}
        commissions={commissions.map((c) => ({
          id: c.id,
          who: `${c.participant.firstName} ${c.participant.lastName ?? ""}`.trim(),
          description: c.description,
          baseCents: c.baseCents,
          percent: c.percent,
          amountCents: c.amountCents,
          status: c.status,
          inPayout: !!c.payoutId,
          createdAt: c.createdAt.toISOString(),
        }))}
        payouts={payouts.map((p) => ({
          id: p.id,
          who: `${p.participant.firstName} ${p.participant.lastName ?? ""}`.trim(),
          amountCents: p.amountCents,
          method: p.method,
          handle: p.handle,
          status: p.status,
          requestedAt: p.requestedAt.toISOString(),
        }))}
        levels={levels.map((l) => ({ name: l.name, minSales: l.minSales, percent: l.percent }))}
      />
    </div>
  );
}
