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

export default async function HubAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; zone?: string; status?: string; therapistId?: string; system?: string }>;
}) {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  const canManage = hasPermission(user, "appointments.manage");
  const timezone = await getBusinessTimezone();

  const { week: weekParam, zone, status, therapistId, system } = await searchParams;
  const weekStart = weekParam ? startOfWeek(new Date(weekParam)) : startOfWeek(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [weekAppointments, allAppointments, clients, therapists] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        startsAt: { gte: weekStart, lt: weekEnd },
        ...(status ? { status: status as "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" } : {}),
        ...(therapistId ? { createdById: therapistId } : {}),
      },
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
    prisma.appointment.findMany({ where: { status: { not: "CANCELLED" } }, select: { clientId: true, startsAt: true, status: true }, orderBy: { startsAt: "asc" } }),
    prisma.client.findMany({ where: { archivedAt: null }, orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true } }),
    prisma.user.findMany({ where: { roleId: { not: "role_client" } }, orderBy: { fullName: "asc" }, select: { id: true, fullName: true } }),
  ]);

  // Real "First Appointment" check: this client's earliest non-cancelled appointment.
  const firstApptByClient = new Map<string, string>();
  const completedCountByClient = new Map<string, number>();
  for (const a of allAppointments) {
    if (!firstApptByClient.has(a.clientId)) firstApptByClient.set(a.clientId, a.startsAt.toISOString());
    if (a.status === "COMPLETED") completedCountByClient.set(a.clientId, (completedCountByClient.get(a.clientId) ?? 0) + 1);
  }

  // Real distinct zones (client cities) seen across all clients, for the zone pill filter.
  const zoneRows = await prisma.client.findMany({ where: { city: { not: null } }, select: { city: true }, distinct: ["city"] });
  const zones = zoneRows.map((r) => r.city as string).filter(Boolean).sort();

  const therapistNameById = new Map(therapists.map((t) => [t.id, t.fullName]));

  let events = weekAppointments.map((a) => {
    const category = categorizeAppointment(a.title, a.technologies as string[] | null);
    const recSystem = a.client.blueprintAssessments[0]?.recommendedSystem ?? null;
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
      system: recSystem,
      totalSessions,
      notes: a.notes,
      paymentStatus: lastPayment?.status ?? null,
      hasWaiver,
      isFirstAppt,
      isVip: !!isVip,
      tier: a.client.rewardsAccount?.tier ?? "Standard",
      durationMinutes: a.estimatedMinutes,
      therapistName: a.createdById ? therapistNameById.get(a.createdById) ?? null : null,
      currentSessionNumber: (completedCountByClient.get(a.clientId) ?? 0) + 1,
    };
  });

  if (zone) events = events.filter((e) => e.zone === zone);
  if (system) events = events.filter((e) => e.system === system);

  const distinctSystems = Array.from(new Set(events.map((e) => e.system).filter(Boolean))) as string[];

  return (
    <div className="cat-body portal-page">
      <div className="apt-header">
        <div>
          <h1 className="apt-header-title">appointments</h1>
          <p className="apt-header-sub">manage your schedule, clients and sessions.</p>
        </div>
        {canManage && (
          <a href="#new-appointment" className="apt-new-btn">
            + new appointment
          </a>
        )}
      </div>

      <WeekCalendar
        weekStartIso={weekStart.toISOString()}
        events={events}
        timezone={timezone}
        canManage={canManage}
        zones={zones}
        therapists={therapists}
        currentFilters={{ zone, status, therapistId, system }}
        distinctSystems={distinctSystems}
      />

      {canManage && (
        <div id="new-appointment" style={{ marginTop: 32 }}>
          <h3 className="dash-section-title">New Appointment</h3>
          <AppointmentScheduler clients={clients} />
        </div>
      )}
    </div>
  );
}
