import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { findOrCreateClientFromCheckout } from "@/lib/checkout-client";
import { sendPaymentConfirmationEmail } from "@/lib/email/service";
import { createNotification } from "@/lib/notifications";
import { displayName, formatDay, money, normalizePrograms, priceProgram, secondChargeOptions, type PaymentMode } from "./types";
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
  const autoSecond = args.mode === "split" && args.installment === 1 ? validSecondChargeDate(args.secondChargeDate) : null;
  if (args.mode === "split" && args.installment === 1 && !autoSecond) return { error: "Please choose the day for your second payment.", status: 400 };

  const label =
    args.mode === "full" ? "Pay in full" : args.installment === 1 ? "Installment 1 of 2 (at booking)" : "Installment 2 of 2 (Week 2)";
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    ...(proposal.client?.email ? { customer_email: proposal.client.email } : {}),
    customer_creation: autoSecond ? ("always" as const) : ("if_required" as const),
    billing_address_collection: "auto",
    phone_number_collection: { enabled: !proposal.client },
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
                ? SPLIT_SCHEDULE_TEXT(pricing.split!.firstCents, pricing.split!.secondCents, autoSecond).slice(0, 480)
                : `Body Shaper System™ personalized program · ${program.sessions.exilis} Exilis Ultra + ${program.sessions.endospheres} Endospheres + ${program.sessions.ems} EMS`,
          },
        },
      },
    ],
    ...(args.mode === "split" ? { custom_text: { submit: { message: SPLIT_SCHEDULE_TEXT(pricing.split!.firstCents, pricing.split!.secondCents, autoSecond) } } } : {}),
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
      secondChargeDate: autoSecond ? new Date(`${autoSecond}T14:00:00Z`) : null,
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
    const amount = first.programTotalCents - first.amountCents;
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
