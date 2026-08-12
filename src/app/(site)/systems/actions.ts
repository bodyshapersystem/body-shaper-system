"use server";

import { getStripeClient, isStripeConfigured } from "@/lib/stripe";

const SITE_URL = "https://www.bodyshapersystem.com";

export async function createSystemDepositCheckoutSession(formData: FormData) {
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const systemName = String(formData.get("systemName") || "").trim();
  const priceCents = Number(formData.get("priceCents") || 0);

  if (!firstName || !lastName || !email) {
    return { error: "Please fill in your name and email." };
  }
  if (!systemName || !priceCents || priceCents <= 0) {
    return { error: "Something's wrong with this system's pricing — please try again or text us directly." };
  }

  if (!isStripeConfigured()) {
    return { error: "Online payment isn't set up yet — please text or call us directly." };
  }

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: priceCents,
          product_data: {
            name: `${systemName} — Starting Investment`,
            description: "Deposit toward your Personalized System™. Remaining balance is due separately once your sessions are scheduled.",
          },
        },
        quantity: 1,
      },
    ],
    metadata: { flowType: "system_deposit", firstName, lastName, email, phone, city, systemName },
    success_url: `${SITE_URL}/systems/deposit-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/systems`,
  });

  if (!session.url) {
    return { error: "Could not start checkout. Please try again." };
  }

  return { success: true, checkoutUrl: session.url };
}
