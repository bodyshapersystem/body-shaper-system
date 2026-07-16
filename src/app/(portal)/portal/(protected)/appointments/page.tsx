import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getBusinessTimezone, formatDateInTimezone, formatTimeInTimezone } from "@/lib/format-datetime";
import { categorizeAppointment } from "@/lib/appointment-categories";
import { buildGoogleCalendarUrl } from "@/lib/google-calendar";
import ClientAppointmentsView from "./ClientAppointmentsView";

export const dynamic = "force-dynamic";

export default async function PortalAppointmentsPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const [appointments, timezone, business] = await Promise.all([
    prisma.appointment.findMany({ where: { clientId: client.id, status: { not: "CANCELLED" } }, orderBy: { startsAt: "asc" } }),
    getBusinessTimezone(),
    prisma.businessSettings.findUnique({ where: { id: "default" } }),
  ]);

  const now = new Date();
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;
  const assessment = client.blueprintAssessments[0];
  const totalSessions = assessment?.validatedSessionCount ?? null;
  const remaining = totalSessions !== null ? Math.max(totalSessions - completedCount, 0) : null;
  const progressPercent = totalSessions !== null && totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : null;

  const [paidAgg, pendingPayment] = await Promise.all([
    prisma.payment.aggregate({ where: { clientId: client.id, status: "PAID" }, _sum: { amountCents: true } }),
    prisma.payment.findFirst({ where: { clientId: client.id, status: "PENDING" }, orderBy: { createdAt: "desc" } }),
  ]);
  const planTotalCents = assessment?.planTotalCents ?? null;
  const paidCents = paidAgg._sum.amountCents ?? 0;
  const planFullyPaid = planTotalCents !== null && paidCents >= planTotalCents;

  const events = appointments.map((a) => {
    const category = categorizeAppointment(a.title, a.technologies as string[] | null);
    return {
      id: a.id,
      title: a.title,
      startsAt: a.startsAt.toISOString(),
      endsAt: a.endsAt?.toISOString() ?? null,
      status: a.status,
      category,
      locationType: a.locationType,
      durationMinutes: a.estimatedMinutes,
    };
  });

  const nextAppointment = appointments.find((a) => a.status === "SCHEDULED" && a.startsAt >= now) ?? null;

  let nextAppointmentDetail = null;
  if (nextAppointment) {
    const start = nextAppointment.startsAt;
    const end = nextAppointment.endsAt ?? new Date(start.getTime() + (nextAppointment.estimatedMinutes ?? 60) * 60000);
    // Real arrival window: ±15 min around the scheduled start — computed, not a separate stored field.
    const arrivalStart = new Date(start.getTime() - 15 * 60000);
    const arrivalEnd = new Date(start.getTime() + 15 * 60000);

    const currentSessionNumber = completedCount + 1;

    const locationText =
      nextAppointment.locationType === "HOME"
        ? `${client.city ?? "Your location"} (At Your Home)`
        : business?.address ?? "Studio Location";

    const calendarUrl = buildGoogleCalendarUrl({
      title: `${nextAppointment.title} — Body Shaper System™`,
      startsAt: start,
      endsAt: end,
      locationText,
      detailsText: `${nextAppointment.title} with Body Shaper System™.${
        nextAppointment.locationType === "HOME"
          ? ` Arrival window: ${formatTimeInTimezone(arrivalStart, timezone)}–${formatTimeInTimezone(arrivalEnd, timezone)}.`
          : ""
      } Preparation instructions: https://www.bodyshapersystem.com/portal/appointments/preparation`,
    });

    nextAppointmentDetail = {
      id: nextAppointment.id,
      title: nextAppointment.title,
      dateLabel: formatDateInTimezone(start, timezone, { weekday: "long", month: "long", day: "numeric" }),
      timeLabel: formatTimeInTimezone(start, timezone),
      durationMinutes: nextAppointment.estimatedMinutes,
      system: assessment?.recommendedSystem ?? null,
      currentSessionNumber,
      totalSessions,
      locationType: nextAppointment.locationType,
      zone: client.city,
      arrivalWindowLabel: `${formatTimeInTimezone(arrivalStart, timezone)}–${formatTimeInTimezone(arrivalEnd, timezone)}`,
      studioAddress: business?.address ?? null,
      paymentStatus: (planFullyPaid ? "PACKAGE" : pendingPayment ? "PENDING" : "PAID") as "PACKAGE" | "PENDING" | "PAID",
      calendarUrl,
    };
  }

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">your schedule</p>
        <h1>appointments.</h1>
        <p className="portal-page-sub">View your upcoming sessions and stay on track.</p>
      </div>

      <ClientAppointmentsView
        events={events}
        timezone={timezone}
        nextAppointment={nextAppointmentDetail}
        completedCount={completedCount}
        remaining={remaining}
        totalSessions={totalSessions}
        progressPercent={progressPercent}
        currentSystem={assessment?.recommendedSystem ?? null}
      />
    </div>
  );
}
