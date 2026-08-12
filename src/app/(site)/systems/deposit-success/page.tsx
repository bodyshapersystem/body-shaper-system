import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";

export const metadata: Metadata = buildMetadata({
  title: "Your Deposit Is Confirmed",
  description: "Your Personalized System™ deposit is confirmed.",
  path: "/systems/deposit-success",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function SystemDepositSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;

  let firstName: string | null = null;
  let systemName: string | null = null;
  let amountLabel: string | null = null;

  if (session_id && isStripeConfigured()) {
    try {
      const session = await getStripeClient().checkout.sessions.retrieve(session_id);
      firstName = session.metadata?.firstName ?? null;
      systemName = session.metadata?.systemName ?? null;
      if (session.amount_total != null) {
        amountLabel = `$${(session.amount_total / 100).toFixed(2)}`;
      }
    } catch {
      // Webhook may not have processed yet — still show a friendly
      // confirmation rather than an error; the email confirms details.
    }
  }

  return (
    <div className="section" style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      <span className="eyebrow">You're On Your Way</span>
      <h1 style={{ marginBottom: 16 }}>{firstName ? `Thank you, ${firstName}!` : "Your deposit is confirmed!"}</h1>
      {systemName && amountLabel ? (
        <p style={{ fontSize: 17, marginBottom: 24 }}>
          Your <strong>{amountLabel}</strong> starting deposit for <strong>{systemName}</strong> is confirmed. The
          remaining balance is due separately, once your sessions are scheduled.
        </p>
      ) : (
        <p style={{ fontSize: 17, marginBottom: 24 }}>
          Your deposit was received — check your email in the next few minutes for the details.
        </p>
      )}
      <p style={{ opacity: 0.7, marginBottom: 32 }}>
        We'll reach out shortly to schedule your first session. We've also sent a link to activate your Client Portal.
      </p>
      <a href="/" className="btn btn-dark-outline">
        Back to Home
      </a>
    </div>
  );
}
