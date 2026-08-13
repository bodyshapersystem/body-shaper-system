import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import GtagPurchaseEvent from "@/components/GtagPurchaseEvent";

export const metadata: Metadata = buildMetadata({
  title: "Payment Received",
  description: "Your payment is confirmed.",
  path: "/payment-received",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function PaymentReceivedPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;

  let firstName: string | null = null;
  let description: string | null = null;
  let amountLabel: string | null = null;
  let amountUsd: number | null = null;

  if (session_id && isStripeConfigured()) {
    try {
      const session = await getStripeClient().checkout.sessions.retrieve(session_id);
      firstName = session.metadata?.firstName ?? null;
      description = session.metadata?.description ?? null;
      if (session.amount_total != null) {
        amountUsd = session.amount_total / 100;
        amountLabel = `$${amountUsd.toFixed(2)}`;
      }
    } catch {
      // Webhook may not have processed yet — still show a friendly
      // confirmation rather than an error; the email confirms details.
    }
  }

  return (
    <div className="section" style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      {session_id && amountUsd != null && (
        <GtagPurchaseEvent transactionId={session_id} valueUsd={amountUsd} itemName={description ?? "Custom Payment"} />
      )}
      <span className="eyebrow">Payment Received</span>
      <h1 style={{ marginBottom: 16 }}>{firstName ? `Thank you, ${firstName}!` : "Thank you!"}</h1>
      {amountLabel && description ? (
        <p style={{ fontSize: 17, marginBottom: 24 }}>
          Your payment of <strong>{amountLabel}</strong> for <strong>{description}</strong> is confirmed.
        </p>
      ) : (
        <p style={{ fontSize: 17, marginBottom: 24 }}>
          Your payment was received — check your email in the next few minutes for the details.
        </p>
      )}
      <a href="/" className="btn btn-dark-outline">
        Back to Home
      </a>
    </div>
  );
}
