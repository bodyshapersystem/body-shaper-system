import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { findOrCreateClientFromCheckout, convertExistingLeadForPayment } from "@/lib/checkout-client";
import { sendPaymentConfirmationEmail, sendAssessmentReservedEmails } from "@/lib/email/service";
import { createNotification } from "@/lib/notifications";
import { applyCredit, bonusApplies, displayName, formatDay, money, normalizePrograms, priceProgram, secondChargeOptions, type PaymentMode } from "./types";
import { availableAssessmentCredit, getProposalSettings, logProposalEvent } from "./server";
import { advanceLeadStatus, attachLeadProposalsToClient } from "./lead";

/**
 * Safety gate: proposal checkouts run with a Stripe TEST key at any time,
 * but with a LIVE key only once PROPOSALS_LIVE_PAYMENTS=true is set in
 * the environment (after the test-mode validation has been approved).
 */
export function proposalPaymentsStatus(): { ok: true; testMode: boolean } | { ok: false; reason: string } {
  if (!isStripeConfigured()) return { ok: false, reason: "Secure checkout is temporarily unavailable. Please contact us." };
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  const testMode = key.startsWith("sk_test_") || key.startsWith("rk_test_");
  if (!testMode && process.env.PROPOSALS_LIVE_PAYMENTS !== "true") {
    return { ok: false, reason: "Online booking for this proposal is not enabled yet. Please message us to reserve." };
  }
  return { ok: true, testMode };
}

export const SPLIT_SCHEDULE_TEXT = (first: number, second: number, date?: string | null) =>
  date
    ? `Installment 1 of 2: ${money(first, { cents: true })} today. Installment 2 of 2: ${money(second, { cents: true })} charged automatically to this card on ${formatDay(date, "en")} (date you chose). Your card is saved by Stripe only for that payment — no subscription, no other charges.`
    : `Installment 1 of 2: ${money(first, { cents: true })} today. Installment 2 of 2: ${money(second, { cents: true })} due during Weeks 2–3 of your program.`;

/** Server-side check that a chosen 2nd-payment day is inside the allowed window. */
export function validSecondChargeDate(iso: unknown): string | null {
  return typeof iso === "string" && secondChargeOptions().includes(iso) ? iso : null;
}

type CreateArgs = {
  proposalId: string;
  token: string;
  origin: string;
  programKey: string;
  mode: PaymentMode;
  installment: 1 | 2;
  secondChargeDate?: string | null; // split, installment 1: day chosen for the automatic 2nd charge
};

