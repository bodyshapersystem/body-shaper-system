import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getBusinessTimezone, formatDateInTimezone, formatTimeInTimezone } from "@/lib/format-datetime";

export const metadata: Metadata = buildMetadata({
  title: "You're Booked!",
  description: "Your Body Blueprint™ consultation is confirmed.",
  path: "/book-appointment/success",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function BookingSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;

  let firstName: string | null = null;
  let dateLabel: string | null = null;
  let timeLabel: string | null = null;

  if (session_id && isStripeConfigured()) {
    try {
      const session = await getStripeClient().checkout.sessions.retrieve(session_id);
      firstName = session.metadata?.firstName ?? null;
      const payment = await prisma.payment.findFirst({ where: { reference: session_id }, include: { appointment: true } });
      if (payment?.appointment) {
        const timezone = await getBusinessTimezone();
        dateLabel = formatDateInTimezone(payment.appointment.startsAt, timezone, { weekday: "long", month: "long", day: "numeric" });
        timeLabel = formatTimeInTimezone(payment.appointment.startsAt, timezone);
      }
    } catch {
      // Webhook may not have processed yet — still show a friendly
      // confirmation rather than an error; the email confirms details.
    }
  }

  return (
    <div className="section" style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      <span className="eyebrow">You're All Set</span>
      <h1 style={{ marginBottom: 16 }}>{firstName ? `Thank you, ${firstName}!` : "You're booked!"}</h1>
      {dateLabel && timeLabel ? (
        <p style={{ fontSize: 17, marginBottom: 24 }}>
          Your Body Blueprint™ consultation is confirmed for <strong>{dateLabel}</strong> at <strong>{timeLabel}</strong>.
        </p>
      ) : (
        <p style={{ fontSize: 17, marginBottom: 24 }}>
          Your deposit was received and your consultation is being confirmed — check your email in the next few minutes for the details.
        </p>
      )}
      <p style={{ opacity: 0.7, marginBottom: 32 }}>
        We've sent a confirmation to your email, along with a link to activate your Client Portal.
      </p>
      <a href="/" className="btn btn-dark-outline">
        Back to Home
      </a>
    </div>
  );
}
