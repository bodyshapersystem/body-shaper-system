"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { newProposalToken, logProposalEvent, RESULT_CASES } from "@/lib/proposals/server";
import { createProposalCheckout } from "@/lib/proposals/checkout";
import { advanceLeadStatus } from "@/lib/proposals/lead";
import { CAMPAIGNS, GOALS, normalizePrograms, ZONES } from "@/lib/proposals/types";

async function requireManager() {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "payments.manage")) return null;
  return user;
}

async function currentOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.bodyshapersystem.com";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export type ProposalInput = {
  id?: string;
  clientId: string | null;
  clientName: string;
  locationLabel: string;
  language: string;
  zones: string[];
  goals: string[];
  personalMessage: string;
  internalNotes: string;
  programs: unknown;
  recommendedKey: string | null;
  promoEnabled: boolean;
  showWelcomeVideo: boolean;
  resultCaseIds: string[];
  expiresAt: string | null;
  programStartDate: string | null;
  leadId?: string | null;
  assessmentEnabled?: boolean;
  assessmentDate?: string | null;
  assessmentTimeConfirmed?: boolean;
  assessmentTime?: string | null;
};

function parseDate(v: string | null): Date | null {
  if (!v) return null;
  const d = new Date(`${v}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function saveProposal(input: ProposalInput): Promise<{ id?: string; error?: string }> {
  const user = await requireManager();
  if (!user) return { error: "You don't have permission to manage proposals." };

  const clientName = String(input.clientName ?? "").trim().slice(0, 60);
  if (!clientName) return { error: "Please enter the client's name." };
  const programs = normalizePrograms(input.programs);
  if (programs.length === 0) return { error: "Add at least one program." };
  if (programs.some((p) => p.totalCents <= 0)) return { error: "Every program needs a total price." };

  let clientId: string | null = input.clientId || null;
  if (clientId && !(await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } }))) clientId = null;
  let leadId: string | null = input.leadId || null;
  const lead = leadId ? await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true, convertedClient: { select: { id: true } } } }) : null;
  if (!lead) leadId = null;
  // A converted lead's proposal belongs to its client too.
  if (lead?.convertedClient && !clientId) clientId = lead.convertedClient.id;
  const assessmentTime = String(input.assessmentTime ?? "").trim().slice(0, 40) || null;

  const data = {
    clientId,
    clientName,
    locationLabel: String(input.locationLabel ?? "").trim().slice(0, 60) || null,
    language: input.language === "es" ? "es" : "en",
    zones: (input.zones ?? []).filter((z) => (ZONES as readonly string[]).includes(z)),
    goals: (input.goals ?? []).filter((g) => (GOALS as readonly string[]).includes(g)),
    personalMessage: String(input.personalMessage ?? "").trim().slice(0, 600) || null,
    internalNotes: String(input.internalNotes ?? "").trim().slice(0, 4000) || null,
    programs: programs as unknown as object,
    recommendedKey: programs.some((p) => p.key === input.recommendedKey) ? input.recommendedKey : null,
    promoEnabled: Boolean(input.promoEnabled),
    showWelcomeVideo: Boolean(input.showWelcomeVideo),
    resultCaseIds: (input.resultCaseIds ?? []).filter((id) => RESULT_CASES.some((c) => c.id === id)),
    expiresAt: parseDate(input.expiresAt),
    programStartDate: parseDate(input.programStartDate),
    leadId,
    assessmentEnabled: input.assessmentEnabled !== false,
    assessmentDate: input.assessmentDate && /^\d{4}-\d{2}-\d{2}$/.test(input.assessmentDate) ? new Date(`${input.assessmentDate}T00:00:00Z`) : null,
    // A time is only "confirmed" when one is actually entered.
    assessmentTimeConfirmed: Boolean(input.assessmentTimeConfirmed) && !!assessmentTime,
    assessmentTime,
  };

  if (input.id) {
    const existing = await prisma.clientProposal.findUnique({ where: { id: input.id } });
    if (!existing) return { error: "Proposal not found." };
    await prisma.clientProposal.update({ where: { id: input.id }, data });
    if (leadId && data.assessmentDate && !existing.assessmentDate) {
      await advanceLeadStatus(leadId, "CONSULTATION_SCHEDULED", `Assessment tentatively ${data.assessmentDate.toISOString().slice(0, 10)} — time to be confirmed`, user.id);
    }
    if (leadId) revalidatePath(`/hub/leads/${leadId}`);
    // Keep a pending 2nd installment's due date tied to the real start date.
    if (data.programStartDate && existing.clientId) {
      await prisma.payment.updateMany({
        where: { clientId: existing.clientId, reference: `proposal:${existing.id}:2`, status: "PENDING" },
        data: { dueDate: new Date(data.programStartDate.getTime() + 7 * 86400000) },
      });
    }
    revalidatePath(`/hub/proposals/${input.id}`);
    revalidatePath("/hub/proposals");
    return { id: input.id };
  }
  const created = await prisma.clientProposal.create({ data: { ...data, token: newProposalToken(), status: "ACTIVE", createdById: user.id } });
  if (leadId) {
    await advanceLeadStatus(leadId, "PROPOSAL_CREATED", "Proposal created in the Hub (lead not converted)", user.id);
    if (data.assessmentDate) await advanceLeadStatus(leadId, "CONSULTATION_SCHEDULED", `Assessment tentatively ${data.assessmentDate.toISOString().slice(0, 10)}${data.assessmentTimeConfirmed ? ` at ${assessmentTime}` : " — time to be confirmed"}`, user.id);
    revalidatePath(`/hub/leads/${leadId}`);
  }
  revalidatePath("/hub/proposals");
  return { id: created.id };
}

export async function setProposalStatus(id: string, status: "ACTIVE" | "INACTIVE" | "DRAFT") {
  const user = await requireManager();
  if (!user) return { error: "No permission." };
  await prisma.clientProposal.update({ where: { id }, data: { status } });
  await logProposalEvent(id, "status_changed", { status, by: user.id });
  revalidatePath(`/hub/proposals/${id}`);
  revalidatePath("/hub/proposals");
  return { ok: true };
}

/** Issues a new private link; the previous one stops working immediately. */
export async function regenerateProposalLink(id: string) {
  const user = await requireManager();
  if (!user) return { error: "No permission." };
  await prisma.clientProposal.update({ where: { id }, data: { token: newProposalToken() } });
  await logProposalEvent(id, "link_regenerated", { by: user.id });
  revalidatePath(`/hub/proposals/${id}`);
  return { ok: true };
}

/** Second installment: a new one-off Checkout for the exact remaining amount, once the real start date is set. */
export async function createSecondInstallmentLink(id: string): Promise<{ url?: string; error?: string }> {
  const user = await requireManager();
  if (!user) return { error: "No permission." };
  const p = await prisma.clientProposal.findUnique({ where: { id }, include: { checkouts: true } });
  if (!p) return { error: "Proposal not found." };
  if (p.checkoutStatus !== "first_installment_paid") return { error: "The first installment has not been paid yet." };
  const first = p.checkouts.find((c) => c.status === "PAID" && c.paymentMode === "split" && c.installmentNumber === 1);
  if (!first) return { error: "No paid first installment found." };
  const res = await createProposalCheckout({ proposalId: p.id, token: p.token, origin: await currentOrigin(), programKey: first.programKey, mode: "split", installment: 2 });
  if ("error" in res) return { error: res.error };
  revalidatePath(`/hub/proposals/${id}`);
  return { url: res.url };
}

export async function saveProposalSettings(input: { founderTitle: string; founderBio: string; founderBioEs: string; activeCampaign: string | null; assessmentDollars?: number }) {
  const user = await requireManager();
  if (!user) return { error: "No permission." };
  const activeCampaign = input.activeCampaign && input.activeCampaign in CAMPAIGNS ? input.activeCampaign : null;
  const data = {
    founderTitle: String(input.founderTitle || "the vision behind body shaper system™").trim().slice(0, 120),
    founderBio: String(input.founderBio ?? "").trim().slice(0, 2000) || null,
    founderBioEs: String(input.founderBioEs ?? "").trim().slice(0, 2000) || null,
    activeCampaign,
    assessmentCents: Math.min(200000, Math.max(5000, Math.round((Number(input.assessmentDollars) || 350) * 100))),
  };
  await prisma.proposalSettings.upsert({ where: { id: "default" }, update: data, create: { id: "default", ...data } });
  revalidatePath("/hub/proposals/settings");
  return { ok: true };
}