/** Creates a one-off Checkout Session for a proposal program. Amounts come only from the DB. */
export async function createProposalCheckout(args: CreateArgs): Promise<{ url: string } | { error: string; status: number }> {
  const gate = proposalPaymentsStatus();
  if (!gate.ok) return { error: gate.reason, status: 503 };

  const proposal = await prisma.clientProposal.findUnique({ where: { id: args.proposalId }, include: { client: true, lead: true } });
  if (!proposal) return { error: "Proposal not found.", status: 404 };
  const program = normalizePrograms(proposal.programs).find((p) => p.key === args.programKey);
  if (!program) return { error: "This program is not part of your proposal.", status: 400 };
  const pricing = priceProgram(program);
  if (args.mode === "split" && !pricing.split) return { error: "Two payments are not available for this program.", status: 400 };

  let amountCents: number;
  let programTotalCents: number;
  let creditCents = 0;
  let secondAfterCredit = pricing.split?.secondCents ?? 0;
  if (args.installment === 1) {
    if (args.mode === "full") programTotalCents = pricing.fullCents;
    else programTotalCents = pricing.split!.totalCents;
    // A paid Body Blueprint™ Assessment reservation is credited once, server-side only.
    const credit = await availableAssessmentCredit(proposal.id);
    const applied = applyCredit(pricing, args.mode, credit?.availableCents ?? 0);
    amountCents = applied.todayCents;
    creditCents = applied.creditCents;
    secondAfterCredit = applied.secondCents;
  } else {
    if (args.mode !== "split") return { error: "Invalid installment.", status: 400 };
    const first = await prisma.proposalCheckout.findFirst({ where: { proposalId: proposal.id, status: "PAID", paymentMode: "split", installmentNumber: 1 } });
    if (!first) return { error: "The first installment has not been paid yet.", status: 400 };
    programTotalCents = first.programTotalCents;
    amountCents = first.programTotalCents - first.amountCents - first.creditCents;
  }
  if (amountCents < 50) return { error: "Invalid amount.", status: 400 };
  const autoSecond = args.mode === "split" && args.installment === 1 ? validSecondChargeDate(args.secondChargeDate) : null;
  if (args.mode === "split" && args.installment === 1 && !autoSecond) return { error: "Please choose the day for your second payment.", status: 400 };

  const gift = bonusApplies(program, args.mode) && program.bonus?.label ? ` · Complimentary gift: ${program.bonus.label}` : "";
  const creditNote = creditCents ? ` · Assessment credit applied: ${money(creditCents, { cents: true })}` : "";
  const email = proposal.client?.email ?? proposal.lead?.email ?? null;
  const label =
    args.mode === "full" ? "Pay in full" : args.installment === 1 ? "Installment 1 of 2 (at booking)" : "Installment 2 of 2 (Week 2)";
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    ...(email ? { customer_email: email } : {}),
    customer_creation: autoSecond ? ("always" as const) : ("if_required" as const),
    // The automatic 2nd charge needs a reusable card: no BNPL wallets on a split plan.
    ...(autoSecond ? { payment_method_types: ["card", "link"] as ("card" | "link")[] } : {}),
    billing_address_collection: "auto",
    phone_number_collection: { enabled: !proposal.client && !proposal.lead },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: `${displayName(program.name)} — ${label}`,
            description:
              args.mode === "split"
                ? (SPLIT_SCHEDULE_TEXT(amountCents, secondAfterCredit, autoSecond) + creditNote + gift).slice(0, 480)
                : `Body Shaper System™ personalized program · ${programSessionsText(program)}${creditNote}${gift}`.slice(0, 480),
          },
        },
      },
    ],
    ...(args.mode === "split" && args.installment === 1 ? { custom_text: { submit: { message: SPLIT_SCHEDULE_TEXT(amountCents, secondAfterCredit, autoSecond) } } } : {}),
    // No subscription. Only a split plan's 1st installment saves the card (in Stripe)
    // so the single 2nd installment can be charged automatically on the chosen day.
    payment_intent_data: {
      description: `Client proposal — ${displayName(program.name)} — ${label}`,
      metadata: { flowType: "client_proposal", proposalId: proposal.id },
      ...(autoSecond ? { setup_future_usage: "off_session" as const } : {}),
    },
    metadata: {
      flowType: "client_proposal",
      proposalId: proposal.id,
      programKey: program.key,
      paymentMode: args.mode,
      installmentNumber: String(args.installment),
      amountCents: String(amountCents),
      ...(creditCents ? { creditCents: String(creditCents) } : {}),
      ...(proposal.leadId ? { leadId: proposal.leadId } : {}),
      ...(autoSecond ? { secondChargeDate: autoSecond } : {}),
    },
    success_url: `${args.origin}/p/${args.token}?checkout=success#next`,
    cancel_url: `${args.origin}/p/${args.token}#plan`,
  });
  if (!session.url) return { error: "Checkout could not be started. Please try again.", status: 500 };

  await prisma.proposalCheckout.create({
    data: {
      proposalId: proposal.id,
      stripeSessionId: session.id,
      programKey: program.key,
      programName: program.name,
      paymentMode: args.mode,
      installmentNumber: args.installment,
      installmentTotal: args.mode === "split" ? 2 : 1,
      amountCents,
      programTotalCents,
      creditCents,
      secondChargeDate: autoSecond ? new Date(`${autoSecond}T14:00:00Z`) : null,
    },
  });
  await logProposalEvent(proposal.id, args.installment === 2 ? "second_installment_link" : "checkout_started", {
    programKey: program.key,
    mode: args.mode,
    amountCents,
    creditCents,
    testMode: gate.testMode,
  });
  return { url: session.url };
}

function programSessionsText(p: { sessions: Record<string, number> }) {
  const parts: string[] = [];
  if (p.sessions.exilis) parts.push(`${p.sessions.exilis} Exilis Ultra`);
  if (p.sessions.endospheres) parts.push(`${p.sessions.endospheres} Endospheres`);
  if (p.sessions.ems) parts.push(`${p.sessions.ems} EMS`);
  return parts.join(" + ");
}

