import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { createAppointment, cancelAppointment, updateAppointment } from "./actions";

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
        <p className="portal-eyebrow">Operations</p>
        <h1>appointments.</h1>
      </div>

      {canManage && (
        <form
          action={async (formData: FormData) => {
            "use server";
            await createAppointment(formData);
          }}
          style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32, maxWidth: 800 }}
        >
          <select name="clientId" required style={{ padding: 10 }}>
            <option value="">Select client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
          <input name="title" placeholder="Appointment title" required style={{ padding: 10, flex: 1 }} />
          <input name="startsAt" type="datetime-local" required style={{ padding: 10 }} />
          <input name="endsAt" type="datetime-local" style={{ padding: 10 }} />
          <input name="notes" placeholder="Notes" style={{ padding: 10, flex: 1 }} />
          <button type="submit" className="auth-submit" style={{ width: "auto", padding: "10px 20px" }}>
            Schedule
          </button>
        </form>
      )}

      <h3 style={{ fontSize: 14, marginBottom: 10 }}>Upcoming</h3>
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

      <h3 style={{ fontSize: 14, marginBottom: 10 }}>Past</h3>
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
