"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";

const SITE_URL = "https://www.bodyshapersystem.com";

/**
 * Generates a real Stripe Checkout link for any custom amount, tied
 * to an existing client — for anything the fixed flows ($350
 * Blueprint deposit, per-system starting price) don't cover: a full
 * system payment, a custom package, a remaining balance, etc. Emmy
 * copies the returned URL and sends it herself (WhatsApp, email,
 * text) — this tool never sends anything on its own.
 *
 * On payment, the webhook (flowType: "custom_payment_link") records
 * a real CUSTOM_AMOUNT Payment against this exact client (no lead
 * creation needed — the client is already selected here) and sends
 * the standard payment confirmation email.
 */
export async function createPaymentLink(formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "payments.manage")) {
    return { error: "You don't have permission to create payment links." };
  }

  const clientId = String(formData.get("clientId") || "");
  const amount = Number(formData.get("amount"));
  const description = String(formData.get("description") || "").trim();

  if (!clientId) return { error: "Please select a client." };
  if (!amount || amount <= 0) return { error: "Please enter a valid amount." };
  if (!description) return { error: "Please add a short description for this payment." };

  if (!isStripeConfigured()) {
    return { error: "Stripe isn't configured yet." };
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return { error: "Client not found." };

  const amountCents = Math.round(amount * 100);

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // payment_method_types intentionally omitted — Stripe Checkout
    // Sessions automatically offer whatever's enabled in the
    // Dashboard (card, Klarna, etc.) when this is left unset, so no
    // code change is needed when a new method gets turned on there.
    customer_email: client.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: description,
            description: `Body Shaper System™ — ${client.firstName} ${client.lastName}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      flowType: "custom_payment_link",
      clientId: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      description,
      createdByUserId: user.id,
    },
    // Real bug fix: this used to point to /hub/clients/[id], a
    // Hub-only page requiring Owner login — the client paying isn't
    // logged into the Hub, so they'd hit a login wall right after
    // paying. Points to the public confirmation page instead.
    success_url: `${SITE_URL}/payment-received?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/`,
  });

  if (!session.url) {
    return { error: "Could not create the payment link. Please try again." };
  }

  return { success: true, checkoutUrl: session.url };
}