/**
 * $350 Body Blueprint™ Assessment reservation — never a program or installment, and never a
 * client conversion. One paid reservation per proposal; an open Checkout is reused so two tabs
 * can't create two charges.
 */
export async function createAssessmentCheckout(args: { proposalId: string; token: string; origin: string }): Promise<{ url: string } | { error: string; status: number }> {
  const gate = proposalPaymentsStatus();
  if (!gate.ok) return { error: gate.reason, status: 503 };
  const proposal = await prisma.clientProposal.findUnique({ where: { id: args.proposalId }, include: { client: true, lead: true } });
  if (!proposal || !proposal.assessmentEnabled) return { error: "Assessment reservation is not available for this proposal.", status: 400 };
  if (await prisma.proposalCheckout.findFirst({ where: { proposalId: proposal.id, kind: "assessment", status: "PAID" } })) {
    return { error: "Your assessment is already reserved — no further payment is needed.", status: 409 };
  }
  const settings = await getProposalSettings();
  const amountCents = settings?.assessmentCents ?? 35000;
  const stripe = getStripeClient();
  const open = await prisma.proposalCheckout.findFirst({ where: { proposalId: proposal.id, kind: "assessment", status: "OPEN", createdAt: { gte: new Date(Date.now() - 20 * 3600_000) } }, orderBy: { createdAt: "desc" } });
  if (open && open.amountCents === amountCents) {
    try {
      const existing = await stripe.checkout.sessions.retrieve(open.stripeSessionId);
      if (existing.status === "open" && existing.url) return { url: existing.url };
      if (existing.status === "complete") return { error: "Your assessment is already reserved — we're confirming your payment.", status: 409 };
    } catch {
      /* fall through and create a new session */
    }
  }
  const email = proposal.client?.email ?? proposal.lead?.email ?? null;
  const dateText = proposal.assessmentDate ? ` · ${proposal.assessmentDate.toISOString().slice(0, 10)} (time to be confirmed)` : "";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    ...(email ? { customer_email: email } : {}),
    customer_creation: "if_required",
    billing_address_collection: "auto",
    phone_number_collection: { enabled: !proposal.client && !proposal.lead },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: "Body Blueprint™ Assessment — reservation",
            description: `Private in-home Body Blueprint™ Assessment${dateText}. Credited once toward the program you choose. This is not a treatment package.`.slice(0, 480),
          },
        },
      },
    ],
    payment_intent_data: { description: "Client proposal — Body Blueprint™ Assessment reservation", metadata: { flowType: "client_proposal", proposalId: proposal.id, kind: "assessment" } },
    metadata: { flowType: "client_proposal", kind: "assessment", proposalId: proposal.id, amountCents: String(amountCents), ...(proposal.leadId ? { leadId: proposal.leadId } : {}) },
    success_url: `${args.origin}/p/${args.token}?checkout=assessment#next`,
    cancel_url: `${args.origin}/p/${args.token}?checkout=cancelled#assessment`,
  }, { idempotencyKey: `proposal-${proposal.id}-assessment-${Math.floor(Date.now() / 60000)}` });
  if (!session.url) return { error: "Checkout could not be started. Please try again.", status: 500 };
  await prisma.proposalCheckout.create({
    data: { proposalId: proposal.id, stripeSessionId: session.id, kind: "assessment", programKey: "assessment", programName: "Body Blueprint™ Assessment", paymentMode: "full", amountCents, programTotalCents: amountCents },
  });
  await logProposalEvent(proposal.id, "assessment_checkout_started", { amountCents, testMode: gate.testMode });
  return { url: session.url };
}

