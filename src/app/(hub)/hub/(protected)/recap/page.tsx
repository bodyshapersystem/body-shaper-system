import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { getBusinessTimezone } from "@/lib/format-datetime";
import SessionDoneEditor from "@/components/hub/SessionDoneEditor";
import ConfirmAllButton from "./ConfirmAllButton";

export const dynamic = "force-dynamic";

const dayKey = (d: Date, tz: string) => d.toLocaleDateString("en-CA", { timeZone: tz });

/** End-of-day recap: confirm or correct what was actually done in each session. */
export default async function RecapPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  if (!hasPermission(user, "appointments.manage")) redirect("/hub/dashboard");
  const tz = await getBusinessTimezone();
  const { date } = await searchParams;
  const key = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : dayKey(new Date(), tz);

  const mid = new Date(`${key}T12:00:00Z`);
  const appts = (
    await prisma.appointment.findMany({
      where: { startsAt: { gte: new Date(mid.getTime() - 36 * 3600000), lte: new Date(mid.getTime() + 36 * 3600000) }, status: { in: ["SCHEDULED", "COMPLETED", "NO_SHOW"] } },
      orderBy: { startsAt: "asc" },
      include: { client: { select: { id: true, firstName: true, lastName: true } } },
    })
  ).filter((a) => dayKey(a.startsAt, tz) === key);

  const shift = (days: number) => {
    const d = new Date(`${key}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  };
  const label = new Date(`${key}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
  const pending = appts.filter((a) => a.status === "SCHEDULED");

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">end of day</p>
        <h1>session recap.</h1>
        <p className="dash-subtitle">Confirm what was done today — or correct the treatment, # and zone before it counts.</p>
      </div>

      <div className="rcp-daynav">
        <Link href={`/hub/recap?date=${shift(-1)}`} className="ss-btn ss-btn-sm ss-btn-outline-dark" aria-label="previous day">←</Link>
        <strong>{label}</strong>
        <Link href={`/hub/recap?date=${shift(1)}`} className="ss-btn ss-btn-sm ss-btn-outline-dark" aria-label="next day">→</Link>
      </div>

      {appts.length === 0 ? (
        <div className="stl-empty">No sessions on this day.</div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="rcp-all">
              <div>
                <strong>{pending.length} session{pending.length === 1 ? "" : "s"} to confirm</strong>
                <p>If everything went as planned, confirm them all at once.</p>
              </div>
              <ConfirmAllButton ids={pending.map((a) => a.id)} />
            </div>
          )}
          <div className="rcp-list">
            {appts.map((a) => {
              const techs = Array.isArray(a.technologies) ? (a.technologies as { name?: string; minutes?: number; number?: number; zone?: string }[]).filter((t) => t?.name) : [];
              return (
                <section key={a.id} className={`rcp-card rcp-${a.status.toLowerCase()}`}>
                  <div className="rcp-head">
                    <div className="stl-date">
                      <span className="stl-wd">{a.startsAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz })}</span>
                    </div>
                    <div className="rcp-who">
                      <Link href={`/hub/clients/${a.client.id}`}>{a.client.firstName} {a.client.lastName}</Link>
                      <em>{a.title}</em>
                    </div>
                    <span className={`rcp-status rcp-status-${a.status.toLowerCase()}`}>{a.status === "SCHEDULED" ? "to confirm" : a.status === "COMPLETED" ? "done ✓" : "didn't happen"}</span>
                  </div>
                  <SessionDoneEditor
                    appointmentId={a.id}
                    status={a.status}
                    initial={techs.map((t) => ({ name: String(t.name), minutes: t.minutes, number: t.number ?? null, zone: t.zone ?? null }))}
                  />
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
