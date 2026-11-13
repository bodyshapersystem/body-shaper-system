import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBusinessTimezone, formatTimeInTimezone } from "@/lib/format-datetime";
import { formatTech } from "@/lib/tech-count";

/**
 * Owner dashboard overview: money this month, the week's agenda and
 * the lead funnel. Server component — real data only.
 */

const money = (c: number) => `$${Math.round(c / 100).toLocaleString("en-US")}`;
const dayKey = (d: Date, tz: string) => d.toLocaleDateString("en-CA", { timeZone: tz });
const STUCK_DAYS = 7;

const FUNNEL: { label: string; statuses: string[]; href: string }[] = [
  { label: "new", statuses: ["NEW", "CONTACTED", "QUALIFIED"], href: "/hub/leads" },
  { label: "blueprint done", statuses: ["BLUEPRINT_COMPLETED", "CONSULTATION_SCHEDULED"], href: "/hub/leads" },
  { label: "proposal sent", statuses: ["PROPOSAL_CREATED", "PROPOSAL_ACCEPTED", "PAYMENT_PENDING"], href: "/hub/proposals" },
  { label: "paid", statuses: ["PAYMENT_CONFIRMED", "CONVERTED"], href: "/hub/clients" },
];

export default async function OwnerOverview() {
  const tz = await getBusinessTimezone();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const sameDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate(), now.getHours());
  const in7 = new Date(now.getTime() + 7 * 86400000);
  // Fetch a padded window, then bucket by the business time zone's calendar day.
  const weekStart = new Date(now.getTime() - 86400000);
  const weekEnd = new Date(now.getTime() + 8 * 86400000);
  const stuckBefore = new Date(now.getTime() - STUCK_DAYS * 86400000);

  const [paidThisMonth, paidLastMonthToDate, pending, dueThisWeek, societyOwed, weekAppointments, leads] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "PAID", paidAt: { gte: startOfMonth } }, _sum: { amountCents: true } }),
    prisma.payment.aggregate({ where: { status: "PAID", paidAt: { gte: startOfLastMonth, lt: sameDayLastMonth } }, _sum: { amountCents: true } }),
    prisma.payment.aggregate({ where: { status: "PENDING" }, _sum: { amountCents: true }, _count: true }),
    prisma.payment.findMany({
      where: { status: "PENDING", dueDate: { gte: new Date(now.getTime() - 86400000), lte: in7 } },
      orderBy: { dueDate: "asc" },
      take: 6,
      include: { client: { select: { firstName: true, lastName: true } } },
    }),
    prisma.societyCommission.aggregate({ where: { status: { in: ["PENDING", "APPROVED"] } }, _sum: { amountCents: true }, _count: true }),
    prisma.appointment.findMany({
      where: { startsAt: { gte: weekStart, lt: weekEnd }, status: { in: ["SCHEDULED", "COMPLETED"] } },
      orderBy: { startsAt: "asc" },
      include: { client: { select: { id: true, firstName: true, lastName: true } } },
    }),
    prisma.lead.findMany({
      where: { archivedAt: null, status: { notIn: ["LOST", "ARCHIVED"] }, createdAt: { gte: new Date(now.getTime() - 90 * 86400000) } },
      select: { id: true, firstName: true, lastName: true, status: true, updatedAt: true },
    }),
  ]);

  const thisMonth = paidThisMonth._sum.amountCents ?? 0;
  const lastMonth = paidLastMonthToDate._sum.amountCents ?? 0;
  const delta = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() + i * 86400000);
    const key = dayKey(d, tz);
    return {
      key,
      label: i === 0 ? "today" : d.toLocaleDateString("en-US", { weekday: "short", timeZone: tz }).toLowerCase(),
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: tz }),
      items: weekAppointments.filter((a) => dayKey(a.startsAt, tz) === key),
    };
  });

  const funnel = FUNNEL.map((stage) => {
    const inStage = leads.filter((l) => stage.statuses.includes(l.status));
    const stuck = stage.label === "paid" ? [] : inStage.filter((l) => l.updatedAt < stuckBefore);
    return { ...stage, count: inStage.length, stuck };
  });
  const maxFunnel = Math.max(1, ...funnel.map((f) => f.count));

  return (
    <div className="oov">
      {/* ---------- Money ---------- */}
      <section className="oov-card oov-money">
        <div className="oov-head">
          <h3>this month</h3>
          <Link href="/hub/payments" className="pd-link">payments →</Link>
        </div>
        <div className="oov-money-main">
          <strong>{money(thisMonth)}</strong>
          <span className={delta === null ? "oov-delta" : delta >= 0 ? "oov-delta up" : "oov-delta down"}>
            {delta === null ? "collected" : `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)}% vs. same point last month`}
          </span>
        </div>
        <div className="oov-money-grid">
          <div><span>pending to collect</span><strong>{money(pending._sum.amountCents ?? 0)}</strong><em>{pending._count} payment{pending._count === 1 ? "" : "s"}</em></div>
          <div><span>society commissions owed</span><strong>{money(societyOwed._sum.amountCents ?? 0)}</strong><em><Link href="/hub/society">{societyOwed._count} open</Link></em></div>
        </div>
        <p className="oov-sub">due in the next 7 days</p>
        {dueThisWeek.length === 0 ? (
          <p className="oov-empty">Nothing due this week.</p>
        ) : (
          <ul className="oov-list">
            {dueThisWeek.map((p) => (
              <li key={p.id}>
                <span>{p.client.firstName} {p.client.lastName.slice(0, 1)}.</span>
                <em>{p.dueDate?.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: tz })}</em>
                <strong>{money(p.amountCents)}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------- Week ---------- */}
      <section className="oov-card oov-week">
        <div className="oov-head">
          <h3>this week</h3>
          <span style={{ display: "flex", gap: 14 }}>
            <Link href="/hub/recap" className="pd-link">today&apos;s recap →</Link>
            <Link href="/hub/appointments" className="pd-link">calendar →</Link>
          </span>
        </div>
        <div className="oov-days">
          {days.map((d) => (
            <div key={d.key} className={d.label === "today" ? "oov-day oov-today" : "oov-day"}>
              <p className="oov-day-label">{d.label} <em>{d.date}</em></p>
              {d.items.length === 0 ? (
                <p className="oov-day-empty">—</p>
              ) : (
                d.items.map((a) => {
                  const techs = Array.isArray(a.technologies) ? (a.technologies as { name: string; number?: number }[]) : [];
                  return (
                    <Link key={a.id} href={`/hub/clients/${a.client.id}`} className={a.status === "COMPLETED" ? "oov-appt done" : "oov-appt"}>
                      <b>{formatTimeInTimezone(a.startsAt, tz)}</b> {a.client.firstName} {a.client.lastName.slice(0, 1)}.
                      {techs.length > 0 && <span>{techs.map((t) => formatTech({ name: t.name.replace(/[™®]/g, "").replace(/ Elite/, ""), number: t.number })).join(" + ")}</span>}
                    </Link>
                  );
                })
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Funnel ---------- */}
      <section className="oov-card oov-funnel">
        <div className="oov-head">
          <h3>lead funnel <em>last 90 days</em></h3>
          <Link href="/hub/leads" className="pd-link">leads →</Link>
        </div>
        {funnel.map((f) => (
          <div key={f.label} className="oov-stage">
            <Link href={f.href} className="oov-stage-row">
              <span className="oov-stage-label">{f.label}</span>
              <span className="oov-stage-bar"><span style={{ width: `${(f.count / maxFunnel) * 100}%` }} /></span>
              <strong>{f.count}</strong>
            </Link>
            {f.stuck.length > 0 && (
              <p className="oov-stuck">
                {f.stuck.length} waiting {STUCK_DAYS}+ days:{" "}
                {f.stuck.slice(0, 4).map((l, i) => (
                  <span key={l.id}>
                    {i > 0 && ", "}
                    <Link href={`/hub/leads/${l.id}`}>{l.firstName} {l.lastName.slice(0, 1)}.</Link>
                  </span>
                ))}
                {f.stuck.length > 4 && ` +${f.stuck.length - 4}`}
              </p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