/** Webhook: assessment reservation paid. Records it once; never converts the lead; keeps the program unselected. */
async function handleAssessmentPaid(session: Stripe.Checkout.Session, rowId: string, systemUserId?: string) {
  const now = new Date();
  // Payment has already been verified by the caller against Stripe signature, status and amount.
  // Mark it paid only once. A retry can still finish a previously interrupted client conversion.
  const claimed = await prisma.proposalCheckout.updateMany({
    where: { id: rowId, status: "OPEN" },
    data: { status: "PAID", paidAt: now },
  });
  const row = await prisma.proposalCheckout.findUniqueOrThrow({
    where: { id: rowId },
    include: { proposal: { include: { lead: true, client: true } } },
  });
  if (row.status !== "PAID") throw new Error("Assessment payment was not recorded");
  const p = row.proposal;

  // A second paid reservation is never credited twice. On retries, do not alert twice.
  const earlier = await prisma.proposalCheckout.count({
    where: { proposalId: p.id, kind: "assessment", status: "PAID", id: { not: row.id } },
  });
  if (earlier > 0) {
    if (claimed.count) {
      await logProposalEvent(p.id, "assessment_duplicate_paid", { sessionId: session.id, amountCents: row.amountCents });
      await createNotification({
        clientId: p.clientId ?? undefined, category: "PAYMENTS",
        description: `${p.clientName} paid the assessment reservation twice — refund ${money(row.amountCents)} in Stripe (only one is credited).`,
        linkUrl: `/hub/proposals/${p.id}`,
      });
    }
    return { ok: true, note: "duplicate assessment payment flagged" };
  }

  if (p.leadId) {
    await prisma.lead.update({ where: { id: p.leadId }, data: { paymentStatus: "CONFIRMED" } });
    await advanceLeadStatus(p.leadId, "PAYMENT_CONFIRMED",
      `Body Blueprint™ Assessment reserved — ${money(row.amountCents)} paid (proposal)`, systemUserId);
  }

  let clientId = p.clientId;
  let client = p.client;
  if (!clientId && p.leadId) {
    const result = await convertExistingLeadForPayment(p.leadId, systemUserId);
    if (!result.success) {
      await logProposalEvent(p.id, "assessment_client_link_failed",
        { sessionId: session.id, error: result.error });
      // A non-2xx webhook response makes Stripe retry. The paid checkout remains recorded.
      throw new Error(`Paid assessment could not convert lead: ${result.error}`);
    }
    clientId = result.clientId;
    client = result.client;
    await prisma.clientProposal.update({ where: { id: p.id }, data: { clientId } });
    // Conversion normally attaches the paid deposit already; also safe on retries.
    await attachLeadProposalsToClient(p.leadId, clientId, systemUserId);
  } else if (!clientId && !p.leadId) {
    const email = session.customer_details?.email ?? session.customer_email;
    if (!email) throw new Error("Paid assessment has no customer email for client creation");
    const parts = (session.customer_details?.name ?? p.clientName).trim().split(/\\s+/);
    const result = await findOrCreateClientFromCheckout({
      firstName: parts[0] || p.clientName,
      lastName: parts.slice(1).join(" ") || "—",
      email,
      phone: session.customer_details?.phone ?? undefined,
      city: p.locationLabel ?? undefined,
      source: "Body Blueprint Assessment Reservation",
      systemUserId,
    });
    if (!result.success) throw new Error(`Paid assessment could not create client: ${result.error}`);
    clientId = result.clientId;
    client = result.client;
    await prisma.clientProposal.update({ where: { id: p.id }, data: { clientId } });
  }

  // Attach exactly one Payment to this checkout, even when conversion was retried.
  const latest = await prisma.proposalCheckout.findUniqueOrThrow({ where: { id: row.id } });
  if (clientId && !latest.paymentId) {
    const existing = await prisma.payment.findFirst({ where: { reference: session.id, clientId } });
    const pay = existing ?? await prisma.payment.create({
      data: {
        clientId, amountCents: row.amountCents, method: "CARD", status: "PAID",
        paymentType: "DEPOSIT", reference: session.id, paidAt: row.paidAt ?? now,
        notes: "Body Blueprint™ Assessment reservation (client proposal) — credited once toward the program.",
        createdById: systemUserId,
      },
    });
    await prisma.proposalCheckout.update({ where: { id: row.id }, data: { paymentId: pay.id } });
  }

  // Webhook retries must not resend booking emails or duplicate owner notifications.
  if (!claimed.count) return { ok: true, alreadyProcessed: true, clientId };
  await logProposalEvent(p.id, "assessment_paid", { sessionId: session.id, amountCents: row.amountCents, clientId });
  const email = session.customer_details?.email ?? client?.email ?? p.lead?.email ?? null;
  const firstName = client?.firstName ?? p.lead?.firstName ?? p.clientName;
  await sendAssessmentReservedEmails({
    clientId: clientId ?? undefined,
    leadId: p.leadId ?? undefined,
    firstName,
    clientName: p.clientName,
    email,
    amountLabel: money(row.amountCents),
    dateISO: p.assessmentDate ? p.assessmentDate.toISOString().slice(0, 10) : null,
    time: p.assessmentTimeConfirmed ? p.assessmentTime : null,
    hubUrl: clientId
      ? `https://www.bodyshapersystem.com/hub/clients/${clientId}`
      : `https://www.bodyshapersystem.com/hub/proposals/${p.id}`,
  }).catch((e) => console.error("assessment emails", e));
  await createNotification({
    clientId: clientId ?? undefined,
    category: "PAYMENTS",
    description: `${p.clientName} reserved her Body Blueprint™ Assessment — ${money(row.amountCents)} paid; client converted (program not chosen yet)`,
    linkUrl: clientId ? `/hub/clients/${clientId}` : `/hub/proposals/${p.id}`,
  });
  return { ok: true, assessment: true, clientId };
}

