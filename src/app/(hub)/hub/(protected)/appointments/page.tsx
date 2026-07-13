import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { cancelAppointment } from "./actions";
import AppointmentScheduler from "./AppointmentScheduler";

export const dynamic = "force-dynamic";

export default async function HubAppointmentsPage() {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  const canManage = hasPermission(user, "appointments.manage");

  const [allAppointments, clients] = await Promise.all([
    prisma.appointment.findMany({
      where: { status: { not: "CANCELLED" } },
      include: { client: true },
      orderBy: { startsAt: "asc" },
    }),
    prisma.client.findMany({ where: { archivedAt: null }, orderBy: { firstName: "asc" } }),
  ]);

  // Session number = ordinal position among this client's own
  // appointments (chronological), matching "Session N" language
  // instead of a generic list.
  const sessionNumberByAppointmentId = new Map<string, number>();
  const perClientCounter = new Map<string, number>();
  for (const a of allAppointments) {
    const n = (perClientCounter.get(a.clientId) ?? 0) + 1;
    perClientCounter.set(a.clientId, n);
    sessionNumberByAppointmentId.set(a.id, n);
  }

  const now = new Date();
  const upcoming = allAppointments.filter((a) => a.startsAt >= now);
  const past = allAppointments.filter((a) => a.startsAt < now).reverse();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const todaysCount = allAppointments.filter((a) => a.startsAt >= startOfToday && a.startsAt < endOfToday).length;
  const thisWeekCount = allAppointments.filter((a) => a.startsAt >= startOfWeek && a.startsAt < endOfWeek).length;
  const completedThisMonth = allAppointments.filter((a) => a.status === "COMPLETED" && a.startsAt >= startOfMonth).length;
  const noShowsThisMonth = allAppointments.filter((a) => a.status === "NO_SHOW" && a.startsAt >= startOfMonth).length;

  function techList(technologies: unknown): { name: string }[] {
    if (!Array.isArray(technologies)) return [];
    return technologies.map((t) => (typeof t === "string" ? { name: t } : (t as { name: string })));
  }

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
        <p className="module-hero-sub">Every visit is another step toward your client's transformation.</p>
        <div className="module-hero-stats">
          <div className="module-hero-stat">
            <strong>{todaysCount}</strong>
            <span>Today</span>
          </div>
          <div className="module-hero-stat">
            <strong>{thisWeekCount}</strong>
            <span>This Week</span>
          </div>
          <div className="module-hero-stat">
            <strong>{completedThisMonth}</strong>
            <span>Completed This Month</span>
          </div>
          <div className="module-hero-stat">
            <strong>{noShowsThisMonth}</strong>
            <span>No-Shows This Month</span>
          </div>
        </div>
      </div>

      {canManage && (
        <div className="sched-wrap">
          <AppointmentScheduler clients={clients.map((c) => ({ id: c.id, firstName: c.firstName, lastName: c.lastName }))} />
        </div>
      )}

      <h3 className="dash-section-title" style={{ marginTop: 40 }}>
        Upcoming Sessions
      </h3>
      {upcoming.length === 0 ? (
        <div className="module-empty" style={{ marginBottom: 28 }}>
          <svg className="module-empty-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto 14px" }}>
            <rect x="3.5" y="4.5" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1" />
            <line x1="3.5" y1="9" x2="20.5" y2="9" stroke="currentColor" strokeWidth="1" />
          </svg>
          <p className="module-empty-title">No sessions scheduled yet.</p>
          <p className="module-empty-sub">Once you book a session above, it will appear here — organized by date, ready for the day.</p>
        </div>
      ) : (
        <div className="sess-card-grid">
          {upcoming.map((a) => (
            <div key={a.id} className="sess-card">
              <div className="sess-card-head">
                <span className="sess-card-number">SESSION {sessionNumberByAppointmentId.get(a.id)}</span>
                <span className={`dash-status dash-status-${a.status.toLowerCase()}`}>{a.status}</span>
              </div>
              <p className="sess-card-date">
                {a.startsAt.toLocaleDateString(undefined, { month: "long", day: "numeric" })} ·{" "}
                {a.startsAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </p>
              <p className="sess-card-client">
                <Link href={`/hub/clients/${a.clientId}`}>
                  {a.client.firstName} {a.client.lastName}
                </Link>
              </p>
              {techList(a.technologies).length > 0 && (
                <div className="sess-card-techs">
                  {techList(a.technologies).map((t) => (
                    <span key={t.name} className="sess-tech-chip">
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="sess-card-footer">
                {a.estimatedMinutes ? <span>{a.estimatedMinutes} min</span> : <span />}
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href={`/hub/clients/${a.clientId}`} className="dash-view-btn">
                    View
                  </Link>
                  {canManage && (
                    <form
                      action={async () => {
                        "use server";
                        await cancelAppointment(a.id);
                      }}
                    >
                      <button type="submit" className="sess-cancel-btn">
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 className="dash-section-title" style={{ marginTop: 40 }}>
        Past Sessions
      </h3>
      {past.length === 0 ? (
        <div className="module-empty">
          <svg className="module-empty-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto 14px" }}>
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1" />
            <path d="M12 8v4l2.5 2.2" stroke="currentColor" strokeWidth="1" />
          </svg>
          <p className="module-empty-title">No history yet.</p>
          <p className="module-empty-sub">Completed and past sessions will build a record here over time.</p>
        </div>
      ) : (
        <div className="sess-card-grid sess-card-grid-past">
          {past.map((a) => (
            <div key={a.id} className="sess-card sess-card-past">
              <div className="sess-card-head">
                <span className="sess-card-number">SESSION {sessionNumberByAppointmentId.get(a.id)}</span>
                <span className={`dash-status dash-status-${a.status.toLowerCase()}`}>{a.status}</span>
              </div>
              <p className="sess-card-date">
                {a.startsAt.toLocaleDateString(undefined, { month: "long", day: "numeric" })} — {a.client.firstName} {a.client.lastName}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
