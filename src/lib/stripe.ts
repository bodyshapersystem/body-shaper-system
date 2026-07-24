import Stripe from "stripe";

/**
 * Stripe client — created lazily on first use, not at module load,
 * same reasoning as getResendClient(): constructing `new Stripe(...)`
 * eagerly at import time with a missing key would crash Next.js's
 * build-time page data collection for every route that imports this
 * file. Lazy init means the app still builds and runs fine before
 * STRIPE_SECRET_KEY is set; any real attempt to create a Checkout
 * Session will fail with a clear, catchable error until it's set.
 */
let client: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_missing_key");
  }
  return client;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

/** The Body Blueprint™ consultation deposit, in cents. */
export const BLUEPRINT_DEPOSIT_CENTS = 35000;