/**
 * Populate the linked client's pending Body Blueprint from the PAID program.
 * Never replace original intake responses or a specialist-validated strategy.
 * Paid proposal JSON remains the detailed record of technology allocations.
 */
async function syncPurchasedProgramToBlueprint(clientId: string, proposal: { id: string; programs: unknown }, row: {
  programKey: string; programName: string; programTotalCents: number;
}) {
  const program = normalizePrograms(proposal.programs).find((p) => p.key === row.programKey);
  if (!program) throw new Error("Paid program not found in proposal");
  const assessment = await prisma.blueprintAssessment.findFirst({
    where: { clientId, status: { in: ["ACTIVE", "BASELINE_PENDING", "BASELINE_COMPLETED", "VALIDATED", "IN_PROGRESS"] } },
    orderBy: { version: "desc" },
  });
  const linkedAssessment = assessment ?? await prisma.blueprintAssessment.create({
    data: { clientId, status: "BASELINE_PENDING" },
  });

  // Do not overwrite a strategy already validated by the specialist.
  if (linkedAssessment.validatedAt || linkedAssessment.status === "VALIDATED" || linkedAssessment.status === "IN_PROGRESS") return;

  const paidSessions = program.sessions.exilis + program.sessions.endospheres + program.sessions.ems;
  const complimentary = program.bonus?.label ?? null;
  const purchaseSummary =
    `Paid proposal ${proposal.id}: ${row.programName} — ${program.sessions.exilis} Exilis Ultra, ${program.sessions.endospheres} Endospheres, ${program.sessions.ems} EMS` +
    (complimentary ? ` — courtesy: ${complimentary}` : "") +
    ". Session areas and eligibility pending specialist assessment.";
  const notes = linkedAssessment.optimizationNotes ?? "";
  await prisma.blueprintAssessment.update({
    where: { id: linkedAssessment.id },
    data: {
      recommendedSystem: row.programName,
      initialSessionCount: paidSessions,
      complementarySessions: complimentary,
      planTotalCents: row.programTotalCents,
      optimizationNotes: notes.includes(`Paid proposal ${proposal.id}:`)
        ? notes
        : [notes, purchaseSummary].filter(Boolean).join("\\n"),
      // Original intake, original recommendation, validated strategy and measurements stay unchanged.
    },
  });
}

/**
 * Webhook branch for flowType "client_proposal" (checkout.session.completed).
 * Idempotent: a ProposalCheckout row is marked PAID exactly once.
 */
