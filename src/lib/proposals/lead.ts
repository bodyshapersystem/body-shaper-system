import "server-only";
import type { LeadStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Lead pipeline for proposals prepared before conversion. Uses the existing LeadStatus enum:
 * NEW/BLUEPRINT_COMPLETED = New Lead · CONTACTED · PROPOSAL_CREATED · PAYMENT_PENDING = Proposal
 * Sent · CONSULTATION_SCHEDULED = Assessment Scheduled · PAYMENT_CONFIRMED = Deposit Received ·
 * PROPOSAL_ACCEPTED · CONVERTED.
 */
export const LEAD_STAGE_LABEL: Record<LeadStatus, string> = {
  NEW: "New Lead",
  BLUEPRINT_COMPLETED: "New Lead · Blueprint",
  CONTACTED: "Contacted",
  QUALIFIED: "Contacted · Qualified",
  PROPOSAL_CREATED: "Proposal Created",
  PAYMENT_PENDING: "Proposal Sent",
  CONSULTATION_SCHEDULED: "Assessment Scheduled",
  PAYMENT_CONFIRMED: "Deposit Received",
  PROPOSAL_ACCEPTED: "Proposal Accepted",
  CONVERTED: "Converted to Client",
  LOST: "Lost",
  ARCHIVED: "Archived",
};

const RANK: Partial<Record<LeadStatus, number>> = {
  NEW: 0,
  BLUEPRINT_COMPLETED: 0,
  CONTACTED: 1,
  QUALIFIED: 1,
  PROPOSAL_CREATED: 2,
  PAYMENT_PENDING: 3,
  CONSULTATION_SCHEDULED: 4,
  PAYMENT_CONFIRMED: 5,
  PROPOSAL_ACCEPTED: 6,
  CONVERTED: 7,
};

/** Moves a lead forward only (never backwards, never out of Converted/Lost/Archived). */
export async function advanceLeadStatus(leadId: string, to: LeadStatus, note: string, changedById?: string | null) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { status: true } });
  if (!lead) return false;
  const from = RANK[lead.status];
  const target = RANK[to];
  if (from === undefined || target === undefined || target <= from) return false;
  await prisma.$transaction([
    prisma.lead.update({ where: { id: leadId }, data: { status: to } }),
    prisma.leadStatusHistory.create({ data: { leadId, fromStatus: lead.status, toStatus: to, changedById: changedById || null, note } }),
  ]);
  return true;
}

/**
 * After a lead becomes a client: link every proposal prepared for that lead to the client and
 * create the Payment records for checkouts that were paid while it was still a lead (idempotent —
 * a checkout that already has a paymentId is skipped).
 */
export async function attachLeadProposalsToClient(leadId: string, clientId: string, systemUserId?: string | null) {
  const proposals = await prisma.clientProposal.findMany({ where: { leadId }, include: { checkouts: true } });
  for (const p of proposals) {
    if (!p.clientId) await prisma.clientProposal.update({ where: { id: p.id }, data: { clientId } });
    for (const c of p.checkouts.filter((x) => x.status === "PAID" && !x.paymentId)) {
      const isAssessment = c.kind === "assessment";
      const isSplit = c.paymentMode === "split";
      const pay = await prisma.payment.create({
        data: {
          clientId,
          amountCents: c.amountCents,
          method: "CARD",
          status: "PAID",
          paymentType: isAssessment ? "DEPOSIT" : isSplit ? "INSTALLMENT" : "FULL_PAYMENT",
          reference: c.stripeSessionId,
          installmentNumber: isAssessment || !isSplit ? null : c.installmentNumber,
          installmentTotal: isAssessment || !isSplit ? null : 2,
          paidAt: c.paidAt ?? new Date(),
          notes: isAssessment
            ? "Body Blueprint™ Assessment reservation (client proposal) — credited once toward the program."
            : `${c.programName} — ${isSplit ? `installment ${c.installmentNumber} of 2` : "paid in full"} (client proposal)${c.creditCents ? `, after ${(c.creditCents / 100).toFixed(2)} assessment credit` : ""}.`,
          createdById: systemUserId || null,
        },
      });
      await prisma.proposalCheckout.update({ where: { id: c.id }, data: { paymentId: pay.id } });
    }
  }
}
