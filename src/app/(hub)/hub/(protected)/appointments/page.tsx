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

  const [appointments, clients] = await Promise.all([
    prisma.appointment.findMany({
      where: { status: { not: "CANCELLED" } },
      include: { client: true },
      orderBy: { startsAt: "asc" },
    }),
    prisma.client.findMany({ where: { archivedAt: null }, orderBy: { firstName: "asc" } }),
  ]);

  const now = new Date();
  const upcoming = appointments.filter((a) => a.startsAt >= now);
  const past = appointments.filter((a) => a.startsAt < now);

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
        Upcoming
      </h3>
      {upcoming.length === 0 ? (
        <p style={{ opacity: 0.6, fontSize: 13, marginBottom: 28 }}>No upcoming appointments.</p>
      ) : (
        <ul style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5, paddingLeft: 0, listStyle: "none", marginBottom: 28 }}>
          {upcoming.map((a) => (
            <li key={a.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <span>
                <strong>{a.startsAt.toLocaleString()}</strong> — {a.title} —{" "}
                <Link href={`/hub/clients/${a.clientId}`}>
                  {a.client.firstName} {a.client.lastName}
                </Link>
              </span>
              {canManage && (
                <form
                  action={async () => {
                    "use server";
                    await cancelAppointment(a.id);
                  }}
                >
                  <button type="submit" style={{ fontSize: 12, padding: "4px 10px", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 4, background: "none" }}>
                    Cancel
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}

      <h3 className="dash-section-title">Past</h3>
      {past.length === 0 ? (
        <p style={{ opacity: 0.6, fontSize: 13 }}>No past appointments.</p>
      ) : (
        <ul style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5, paddingLeft: 0, listStyle: "none" }}>
          {past.map((a) => (
            <li key={a.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: 8, opacity: 0.75 }}>
              {a.startsAt.toLocaleString()} — {a.title} — {a.client.firstName} {a.client.lastName} ({a.status})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
