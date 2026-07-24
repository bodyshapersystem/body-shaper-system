"use server";

import { prisma } from "@/lib/prisma";
import { getStripeClient, isStripeConfigured, BLUEPRINT_DEPOSIT_CENTS } from "@/lib/stripe";

const SITE_URL = "https://www.bodyshapersystem.com";

export async function createBookingCheckoutSession(formData: FormData) {
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const startsAt = String(formData.get("startsAt") || "");

  if (!firstName || !lastName || !email || !startsAt) {
    return { error: "Please fill in your name, email, and pick a date and time." };
  }

  if (!isStripeConfigured()) {
    return { error: "Online booking isn't set up yet — please text or call us to book directly." };
  }

  // Real-time re-check: refuse to sell a slot that's already taken by
  // a genuine SCHEDULED appointment, even if the page's slot list was
  // stale by the time they clicked pay.
  const slotStart = new Date(startsAt);
  const slotTaken = await prisma.appointment.findFirst({
    where: { startsAt: slotStart, status: "SCHEDULED" },
  });
  if (slotTaken) {
    return { error: "That time was just booked by someone else — please pick another slot." };
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
          unit_amount: BLUEPRINT_DEPOSIT_CENTS,
          product_data: {
            name: "Body Blueprint™ Consultation Deposit",
            description: `Reserves your appointment on ${slotStart.toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { firstName, lastName, email, phone, city, startsAt: slotStart.toISOString() },
    success_url: `${SITE_URL}/book-appointment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/book-appointment`,
  });

  if (!session.url) {
    return { error: "Could not start checkout. Please try again." };
  }

  return { success: true, checkoutUrl: session.url };
}
