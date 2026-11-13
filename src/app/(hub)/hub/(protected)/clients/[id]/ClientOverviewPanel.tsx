import Link from "next/link";
import PackageWaves from "@/components/PackageWaves";
import { computePackageTracker, parsePackageTechnologies, formatTech } from "@/lib/tech-count";

/**
 * Hub → client → Overview: money, sessions, next visit, package waves,
 * payment plan, recent sessions and quick actions — in the brand system.
 */

type Appt = { id: string; title: string; startsAt: Date; status: string; technologies: unknown; locationType: string };
type Pay = { id: string; amountCents: number; status: string; paidAt: Date | null; dueDate: Date | null; method: string; installmentNumber: number | null; installmentTotal: number | null; paymentType: string | null };

const money = (c: number) => `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export default function ClientOverviewPanel({
  clientId,
  overview,
  appointments,
  payments,
  packageRaw,
  timezone,
  priorCreditSlot,
}: {
  clientId: string;
  overview: {
    system: string | null;
    totalSessions: number | null;
    completedCount: number;
    remaining: number | null;
    planTotalCents: number | null;
    paidCents: number;
    balanceCents: number | null;
    nextAppointment: { startsAt: Date } | null;
    onHoldCount: number;
    overallProgressPercent: number | null;
  };
  appointments: Appt[];
  payments: Pay[];
  packageRaw: unknown;
  timezone: string;
  priorCreditSlot?: React.ReactNode;
}) {
  const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { timeZone: timezone, ...o }).format(d);
  const pkg = parsePackageTechnologies(packageRaw);
  const rows = pkg ? computePackageTracker(pkg, appointments) : [];
  const paidPct = overview.planTotalCents ? Math.min(100, Math.round((overview.paidCents / overview.planTotalCents) * 100)) : null;
  const sessionPct = overview.overallProgressPercent ?? 0;
  const next = overview.nextAppointment;
  const plan = [...payments]
    .filter((p) => p.status === "PAID" || p.status === "PENDING")
    .sort((a, b) => (a.paidAt ?? a.dueDate ?? new Date(0)).getTime() - (b.paidAt ?? b.dueDate ?? new Date(0)).getTime());
  const recent = [...appointments].filter((a) => a.status === "COMPLETED").slice(0, 4);

  return (
    <div className="cov">
      {/* ---------- KPI row ---------- */}
      <div className="cov-kpis">
        <div className="cov-kpi cov-kpi-marble">
          <span>paid</span>
          <strong>{money(overview.paidCents)}</strong>
          {overview.planTotalCents !== null ? (
            <>
              <span className="cov-bar"><span style={{ width: `${paidPct}%` }} /></span>
              <em>{overview.balanceCents ? `${money(overview.balanceCents)} balance` : "paid in full ✓"} · plan {money(overview.planTotalCents)}</em>
            </>
          ) : (
            <em>plan value not set</em>
          )}
        </div>
        <div className="cov-kpi">
          <span>sessions</span>
          <strong>
            {overview.completedCount}
            <small>{overview.totalSessions !== null ? ` / ${overview.totalSessions}` : ""}</small>
          </strong>
          <span className="cov-bar cov-bar-light"><span style={{ width: `${sessionPct}%` }} /></span>
          <em>{overview.remaining !== null ? `${overview.remaining} remaining` : "total not set"}{overview.onHoldCount ? ` · ${overview.onHoldCount} on hold` : ""}</em>
        </div>
        <div className="cov-kpi cov-kpi-next">
          <span>next visit</span>
          {next ? (
            <div className="cov-next">
              <div className="stl-date">
                <span className="stl-wd">{fmt(next.startsAt, { weekday: "short" })}</span>
                <strong>{fmt(next.startsAt, { day: "numeric" })}</strong>
                <span className="stl-mo">{fmt(next.startsAt, { month: "short" })}</span>
              </div>
              <div>
                <b>{fmt(next.startsAt, { hour: "numeric", minute: "2-digit" })}</b>
                <em>{fmt(next.startsAt, { weekday: "long" })}</em>
              </div>
            </div>
          ) : (
            <>
              <strong className="cov-none">—</strong>
              <em><Link href={`/hub/appointments#new-appointment`}>book one →</Link></em>
            </>
          )}
        </div>
      </div>

      {/* ---------- package ---------- */}
      {rows.length > 0 ? (
        <PackageWaves rows={rows} timeZone={timezone} title={`her system${overview.system ? ` · ${overview.system}` : ""}`} />
      ) : (
        <div className="cov-card cov-card-hint">
          <p className="cov-label">her system</p>
          <h3>{overview.system ?? "No system yet"}</h3>
          <p className="cov-muted">Set her package (sessions per technology) from the package card when you schedule her next appointment — it appears here as Blueprint Waves™.</p>
        </div>
      )}

      <div className="cov-two">
        {/* ---------- payment plan ---------- */}
        <section className="cov-card">
          <div className="cov-head">
            <h3>payment plan</h3>
            <Link href={`/hub/clients/${clientId}?tab=payments`} className="pd-link">all payments →</Link>
          </div>
          {plan.length === 0 ? (
            <p className="cov-muted">No payments recorded yet.</p>
          ) : (
            <ol className="cov-plan">
              {plan.map((p) => {
                const date = p.paidAt ?? p.dueDate;
                const label = p.paymentType === "DEPOSIT" ? "deposit" : p.installmentNumber && p.installmentTotal ? `payment ${p.installmentNumber} of ${p.installmentTotal}` : (p.paymentType ?? "payment").toLowerCase().replace("_", " ");
                return (
                  <li key={p.id} className={p.status === "PAID" ? "cov-plan-paid" : "cov-plan-due"}>
                    <span className="cov-plan-dot">{p.status === "PAID" ? "✓" : ""}</span>
                    <div>
                      <b>{label}</b>
                      <em>
                        {p.status === "PAID" ? "paid" : "due"} {date ? fmt(date, { month: "short", day: "numeric" }) : ""}
                        {p.status === "PAID" ? ` · ${p.method === "TRANSFER" ? "Zelle" : p.method.toLowerCase()}` : ""}
                      </em>
                    </div>
                    <strong>{money(p.amountCents)}</strong>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* ---------- recent sessions ---------- */}
        <section className="cov-card">
          <div className="cov-head">
            <h3>recent sessions</h3>
            <Link href={`/hub/clients/${clientId}?tab=appointments`} className="pd-link">all sessions →</Link>
          </div>
          {recent.length === 0 ? (
            <p className="cov-muted">No completed sessions yet.</p>
          ) : (
            <ul className="cov-recent">
              {recent.map((a) => {
                const techs = Array.isArray(a.technologies) ? (a.technologies as { name?: string; number?: number }[]).filter((t) => t?.name) : [];
                return (
                  <li key={a.id}>
                    <span className="cov-recent-date">{fmt(a.startsAt, { month: "short", day: "numeric" })}</span>
                    <span className="cov-recent-what">
                      {techs.length > 0 ? techs.map((t) => formatTech({ name: String(t.name).replace(/[™®]/g, "").replace(/ Elite/i, ""), number: t.number })).join(" + ") : a.title}
                    </span>
                    <span className="stl-check">✓</span>
                  </li>
                );
              })}
            </ul>
          )}
          {priorCreditSlot && <div className="cov-prior">{priorCreditSlot}</div>}
        </section>
      </div>

      {/* ---------- quick actions ---------- */}
      <nav className="ptiles cov-actions" aria-label="Quick actions">
        {[
          { href: `/hub/appointments#new-appointment`, eyebrow: "schedule", title: "New Appointment" },
          { href: "/hub/payments", eyebrow: "money", title: "Record Payment" },
          { href: `/hub/clients/${clientId}?tab=blueprint`, eyebrow: "results", title: "Progress Photos" },
          { href: `/hub/clients/${clientId}?tab=notes`, eyebrow: "notes", title: "Add Note" },
        ].map((t) => (
          <Link key={t.title} href={t.href} className="ptile">
            <span className="ptile-eyebrow">{t.eyebrow}</span>
            <span className="ptile-title">{t.title}</span>
            <span className="ptile-arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
