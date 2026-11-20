import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { findOrCreateClientFromCheckout } from "@/lib/checkout-client";
import { sendPaymentConfirmationEmail, sendBlackFridayOwnerEmails } from "@/lib/email/service";
import { createNotification } from "@/lib/notifications";
import { BLACK_FRIDAY_PACKS, isBlackFridayPack, usd } from "@/lib/black-friday";

/**
 * checkout.session.completed for the public Black Friday EMS page. Idempotent on the Stripe
 * session id; the paid amount is re-checked against the server-side price table. Buyer details
 * come from Stripe's verified customer_details (the page collects nothing itself).
 */
export async function handleBlackFridayCompleted(session: Stripe.Checkout.Session, systemUserId?: string) {
  const meta = session.metadata ?? {};
  const pack = meta.pack;
  if (!isBlackFridayPack(pack)) return { ok: false as const, status: 400, error: "Unknown Black Friday package." };
  const p = BLACK_FRIDAY_PACKS[pack];
  if (session.payment_status !== "paid") return { ok: true as const, skipped: "not_paid" };
  if (session.amount_total !== p.amountCents || (session.currency ?? "usd") !== "usd") {
    console.error("[stripe-webhook] black friday amount mismatch", session.id, session.amount_total, p.amountCents);
    return { ok: false as const, status: 400, error: "Amount mismatch." };
  }

  const existing = await prisma.payment.findFirst({ where: { reference: session.id } });
  if (existing) return { ok: true as const, alreadyProcessed: true, clientId: existing.clientId };

  const cd = session.customer_details;
  const email = cd?.email?.trim();
  if (!email) return { ok: false as const, status: 400, error: "Missing buyer email." };
  const parts = (cd?.name || "").trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || email.split("@")[0];
  const lastName = parts.slice(1).join(" ") || "—";
  const phone = cd?.phone || undefined;

  const result = await findOrCreateClientFromCheckout({ firstName, lastName, email, phone, source: "Black Friday EMS", systemUserId });
  if (!result.success) {
    console.error("[stripe-webhook] black friday client creation failed", session.id, result.error);
    return { ok: false as const, status: 500, error: result.error };
  }
  const { clientId, client } = result;

  // Re-check right before writing (a retried delivery may have finished meanwhile).
  if (await prisma.payment.findFirst({ where: { reference: session.id } })) return { ok: true as const, alreadyProcessed: true, clientId };
  await prisma.payment.create({
    data: {
      clientId,
      amountCents: p.amountCents,
      method: "CARD",
      status: "PAID",
      paymentType: "FULL_PAYMENT",
      origin: "CLIENT_PAYMENT",
      reference: session.id,
      paidAt: new Date(),
      notes: `Black Friday EMS — ${p.sessions} sessions, paid in full online (${usd(p.amountCents)}).`,
      createdById: systemUserId || null,
    },
  });

  const name = `${client.firstName} ${client.lastName}`.trim();
  await Promise.allSettled([
    sendPaymentConfirmationEmail({ clientId, firstName: client.firstName, email: client.email, amountLabel: usd(p.amountCents), portalUrl: "https://www.bodyshapersystem.com/portal" }),
    sendBlackFridayOwnerEmails({ clientId, clientName: name, email: client.email, phone: client.phone ?? phone ?? null, sessions: p.sessions, amountLabel: usd(p.amountCents) }),
    createNotification({ clientId, category: "PAYMENTS", description: `${name} bought Black Friday EMS — ${p.sessions} sessions (${usd(p.amountCents)}). Contact her to schedule.`, linkUrl: `/hub/clients/${clientId}` }),
  ]);
  return { ok: true as const, clientId };
}
