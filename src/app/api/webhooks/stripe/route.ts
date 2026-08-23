import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripeClient, BLUEPRINT_DEPOSIT_CENTS } from "@/lib/stripe";
import { findOrCreateClientFromCheckout } from "@/lib/checkout-client";
import { sendAppointmentConfirmationEmail, sendSystemDepositReceivedEmail, sendPaymentConfirmationEmail } from "@/lib/email/service";
import { createNotification } from "@/lib/notifications";
import { getBusinessTimezone, formatDateInTimezone, formatTimeInTimezone } from "@/lib/format-datetime";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

/**
 * Real webhook for every public paid-deposit flow. On
 * checkout.session.completed, branches on metadata.flowType:
 *
 *  - "consultation_deposit" (/book-appointment): $350 toward a
 *    specific Body Blueprint™ consultation slot. Creates the real
 *    Appointment for that date/time + a DEPOSIT Payment.
 *
 *  - "system_deposit" (/systems): the system's "Starting At" price,
 *    paid upfront with the balance due separately once sessions are
 *    scheduled. No specific appointment time yet — just a DEPOSIT
 *    Payment noting which system, so Emmy can follow up to schedule
 *    and collect the remainder.
 *
 *  - "custom_payment_link" (Hub → Payments → generate a link): any
 *    custom amount for an already-selected existing client (full
 *    system payments, packages, remaining balances — anything the
 *    two fixed flows above don't cover). Skips lead creation
 *    entirely since the client is already known; records a
 *    CUSTOM_AMOUNT Payment and sends the standard payment
 *    confirmation email.
 *
 *  - "tech_support_addon" (Portal → Protocol Sync™ → Tech Support™):
 *    an existing, already-authenticated client buying individual
 *    EMS/Exilis/Endospheres sessions to add to their current System.
 *    Records a real TechSupportPurchase (not a generic Payment) so
 *    the Hub can see it distinctly from deposits/full payments.
 *
 * Both branches share the same real client creation/lookup
 * (findOrCreateClientFromCheckout) and are idempotent — checks for an
 * existing Payment with this Checkout Session ID as its reference
 * before doing anything, so Stripe's automatic webhook retries can
 * never double-book or double-charge.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not set — cannot verify or process this event.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(body, signature ?? "", process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const meta = session.metadata ?? {};
  const { firstName, lastName, email, phone, city } = meta;
  const flowType = meta.flowType ?? "consultation_deposit"; // default: pre-existing sessions never had flowType set

  if (!firstName || !lastName || !email) {
    console.error("[stripe-webhook] missing required metadata on session", session.id, meta);
    return NextResponse.json({ error: "Missing booking metadata." }, { status: 400 });
  }

  // Idempotency: has this exact Checkout Session already been processed?
  const existingPayment = await prisma.payment.findFirst({ where: { reference: session.id } });
  if (existingPayment) {
    return NextResponse.json({ received: true, alreadyProcessed: true });
  }

  const owner = await prisma.user.findFirst({ where: { email: "hello@bodyshapersystem.com" } });
  const systemUserId = owner?.id;

  // tech_support_addon: an existing, authenticated client bought
  // individual add-on sessions for their current System. Records a
  // real TechSupportPurchase, distinct from Payment, so the Hub can
  // track add-on sessions and booking status separately.
  if (flowType === "tech_support_addon") {
    const clientId = meta.clientId;
    const addonType = meta.addonType;
    const sessions = Number(meta.sessions ?? 1);
    const systemName = meta.systemName || "Personalized System™";
    if (!clientId || !addonType) {
      console.error("[stripe-webhook] missing clientId/addonType for tech_support_addon", session.id, meta);
      return NextResponse.json({ error: "Missing clientId or addonType." }, { status: 400 });
    }
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      console.error("[stripe-webhook] client not found for tech_support_addon", clientId);
      return NextResponse.json({ error: "Client not found." }, { status: 400 });
    }

    const existing = await prisma.techSupportPurchase.findFirst({ where: { stripeSessionId: session.id } });
    if (existing) return NextResponse.json({ received: true, clientId, flowType, alreadyProcessed: true });

    await prisma.techSupportPurchase.create({
      data: {
        clientId,
        systemName,
        addonType,
        sessionsAdded: sessions,
        amountCents: session.amount_total ?? 0,
        stripeSessionId: session.id,
        status: "PAID",
        purchasedAt: new Date(),
      },
    });

    await sendPaymentConfirmationEmail({
      clientId,
      firstName: client.firstName,
      email: client.email,
      amountLabel: `$${((session.amount_total ?? 0) / 100).toFixed(2)}`,
      portalUrl: "https://www.bodyshapersystem.com/portal/daily-trackers/protocol",
    }).catch(() => undefined);

    await createNotification({
      clientId,
      category: "APPOINTMENTS",
      description: `${client.firstName} ${client.lastName} added ${sessions} ${addonType} session${sessions > 1 ? "s" : ""} to their ${systemName} — SYSTEM ADD-ON PURCHASED`,
      linkUrl: `/hub/clients/${clientId}`,
    });

    return NextResponse.json({ received: true, clientId, flowType });
  }

  // custom_payment_link: the client already exists (Emmy picked them
  // when generating the link in the Hub) — skip lead creation
  // entirely and just record the payment against that exact client.
  if (flowType === "custom_payment_link") {
    const clientId = meta.clientId;
    if (!clientId) {
      console.error("[stripe-webhook] missing clientId for custom_payment_link", session.id, meta);
      return NextResponse.json({ error: "Missing clientId." }, { status: 400 });
    }
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      console.error("[stripe-webhook] client not found for custom_payment_link", clientId);
      return NextResponse.json({ error: "Client not found." }, { status: 400 });
    }
    const description = meta.description || "Custom Payment";

    await prisma.payment.create({
      data: {
        clientId,
        amountCents: session.amount_total ?? 0,
        method: "CARD",
        status: "PAID",
        paymentType: "CUSTOM_AMOUNT",
        origin: "CLIENT_PAYMENT",
        reference: session.id,
        paidAt: new Date(),
        notes: `${description} — paid online via custom payment link.`,
        createdById: systemUserId,
      },
    });

    await sendPaymentConfirmationEmail({
      clientId,
      firstName: client.firstName,
      email: client.email,
      amountLabel: `$${((session.amount_total ?? 0) / 100).toFixed(2)}`,
      portalUrl: "https://www.bodyshapersystem.com/portal/appointments",
    }).catch(() => undefined);

    await createNotification({
      clientId,
      category: "APPOINTMENTS",
      description: `${client.firstName} ${client.lastName} paid a custom payment link — ${description}`,
      linkUrl: `/hub/clients/${clientId}`,
    });

    return NextResponse.json({ received: true, clientId, flowType });
  }

  const clientResult = await findOrCreateClientFromCheckout({
    firstName,
    lastName,
    email,
    phone,
    city,
    source: flowType === "system_deposit" ? "Website System Deposit" : "Website Deposit Booking",
    systemUserId,
  });
  if (!clientResult.success) {
    console.error("[stripe-webhook] client creation failed:", clientResult.error);
    return NextResponse.json({ error: clientResult.error }, { status: 500 });
  }
  const { clientId, client } = clientResult;

  if (flowType === "system_deposit") {
    const systemName = meta.systemName || "a Personalized System™";

    await prisma.payment.create({
      data: {
        clientId,
        amountCents: session.amount_total ?? 0,
        method: "CARD",
        status: "PAID",
        paymentType: "DEPOSIT",
        origin: "CLIENT_PAYMENT",
        reference: session.id,
        paidAt: new Date(),
        notes: `${systemName} — starting-price deposit paid online. Balance due separately once sessions are scheduled.`,
        createdById: systemUserId,
      },
    });

    await sendSystemDepositReceivedEmail({
      clientId,
      firstName: client.firstName,
      email: client.email,
      systemName,
      amountLabel: `$${((session.amount_total ?? 0) / 100).toFixed(2)}`,
      portalUrl: "https://www.bodyshapersystem.com/portal/appointments",
    }).catch(() => undefined);

    await createNotification({
      clientId,
      category: "APPOINTMENTS",
      description: `${client.firstName} ${client.lastName} paid the starting deposit for ${systemName} online — needs scheduling + balance follow-up`,
      linkUrl: `/hub/clients/${clientId}`,
    });

    return NextResponse.json({ received: true, clientId, flowType });
  }

  // --- consultation_deposit (original flow) ---
  const startsAtRaw = meta.startsAt;
  if (!startsAtRaw) {
    console.error("[stripe-webhook] missing startsAt for consultation_deposit", session.id, meta);
    return NextResponse.json({ error: "Missing booking metadata." }, { status: 400 });
  }

  const startsAt = new Date(startsAtRaw);
  const appointment = await prisma.appointment.create({
    data: {
      clientId,
      title: "Body Blueprint™ Consultation",
      startsAt,
      estimatedMinutes: 60,
      locationType: "HOME",
      notes: "Booked online — $350 deposit paid via Stripe.",
      createdById: systemUserId,
    },
  });

  await prisma.payment.create({
    data: {
      clientId,
      appointmentId: appointment.id,
      amountCents: session.amount_total ?? BLUEPRINT_DEPOSIT_CENTS,
      method: "CARD",
      status: "PAID",
      paymentType: "DEPOSIT",
      origin: "CLIENT_PAYMENT",
      reference: session.id,
      paidAt: new Date(),
      notes: "Body Blueprint™ consultation deposit — paid online at time of booking.",
      createdById: systemUserId,
    },
  });

  const timezone = await getBusinessTimezone();
  await sendAppointmentConfirmationEmail({
    clientId,
    firstName: client.firstName,
    email: client.email,
    sessionTitle: appointment.title,
    dateLabel: formatDateInTimezone(startsAt, timezone, { weekday: "long", month: "long", day: "numeric" }),
    timeLabel: formatTimeInTimezone(startsAt, timezone),
    portalUrl: "https://www.bodyshapersystem.com/portal/appointments",
  }).catch(() => undefined);

  await createNotification({
    clientId,
    category: "APPOINTMENTS",
    description: `${client.firstName} ${client.lastName} booked their Body Blueprint™ online and paid the $350 deposit`,
    linkUrl: `/hub/clients/${clientId}`,
  });

  return NextResponse.json({ received: true, clientId, appointmentId: appointment.id });
}

