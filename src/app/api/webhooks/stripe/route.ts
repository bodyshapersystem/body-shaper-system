import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripeClient, BLUEPRINT_DEPOSIT_CENTS } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { finishConversion } from "@/app/(hub)/hub/(protected)/leads/actions";
import { sendAppointmentConfirmationEmail } from "@/lib/email/service";
import { createNotification } from "@/lib/notifications";
import { getBusinessTimezone, formatDateInTimezone, formatTimeInTimezone } from "@/lib/format-datetime";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

/**
 * Real webhook for the public "Book an Appointment" deposit flow
 * (/book-appointment). On checkout.session.completed:
 *   1. If no Client exists for this email yet, create a real Lead and
 *      immediately convert it to a Client (reusing the exact same
 *      finishConversion() the Hub's manual conversion uses - same
 *      Rewards welcome bonus, portal invitation, welcome email).
 *   2. Create the real Appointment for the requested date/time.
 *   3. Create the real Payment record (DEPOSIT, PAID) tied to it.
 *   4. Send the appointment confirmation email + a Hub notification.
 * Idempotent — checks for an existing Payment with this Checkout
 * Session ID as its reference before doing anything, so Stripe's
 * automatic webhook retries can never double-book or double-charge.
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
  const { firstName, lastName, email, phone, city, startsAt: startsAtRaw } = meta;

  if (!firstName || !lastName || !email || !startsAtRaw) {
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

  let clientId: string;
  let clientEmail = email;

  const existingClient = await prisma.client.findFirst({ where: { email } });
  if (existingClient) {
    clientId = existingClient.id;
  } else {
    const lead = await prisma.lead.create({
      data: { firstName, lastName, email, phone: phone || null, city: city || null, source: "Website Deposit Booking", createdById: systemUserId },
    });
    await prisma.leadStatusHistory.create({
      data: { leadId: lead.id, toStatus: "NEW", changedById: systemUserId, note: "Created from a paid online booking" },
    });

    const admin = createSupabaseAdminClient();
    const { data: authData, error: authError } = await admin.auth.admin.createUser({ email, email_confirm: true });

    let authUserId: string;
    if (authError || !authData.user) {
      if (authError?.message?.toLowerCase().includes("already")) {
        const { data: list } = await admin.auth.admin.listUsers();
        const found = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (!found) {
          console.error("[stripe-webhook] auth account exists but could not be found for", email);
          return NextResponse.json({ error: "Auth lookup failed." }, { status: 500 });
        }
        authUserId = found.id;
      } else {
        console.error("[stripe-webhook] failed to create auth account:", authError);
        return NextResponse.json({ error: "Auth creation failed." }, { status: 500 });
      }
    } else {
      authUserId = authData.user.id;
    }

    const conversion = await finishConversion(lead, authUserId, systemUserId ?? "", "STANDARD");
    if (!conversion.success || !conversion.clientId) {
      console.error("[stripe-webhook] conversion failed:", conversion.error);
      return NextResponse.json({ error: conversion.error ?? "Conversion failed." }, { status: 500 });
    }
    clientId = conversion.clientId;
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return NextResponse.json({ error: "Client lookup failed after creation." }, { status: 500 });
  clientEmail = client.email;

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
    email: clientEmail,
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
