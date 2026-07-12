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

  function techList(technologies: unknown): { name: string }[] {
    if (!Array.isArray(technologies)) return [];
    return technologies.map((t) => (typeof t === "string" ? { name: t } : (t as { name: string })));
  }

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">operations</p>
        <h1>appointments.</h1>
        <p className="dash-subtitle">Every visit is another step toward your client's transformation.</p>
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
        <p className="dash-empty" style={{ marginBottom: 28 }}>
          No upcoming appointments.
        </p>
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
        <p className="dash-empty">No past appointments.</p>
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
