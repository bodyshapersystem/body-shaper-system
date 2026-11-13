import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { sendSocietyCommissionEmail } from "@/lib/email/service";

/**
 * Shaper Society — referral program with money commissions.
 *
 * Attribution: FIRST valid referral within 30 days. /r/CODE records a
 * server-side visit and sets a 30-day cookie; it never overwrites a
 * still-valid referral from someone else. When a lead is created, the
 * cookie is attached to that lead (never self-referrals).
 *
 * Commission: created once per proposal, when the program is paid in
 * full (pay-in-full, or both installments of a split plan). Amount =
 * level % (by the participant's paid-referral count) × what the client
 * actually paid for the program. Starts PENDING; the owner approves it
 * in the Hub; it becomes PAID when included in a payout.
 */

export const SOCIETY_NAME = "Shaper Society";
export const AGREEMENT_VERSION = "2026-11-13-v1";
export const ATTRIBUTION_DAYS = 30;
export const REF_COOKIE = "bss_ref"; // "<participantId>.<visitId>"
export const VISITOR_COOKIE = "bss_vid";
export const MIN_PAYOUT_CENTS = 5000;

export const DEFAULT_LEVELS = [
  { sort: 1, name: "Level I", minSales: 1, percent: 5 },
  { sort: 2, name: "Level II", minSales: 6, percent: 8 },
  { sort: 3, name: "Level III", minSales: 11, percent: 10 },
  { sort: 4, name: "Level IV", minSales: 21, percent: 12 },
];

export function normalizeCode(raw: string) {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24);
}

export async function generateUniqueCode(firstName: string) {
  const base = normalizeCode(firstName).replace(/-/g, "").slice(0, 10) || "SHAPER";
  for (let i = 0; i < 20; i++) {
    const code = i === 0 ? base : `${base}${Math.floor(10 + Math.random() * 990)}`;
    if (code.length >= 3 && !(await prisma.societyParticipant.findUnique({ where: { code } }))) return code;
  }
  return `${base}${Date.now().toString(36).toUpperCase().slice(-5)}`;
}

export async function getLevels() {
  const rows = await prisma.societyLevel.findMany({ orderBy: { minSales: "asc" } });
  return rows.length > 0 ? rows : DEFAULT_LEVELS;
}

export function levelFor(levels: { name: string; minSales: number; percent: number }[], saleNumber: number) {
  const sorted = [...levels].sort((a, b) => a.minSales - b.minSales);
  let current = sorted[0];
  for (const l of sorted) if (saleNumber >= l.minSales) current = l;
  const next = sorted.find((l) => l.minSales > saleNumber) ?? null;
  return { current, next };
}

/** Paid referrals so far (non-void commissions). */
export async function paidReferralCount(participantId: string) {
  return prisma.societyCommission.count({ where: { participantId, status: { not: "VOID" } } });
}

/* ---------------- attribution ---------------- */

export async function readReferralCookie(): Promise<{ participantId: string; visitId: string } | null> {
  try {
    const jar = await cookies();
    const raw = jar.get(REF_COOKIE)?.value;
    if (!raw) return null;
    const [participantId, visitId] = raw.split(".");
    if (!participantId || !visitId) return null;
    const visit = await prisma.societyVisit.findUnique({ where: { id: visitId } });
    if (!visit || visit.participantId !== participantId) return null;
    if (Date.now() - visit.visitedAt.getTime() > ATTRIBUTION_DAYS * 86400000) return null;
    const p = await prisma.societyParticipant.findUnique({ where: { id: participantId } });
    if (!p || p.status !== "ACTIVE") return null;
    return { participantId, visitId };
  } catch {
    return null; // outside a request (cron / webhook) — no cookie to read
  }
}

/**
 * Attach the visitor's referral (if any) to a newly created lead.
 * Safe to call from any lead-creating server action / route; never
 * throws and never overrides an existing attribution.
 */
export async function attachSocietyReferralToLead(leadId: string) {
  try {
    const ref = await readReferralCookie();
    if (!ref) return;
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead || lead.societyParticipantId) return;
    const participant = await prisma.societyParticipant.findUnique({ where: { id: ref.participantId }, include: { client: true } });
    if (!participant) return;
    // no self-referrals
    if (participant.email.toLowerCase() === lead.email.toLowerCase()) return;
    if (participant.client && participant.client.leadId === lead.id) return;
    await prisma.lead.update({ where: { id: leadId }, data: { societyParticipantId: ref.participantId, societyVisitId: ref.visitId } });
  } catch (err) {
    console.error("[society] attach referral failed", err);
  }
}

/** The participant credited for a proposal's client/lead, if any. */
export async function participantForProposal(proposalId: string) {
  const proposal = await prisma.clientProposal.findUnique({
    where: { id: proposalId },
    include: { lead: true, client: { include: { lead: true } } },
  });
  if (!proposal) return null;
  const lead = proposal.lead ?? proposal.client?.lead ?? null;
  if (!lead?.societyParticipantId) return null;
  const participant = await prisma.societyParticipant.findUnique({ where: { id: lead.societyParticipantId } });
  if (!participant || participant.status !== "ACTIVE") return null;
  return { participant, lead, proposal };
}

/**
 * Collab / ambassador discount for this proposal's first package, in cents.
 * Only when the referral has never produced a commission before.
 */
