import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { findOrCreateClientFromCheckout } from "@/lib/checkout-client";
import { sendPaymentConfirmationEmail } from "@/lib/email/service";
import { createNotification } from "@/lib/notifications";
import { money, normalizePrograms, priceProgram, type PaymentMode } from "./types";
import { logProposalEvent } from "./server";

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

export const SPLIT_SCHEDULE_TEXT = (first: number, second: number) =>
  `Installment 1 of 2: ${money(first, { cents: true })} today. Installment 2 of 2: ${money(second, { cents: true })} due during Week 2 of your treatment program, counted from your confirmed start date. You will receive a secure payment link for it. No card is stored and no recurring charges are created.`;

type CreateArgs = {
  proposalId: string;
  token: string;
  origin: string;
  programKey: string;
  mode: PaymentMode;
  installment: 1 | 2;
};

/** Creates a one-off Checkout Session for a proposal program. Amounts come only from the DB. */
export async function createProposalCheckout(args: CreateArgs): Promise<{ url: string } | { error: string; status: number }> {
  const gate = proposalPaymentsStatus();
  if (!gate.ok) return { error: gate.reason, status: 503 };

  const proposal = await prisma.clientProposal.findUnique({ where: { id: args.proposalId }, include: { client: true } });
  if (!proposal) return { error: "Proposal not found.", status: 404 };
  const program = normalizePrograms(proposal.programs).find((p) => p.key === args.programKey);
  if (!program) return { error: "This program is not part of your proposal.", status: 400 };
  const pricing = priceProgram(program);
  if (args.mode === "split" && !pricing.split) return { error: "Two payments are not available for this program.", status: 400 };

  let amountCents: number;
  let programTotalCents: number;
  if (args.mode === "full") {
    if (args.installment !== 1) return { error: "Invalid installment.", status: 400 };
    amountCents = pricing.fullCents;
    programTotalCents = pricing.fullCents;
  } else {
    programTotalCents = pricing.split!.totalCents;
    amountCents = args.installment === 1 ? pricing.split!.firstCents : pricing.split!.secondCents;
  }
  if (amountCents < 50) return { error: "Invalid amount.", status: 400 };

  const label =
    args.mode === "full" ? "Pay in full" : args.installment === 1 ? "Installment 1 of 2 (at booking)" : "Installment 2 of 2 (Week 2)";
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    ...(proposal.client?.email ? { customer_email: proposal.client.email } : { customer_creation: "if_required" as const }),
    billing_address_collection: "auto",
    phone_number_collection: { enabled: !proposal.client },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: `${program.name} — ${label}`,
            description:
              args.mode === "split"
                ? SPLIT_SCHEDULE_TEXT(pricing.split!.firstCents, pricing.split!.secondCents).slice(0, 480)
                : `Body Shaper System™ personalized program · ${program.sessions.exilis} Exilis Ultra + ${program.sessions.endospheres} Endospheres + ${program.sessions.ems} EMS`,
          },
        },
      },
    ],
    ...(args.mode === "split" ? { custom_text: { submit: { message: SPLIT_SCHEDULE_TEXT(pricing.split!.firstCents, pricing.split!.secondCents) } } } : {}),
    // One-off payment only: no setup_future_usage, no saved payment method, no subscription.
    payment_intent_data: {
      description: `Client proposal — ${program.name} — ${label}`,
      metadata: { flowType: "client_proposal", proposalId: proposal.id },
    },
    metadata: {
      flowType: "client_proposal",
      proposalId: proposal.id,
      programKey: program.key,
      paymentMode: args.mode,
      installmentNumber: String(args.installment),
      amountCents: String(amountCents),
    },
    success_url: `${args.origin}/p/${args.token}?checkout=success#plan`,
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
    },
  });
  await logProposalEvent(proposal.id, args.installment === 2 ? "second_installment_link" : "checkout_started", {
    programKey: program.key,
    mode: args.mode,
    amountCents,
    testMode: gate.testMode,
  });
  return { url: session.url };
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
  if (row.status === "PAID") return { ok: true, alreadyProcessed: true };
  if (session.payment_status !== "paid") return { ok: true, note: `payment_status ${session.payment_status}` };
  if ((session.amount_total ?? -1) !== row.amountCents) {
    console.error("[stripe-webhook] client_proposal amount mismatch", session.id, session.amount_total, row.amountCents);
    await logProposalEvent(row.proposalId, "amount_mismatch", { sessionId: session.id, charged: session.amount_total, expected: row.amountCents });
    return { ok: true, note: "amount mismatch — not recorded as paid" };
  }

  const proposal = row.proposal;
  let clientId = proposal.clientId;
  let client = clientId ? await prisma.client.findUnique({ where: { id: clientId } }) : null;
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
        const second = row.programTotalCents - row.amountCents;
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
            dueDate: proposal.programStartDate ? new Date(proposal.programStartDate.getTime() + 7 * 86400000) : null,
            notes: `${row.programName} — installment 2 of 2, due during Week 2 of the program (from the confirmed start date). Generate the link from Hub → Client Proposals.`,
            createdById: systemUserId,
          },
        });
      }
    }
  }

  await prisma.proposalCheckout.update({ where: { id: row.id }, data: { status: "PAID", paidAt: now, paymentId } });
  const paidSoFar = proposal.amountPaidCents + row.amountCents;
  const balance = Math.max(0, row.programTotalCents - (row.installmentNumber === 2 ? paidSoFar : row.amountCents));
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
