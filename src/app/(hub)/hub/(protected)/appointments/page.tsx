import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import AppointmentScheduler from "./AppointmentScheduler";
import WeekCalendar from "./WeekCalendar";
import { getBusinessTimezone } from "@/lib/format-datetime";
import { categorizeAppointment } from "@/lib/appointment-categories";

export const dynamic = "force-dynamic";

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // Monday as first day
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default async function HubAppointmentsPage({ searchParams }: { searchParams: Promise<{ week?: string; clientId?: string }> }) {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  const canManage = hasPermission(user, "appointments.manage");
  const timezone = await getBusinessTimezone();

  const { week: weekParam } = await searchParams;
  const weekStart = weekParam ? startOfWeek(new Date(weekParam)) : startOfWeek(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [weekAppointments, allAppointments, clients] = await Promise.all([
    prisma.appointment.findMany({
      where: { startsAt: { gte: weekStart, lt: weekEnd } },
      include: {
        client: {
          include: {
            rewardsAccount: true,
            blueprintAssessments: { orderBy: { version: "desc" }, take: 1 },
            documents: { where: { category: "CONSENT_TREATMENT" } },
            payments: { where: { status: { in: ["PAID", "PENDING"] } }, orderBy: { createdAt: "desc" }, take: 1 },
          },
        },
      },
      orderBy: { startsAt: "asc" },
    }),
    prisma.appointment.findMany({ where: { status: { not: "CANCELLED" } }, select: { clientId: true, startsAt: true }, orderBy: { startsAt: "asc" } }),
    prisma.client.findMany({ where: { archivedAt: null }, orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true } }),
  ]);

  // Real "First Appointment" check: this client's earliest non-cancelled appointment.
  const firstApptByClient = new Map<string, string>(); // clientId -> first appointment id
  for (const a of allAppointments) {
    if (!firstApptByClient.has(a.clientId)) firstApptByClient.set(a.clientId, a.startsAt.toISOString());
  }

  const events = weekAppointments.map((a) => {
    const category = categorizeAppointment(a.title, a.technologies as string[] | null);
    const system = a.client.blueprintAssessments[0]?.recommendedSystem ?? null;
    const totalSessions = a.client.blueprintAssessments[0]?.validatedSessionCount ?? null;
    const lastPayment = a.client.payments[0];
    const hasWaiver = a.client.documents.length > 0;
    const isFirstAppt = firstApptByClient.get(a.clientId) === a.startsAt.toISOString();
    const isVip = a.client.rewardsAccount && a.client.rewardsAccount.tier !== "Standard";

    return {
      id: a.id,
      clientId: a.clientId,
      title: a.title,
      startsAt: a.startsAt.toISOString(),
      endsAt: a.endsAt?.toISOString() ?? null,
      status: a.status,
      category,
      clientName: `${a.client.firstName} ${a.client.lastName}`,
      firstName: a.client.firstName,
      lastName: a.client.lastName,
      email: a.client.email,
      phone: a.client.phone,
      zone: a.client.city,
      system,
      totalSessions,
      notes: a.notes,
      paymentStatus: lastPayment?.status ?? null,
      hasWaiver,
      isFirstAppt,
      isVip: !!isVip,
      tier: a.client.rewardsAccount?.tier ?? "Standard",
    };
  });

  return (
    <div className="cat-body portal-page">
      <div className="module-hero module-hero-appointments">
        <svg className="module-hero-mark" width="60" height="60" viewBox="0 0 60 60" fill="none" aria-hidden="true">
          <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="30" cy="30" r="18" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="30" cy="30" r="2" fill="currentColor" />
        </svg>
        <p className="module-hero-eyebrow">operations</p>
        <h1 className="module-hero-title">appointments.</h1>
        <p className="module-hero-sub">Manage your schedule, clients and sessions.</p>
      </div>

      <WeekCalendar
        weekStartIso={weekStart.toISOString()}
        events={events}
        timezone={timezone}
        canManage={canManage}
      />

      {canManage && (
        <div style={{ marginTop: 32 }}>
          <h3 className="dash-section-title">New Appointment</h3>
          <AppointmentScheduler clients={clients} />
        </div>
      )}
    </div>
  );
}
