"use server";

import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { TECH_SUPPORT_ADDONS, getAllowedAddonsForSystem, type AddonType } from "@/lib/tech-support-config";

const SITE_URL = "https://www.bodyshapersystem.com";

/**
 * Real Stripe Checkout for a Tech Support™ add-on — client-initiated,
 * from within Protocol Sync™. Only ever offers add-ons pre-approved
 * for the client's actual current System (getAllowedAddonsForSystem),
 * never a generic "buy any treatment" flow.
 */
export async function createTechSupportCheckoutSession(addonType: AddonType, sessions: number) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };

  if (!isStripeConfigured()) return { error: "Online payment isn't set up yet — please text or call us directly." };
  if (sessions < 1 || sessions > 4) return { error: "Please choose 1-4 sessions." };

  const assessment = await prisma.blueprintAssessment.findFirst({
    where: { clientId: client.id, status: { in: ["ACTIVE", "VALIDATED", "IN_PROGRESS", "COMPLETED"] } },
    orderBy: { version: "desc" },
    select: { recommendedSystem: true },
  });
  const systemName = assessment?.recommendedSystem ?? null;

  const allowed = getAllowedAddonsForSystem(systemName);
  if (!allowed.includes(addonType)) {
    return { error: "This add-on isn't available for your current System." };
  }

  const addon = TECH_SUPPORT_ADDONS[addonType];
  const amountCents = addon.pricePerSessionCents * sessions;

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: client.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: `${addon.label} — ${sessions} ${addonType} session${sessions > 1 ? "s" : ""}`,
            description: `Added to your ${systemName ?? "System"}.`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      flowType: "tech_support_addon",
      clientId: client.id,
      addonType,
      sessions: String(sessions),
      systemName: systemName ?? "Personalized System™",
    },
    success_url: `${SITE_URL}/portal/daily-trackers/protocol?added=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/portal/daily-trackers/protocol`,
  });

  return { success: true, url: session.url };
}