export async function handleProposalCheckoutCompleted(session: Stripe.Checkout.Session, systemUserId?: string) {
  const row = await prisma.proposalCheckout.findUnique({ where: { stripeSessionId: session.id }, include: { proposal: true } });
  if (!row) {
    console.error("[stripe-webhook] client_proposal session without a ProposalCheckout row", session.id);
    return { ok: true, note: "unknown session" };
  }
  if (row.status === "PAID" && row.kind !== "assessment") return { ok: true, alreadyProcessed: true };
  if (session.payment_status !== "paid") return { ok: true, note: `payment_status ${session.payment_status}` };
  if ((session.amount_total ?? -1) !== row.amountCents) {
    console.error("[stripe-webhook] client_proposal amount mismatch", session.id, session.amount_total, row.amountCents);
    await logProposalEvent(row.proposalId, "amount_mismatch", { sessionId: session.id, charged: session.amount_total, expected: row.amountCents });
    return { ok: true, note: "amount mismatch — not recorded as paid" };
  }
  if (row.kind === "assessment") return handleAssessmentPaid(session, row.id, systemUserId);

  // Claim the credit exactly once (unique creditFromCheckoutId). If another paid program already
  // used it, the payment is still recorded and the owner is told to collect the difference.
  if (row.creditCents > 0) {
    const credit = await prisma.proposalCheckout.findFirst({ where: { proposalId: row.proposalId, kind: "assessment", status: "PAID" }, orderBy: { paidAt: "asc" } });
    let claimedCredit = false;
    if (credit) {
      try {
        await prisma.proposalCheckout.update({ where: { id: row.id }, data: { creditFromCheckoutId: credit.id } });
        claimedCredit = true;
      } catch {
        claimedCredit = false;
      }
    }
    if (!claimedCredit) {
      await logProposalEvent(row.proposalId, "credit_conflict", { sessionId: session.id, creditCents: row.creditCents });
      await createNotification({ category: "PAYMENTS", description: `${row.proposal.clientName}: assessment credit of ${money(row.creditCents)} was already used — collect the difference.`, linkUrl: `/hub/proposals/${row.proposalId}` });
    }
  }

  const proposal = row.proposal;
  let clientId = proposal.clientId;
  let client = clientId ? await prisma.client.findUnique({ where: { id: clientId } }) : null;
  // Proposal prepared for a lead: the paid program is the acceptance — convert THAT lead
  // (keeps its Blueprint, proposal and payment history) instead of creating a new one.
  if (!client && proposal.leadId) {
    await advanceLeadStatus(proposal.leadId, "PROPOSAL_ACCEPTED", `Program paid via proposal — ${row.programName}`, systemUserId);
    const res = await convertExistingLeadForPayment(proposal.leadId, systemUserId);
    if (res.success) {
      client = res.client;
      clientId = res.clientId;
      await prisma.clientProposal.update({ where: { id: proposal.id }, data: { clientId } });
      await attachLeadProposalsToClient(proposal.leadId, clientId, systemUserId); // earlier assessment deposit → Payment
    } else {
      console.error("[stripe-webhook] client_proposal could not convert lead", session.id, res.error);
      await logProposalEvent(proposal.id, "client_link_failed", { sessionId: session.id, error: res.error });
      // Do not silently create a different Client for this paid lead.
      // Keep checkout OPEN so a webhook retry can link the correct lead.
      throw new Error("Paid proposal could not convert its existing lead");
    }
  }
  if (!client) {
    const details = session.customer_details;
    const email = details?.email ?? session.customer_email ?? "";
    const parts = (details?.name ?? proposal.clientName).trim().split(/\s+/);
    if (email) {
      const res = await findOrCreateClientFromCheckout({
        firstName: parts[0] || proposal.clientName,
        lastName: parts.slice(1).join(" ") || "—",
        email,
        phone: details?.phone ?? undefined,
        city: proposal.locationLabel ?? undefined,
        source: "Client Proposal",
        systemUserId,
      });
      if (res.success) {
        client = res.client;
        clientId = res.clientId;
      } else {
        console.error("[stripe-webhook] client_proposal could not link/create client", session.id, res.error);
        await logProposalEvent(proposal.id, "client_link_failed", { sessionId: session.id, error: res.error });
      }
    }
  }

  // A paid program (full or first installment) establishes the client's
  // purchased strategy. A $350 assessment reservation does not.
  if (clientId && row.installmentNumber === 1) {
    await syncPurchasedProgramToBlueprint(clientId, proposal, row);
  }

  const now = new Date();
  const isSplit = row.paymentMode === "split";
  let paymentId: string | null = null;
  if (clientId) {
    if (row.installmentNumber === 2) {
      const pending = await prisma.payment.findFirst({ where: { clientId, reference: `proposal:${proposal.id}:2`, status: "PENDING" } });
      const p = pending
        ? await prisma.payment.update({ where: { id: pending.id }, data: { status: "PAID", paidAt: now, reference: session.id, amountCents: row.amountCents } })
        : await prisma.payment.create({
            data: { clientId, amountCents: row.amountCents, method: "CARD", status: "PAID", paymentType: "INSTALLMENT", reference: session.id, installmentNumber: 2, installmentTotal: 2, paidAt: now, notes: `${row.programName} — installment 2 of 2 (client proposal).`, createdById: systemUserId },
          });
      paymentId = p.id;
    } else {
      const p = await prisma.payment.create({
        data: {
          clientId,
          amountCents: row.amountCents,
          method: "CARD",
          status: "PAID",
          paymentType: isSplit ? "INSTALLMENT" : "FULL_PAYMENT",
          reference: session.id,
          installmentNumber: isSplit ? 1 : null,
          installmentTotal: isSplit ? 2 : null,
          paidAt: now,
          notes: `${row.programName} — ${isSplit ? "installment 1 of 2" : "paid in full"} (client proposal).`,
          createdById: systemUserId,
        },
      });
      paymentId = p.id;
      if (isSplit) {
        const second = row.programTotalCents - row.amountCents - row.creditCents;
        // Keep the Stripe ids needed for the automatic 2nd charge (never card data).
        const piId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
        if (piId) {
          try {
            const pi = await getStripeClient().paymentIntents.retrieve(piId);
            await prisma.proposalCheckout.update({
              where: { id: row.id },
              data: {
                stripePaymentMethodId: typeof pi.payment_method === "string" ? pi.payment_method : pi.payment_method?.id ?? null,
                stripeCustomerId: typeof pi.customer === "string" ? pi.customer : pi.customer?.id ?? null,
              },
            });
          } catch (e) {
            console.error("[stripe-webhook] could not read payment intent for auto 2nd charge", piId, e);
          }
        }
        await prisma.payment.create({
          data: {
            clientId,
            amountCents: second,
            method: "CARD",
            status: "PENDING",
            paymentType: "INSTALLMENT",
            reference: `proposal:${proposal.id}:2`,
            installmentNumber: 2,
            installmentTotal: 2,
            dueDate: row.secondChargeDate ?? (proposal.programStartDate ? new Date(proposal.programStartDate.getTime() + 7 * 86400000) : null),
            notes: row.secondChargeDate
              ? `${row.programName} — installment 2 of 2, charged automatically on the date the client chose. If it fails, send the link from Hub → Client Proposals.`
              : `${row.programName} — installment 2 of 2. Send the link from Hub → Client Proposals.`,
            createdById: systemUserId,
          },
        });
      }
    }
  }

  await prisma.proposalCheckout.update({ where: { id: row.id }, data: { status: "PAID", paidAt: now, paymentId } });
  const paidSoFar = proposal.amountPaidCents + row.amountCents;
  const firstCredit = row.installmentNumber === 2 ? (await prisma.proposalCheckout.findFirst({ where: { proposalId: proposal.id, status: "PAID", paymentMode: "split", installmentNumber: 1 } }))?.creditCents ?? 0 : row.creditCents;
  const balance = Math.max(0, row.programTotalCents - firstCredit - (row.installmentNumber === 2 ? paidSoFar : row.amountCents));
  await prisma.clientProposal.update({
    where: { id: proposal.id },
    data: {
      clientId: clientId ?? undefined,
      selectedProgramKey: row.programKey,
      selectedPaymentMode: row.paymentMode,
      amountPaidCents: paidSoFar,
      balanceDueCents: isSplit ? balance : 0,
      checkoutStatus: !isSplit ? "paid_in_full" : row.installmentNumber === 1 ? "first_installment_paid" : "completed",
    },
  });
  await logProposalEvent(proposal.id, "paid", { programKey: row.programKey, mode: row.paymentMode, installment: row.installmentNumber, amountCents: row.amountCents, sessionId: session.id });

  if (client && clientId) {
    await sendPaymentConfirmationEmail({
      clientId,
      firstName: client.firstName,
      email: client.email,
      amountLabel: money(row.amountCents, { cents: true }),
      portalUrl: "https://www.bodyshapersystem.com/portal/appointments",
    }).catch(() => undefined);
  }
  await createNotification({
    clientId: clientId ?? undefined,
    category: "PAYMENTS",
    description: `${proposal.clientName} paid ${money(row.amountCents, { cents: true })} — ${row.programName} (${isSplit ? `installment ${row.installmentNumber} of 2` : "pay in full"}) via client proposal`,
    linkUrl: `/hub/proposals/${proposal.id}`,
  });
  return { ok: true, clientId };
}

