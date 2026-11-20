import { NextResponse } from "next/server";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { BLACK_FRIDAY_FLOW, BLACK_FRIDAY_PACKS, blackFridayOpen, isBlackFridayPack } from "@/lib/black-friday";

export const runtime = "nodejs";

/**
 * Public Black Friday EMS checkout. The browser only sends the package key ("4" | "6" | "12");
 * the amount comes from the server-side table. Pay in full only, one-time payment (no
 * subscription), card data stays on Stripe.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const pack = (body as { pack?: unknown }).pack;
    if (!isBlackFridayPack(pack)) return NextResponse.json({ error: "Please choose a package." }, { status: 400 });
    if (!blackFridayOpen()) return NextResponse.json({ error: "This Black Friday offer ended on December 1st." }, { status: 410 });
    if (!isStripeConfigured()) return NextResponse.json({ error: "Secure checkout is temporarily unavailable. Please contact us." }, { status: 503 });

    const p = BLACK_FRIDAY_PACKS[pack];
    const origin = new URL(request.url).origin;
    const session = await getStripeClient().checkout.sessions.create({
      mode: "payment",
      customer_creation: "always",
      billing_address_collection: "auto",
      phone_number_collection: { enabled: true },
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: p.amountCents,
            product_data: {
              name: `Black Friday EMS — ${p.sessions} sessions`,
              description: `${p.sessions} in-home EMS sessions with Body Shaper System™. Black Friday exclusive, paid in full.`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { flowType: BLACK_FRIDAY_FLOW, pack, sessions: String(p.sessions), amountCents: String(p.amountCents) },
      success_url: `${origin}/black-friday/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/black-friday#packages`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("black friday checkout error", e);
    return NextResponse.json({ error: "Checkout could not be started. Please try again." }, { status: 500 });
  }
}