export async function societyDiscountForProposal(proposalId: string) {
  const found = await participantForProposal(proposalId);
  if (!found || found.participant.referralDiscountCents <= 0) return { cents: 0, participant: null };
  const prior = await prisma.societyCommission.findFirst({ where: { leadId: found.lead.id, status: { not: "VOID" } } });
  if (prior) return { cents: 0, participant: null };
  return { cents: found.participant.referralDiscountCents, participant: found.participant };
}

/* ---------------- commissions ---------------- */

/**
 * Create the commission for a proposal that is now fully paid.
 * Idempotent (unique proposalId). Never throws into the payment flow.
 */
export async function createCommissionForPaidProposal(proposalId: string) {
  try {
    const found = await participantForProposal(proposalId);
    if (!found) return null;
    if (await prisma.societyCommission.findUnique({ where: { proposalId } })) return null;
    const { participant, lead, proposal } = found;

    const paid = await prisma.proposalCheckout.findMany({ where: { proposalId, status: "PAID", kind: "program" } });
    const baseCents = paid.reduce((s, c) => s + c.amountCents, 0);
    if (baseCents <= 0) return null;

    const saleNumber = (await paidReferralCount(participant.id)) + 1;
    const { current } = levelFor(await getLevels(), saleNumber);
    const percent = participant.percentOverride ?? current.percent;
    const amountCents = Math.round((baseCents * percent) / 100);

    const commission = await prisma.societyCommission.create({
      data: {
        participantId: participant.id,
        clientId: proposal.clientId,
        leadId: lead.id,
        proposalId,
        description: `${lead.firstName} ${lead.lastName.slice(0, 1)}. — ${paid[0]?.programName ?? "program"}`,
        baseCents,
        percent,
        amountCents,
        saleNumber,
        levelName: participant.percentOverride ? "custom" : current.name,
      },
    });
    const amountLabel = `$${(amountCents / 100).toFixed(2)}`;
    await createNotification({
      category: "PAYMENTS",
      description: `Shaper Society: ${participant.firstName} earned ${amountLabel} (${percent}%) — ${commission.description}. Approve it in the Hub.`,
      linkUrl: "/hub/society",
    });
    await sendSocietyCommissionEmail({
      clientId: participant.clientId ?? undefined,
      firstName: participant.firstName,
      email: participant.email,
      amountLabel,
      dashboardUrl: `https://www.bodyshapersystem.com${participant.type === "CLIENT" ? "/portal/invite" : "/society/dashboard"}`,
    }).catch(() => undefined);
    return commission;
  } catch (err) {
    console.error("[society] commission failed", proposalId, err);
    return null;
  }
}

/* ---------------- current participant ---------------- */

export async function participantForClient(clientId: string) {
  return prisma.societyParticipant.findUnique({ where: { clientId } });
}

export async function getSocietyDashboard(participantId: string) {
  const [participant, visits, commissions, payouts, levels] = await Promise.all([
    prisma.societyParticipant.findUnique({ where: { id: participantId } }),
    prisma.societyVisit.count({ where: { participantId } }),
    prisma.societyCommission.findMany({ where: { participantId }, orderBy: { createdAt: "desc" } }),
    prisma.societyPayout.findMany({ where: { participantId }, orderBy: { requestedAt: "desc" } }),
    getLevels(),
  ]);
  if (!participant) return null;
  const referredLeads = await prisma.lead.count({ where: { societyParticipantId: participantId } });
  const live = commissions.filter((c) => c.status !== "VOID");
  const sales = live.length;
  const { current, next } = levelFor(levels, Math.max(sales, 1));
  const sum = (st: string[]) => live.filter((c) => st.includes(c.status)).reduce((s, c) => s + c.amountCents, 0);
  return {
    participant,
    code: participant.code,
    firstName: participant.firstName,
    agreementCurrent: participant.agreementVersion === AGREEMENT_VERSION,
    discountCents: participant.referralDiscountCents,
    payoutMethod: participant.payoutMethod,
    payoutHandle: participant.payoutHandle,
    minPayoutCents: MIN_PAYOUT_CENTS,
    hasOpenPayout: payouts.some((p) => p.status === "REQUESTED"),
    visits,
    referredLeads,
    sales,
    level: { name: participant.percentOverride ? "custom" : current.name, percent: participant.percentOverride ?? current.percent },
    nextLevel: !participant.percentOverride && next ? { name: next.name, percent: next.percent, salesToGo: next.minSales - sales } : null,
    pendingCents: sum(["PENDING"]),
    approvedCents: live.filter((c) => c.status === "APPROVED" && !c.payoutId).reduce((s, c) => s + c.amountCents, 0),
    paidCents: sum(["PAID"]),
    commissions: commissions.map((c) => ({ id: c.id, description: c.description, amountCents: c.amountCents, percent: c.percent, status: c.status, createdAt: c.createdAt.toISOString() })),
    payouts: payouts.map((p) => ({ id: p.id, amountCents: p.amountCents, status: p.status, requestedAt: p.requestedAt.toISOString(), paidAt: p.paidAt?.toISOString() ?? null })),
    levels: levels.map((l) => ({ name: l.name, minSales: l.minSales, percent: l.percent })),
  };
}

export type SocietyDashboardData = NonNullable<Awaited<ReturnType<typeof getSocietyDashboard>>>;