/** Promo (existing 333 checkout) paid from a proposal: record it on the proposal only. */
export async function handleProposalPromoCompleted(session: Stripe.Checkout.Session) {
  const proposalId = session.metadata?.proposal_id;
  if (!proposalId) return;
  const exists = await prisma.proposalEvent.findFirst({ where: { proposalId, type: "promo_paid", data: { path: ["sessionId"], equals: session.id } } });
  if (exists) return;
  await logProposalEvent(proposalId, "promo_paid", { sessionId: session.id, plan: session.metadata?.payment_plan, amountCents: session.amount_total });
}

/**
 * Daily cron: charge every automatic 2nd installment that is due.
 * One off-session PaymentIntent per installment (idempotency key), max 3 attempts.
 */
export async function chargeDueInstallments(now = new Date()) {
  const due = await prisma.payment.findMany({
    where: { status: "PENDING", installmentNumber: 2, reference: { startsWith: "proposal:" }, dueDate: { lte: now } },
  });
  const results: { paymentId: string; status: string }[] = [];
  for (const pay of due) {
    const proposalId = pay.reference!.split(":")[1];
    const first = await prisma.proposalCheckout.findFirst({
      where: { proposalId, status: "PAID", paymentMode: "split", installmentNumber: 1 },
      include: { proposal: true },
    });
    if (!first?.stripeCustomerId || !first.stripePaymentMethodId) {
      results.push({ paymentId: pay.id, status: "no_saved_card" });
      continue;
    }
    const attempts = await prisma.proposalEvent.count({ where: { proposalId, type: { in: ["auto_charge_failed"] } } });
    if (attempts >= 3) {
      results.push({ paymentId: pay.id, status: "gave_up" });
      continue;
    }
    const amount = first.programTotalCents - first.amountCents - first.creditCents;
    try {
      const pi = await getStripeClient().paymentIntents.create(
        {
          amount,
          currency: "usd",
          customer: first.stripeCustomerId,
          payment_method: first.stripePaymentMethodId,
          off_session: true,
          confirm: true,
          description: `Client proposal — ${displayName(first.programName)} — Installment 2 of 2 (automatic)`,
          metadata: { flowType: "client_proposal_auto", proposalId, paymentId: pay.id },
        },
        { idempotencyKey: `proposal-${proposalId}-inst2-attempt${attempts}` },
      );
      if (pi.status !== "succeeded") throw Object.assign(new Error(`status ${pi.status}`), { code: pi.status });
      await prisma.payment.update({ where: { id: pay.id }, data: { status: "PAID", paidAt: new Date(), reference: pi.id, amountCents: amount } });
      const p = first.proposal;
      await prisma.clientProposal.update({ where: { id: p.id }, data: { amountPaidCents: p.amountPaidCents + amount, balanceDueCents: 0, checkoutStatus: "completed" } });
      await logProposalEvent(p.id, "paid", { installment: 2, auto: true, amountCents: amount, paymentIntent: pi.id });
      const client = p.clientId ? await prisma.client.findUnique({ where: { id: p.clientId } }) : null;
      if (client) {
        await sendPaymentConfirmationEmail({ clientId: client.id, firstName: client.firstName, email: client.email, amountLabel: money(amount, { cents: true }), portalUrl: "https://www.bodyshapersystem.com/portal/appointments" }).catch(() => undefined);
      }
      await createNotification({ clientId: p.clientId ?? undefined, category: "PAYMENTS", description: `${p.clientName} — 2nd installment ${money(amount, { cents: true })} charged automatically (${displayName(first.programName)})`, linkUrl: `/hub/proposals/${p.id}` });
      results.push({ paymentId: pay.id, status: "charged" });
    } catch (e) {
      const err = e as { code?: string; message?: string; raw?: { code?: string } };
      await logProposalEvent(proposalId, "auto_charge_failed", { paymentId: pay.id, code: err.raw?.code ?? err.code ?? null, message: err.message ?? null });
      await createNotification({
        clientId: first.proposal.clientId ?? undefined,
        category: "PAYMENTS",
        description: `${first.proposal.clientName} — automatic 2nd installment could not be charged. Send her the payment link from Hub → Client Proposals.`,
        linkUrl: `/hub/proposals/${proposalId}`,
      });
      results.push({ paymentId: pay.id, status: "failed" });
    }
  }
  return results;
}
