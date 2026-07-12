import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { updatePaymentStatus, getFinancialOverview } from "./actions";
import PaymentRecorder from "./PaymentRecorder";

export const dynamic = "force-dynamic";

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const ORIGIN_LABELS: Record<string, string> = {
  CLIENT_PAYMENT: "Client Payment",
  AMBASSADOR: "Ambassador",
  INFLUENCER_COLLABORATION: "Influencer Collaboration",
  PARTNER: "Partner",
  INTERNAL_ADJUSTMENT: "Internal Adjustment",
};

export default async function HubPaymentsPage() {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  const canManage = hasPermission(user, "payments.manage");

  const [payments, clients, overview] = await Promise.all([
    prisma.payment.findMany({
      include: { client: { include: { blueprintAssessments: { where: { status: { not: "SUPERSEDED" } }, orderBy: { version: "desc" }, take: 1 } } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.client.findMany({ where: { archivedAt: null }, orderBy: { firstName: "asc" } }),
    getFinancialOverview(),
  ]);

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">finance</p>
        <h1>payments.</h1>
        <p className="dash-subtitle">Manage payments, plans and client balances.</p>
      </div>

      {/* ---------- Financial Overview ---------- */}
      <div className="pd-stats" style={{ marginBottom: 36 }}>
        <div className="pd-stat">
          <span className="pd-stat-label">Total Collected</span>
          <strong>{money(overview.totalCollectedCents)}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">This Month</span>
          <strong>{money(overview.collectedThisMonthCents)}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Pending Balance</span>
          <strong>{money(overview.pendingBalanceCents)}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Refunds</span>
          <strong>{money(overview.refundsCents)}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Average Client Value</span>
          <strong>{money(overview.averageClientValueCents)}</strong>
        </div>
      </div>

      {canManage && (
        <div className="sched-wrap">
          <PaymentRecorder clients={clients.map((c) => ({ id: c.id, firstName: c.firstName, lastName: c.lastName }))} />
        </div>
      )}

      <h3 className="dash-section-title" style={{ marginTop: 40 }}>
        Payment History
      </h3>
      {payments.length === 0 ? (
        <p className="dash-empty">No payments recorded yet.</p>
      ) : (
        <div className="sess-card-grid">
          {payments.map((p) => {
            const system = p.client.blueprintAssessments[0]?.recommendedSystem;
            return (
              <div key={p.id} className="sess-card">
                <div className="sess-card-head">
                  <span className="sess-card-number">{p.createdAt.toLocaleDateString()}</span>
                  <span className={`dash-status dash-status-${p.status.toLowerCase()}`}>{p.status}</span>
                </div>
                <p className="sess-card-date">{money(p.amountCents)}</p>
                {p.installmentNumber && (
                  <p className="pay-history-meta">
                    Payment {p.installmentNumber} of {p.installmentTotal}
                  </p>
                )}
                <p className="sess-card-client">
                  <Link href={`/hub/clients/${p.clientId}`}>
                    {p.client.firstName} {p.client.lastName}
                  </Link>
                </p>
                <p className="pay-history-meta">
                  {p.method}
                  {p.paymentType ? ` · ${p.paymentType.replace(/_/g, " ")}` : ""} · {ORIGIN_LABELS[p.origin] ?? p.origin}
                </p>
                {system && <p className="pay-history-meta">{system}</p>}
                {p.reference && <p className="pay-history-meta">Ref: {p.reference}</p>}
                {p.notes && <p className="pay-history-meta">{p.notes}</p>}
                {canManage && p.status === "PENDING" && (
                  <div className="sess-card-footer">
                    <span />
                    <form
                      action={async () => {
                        "use server";
                        await updatePaymentStatus(p.id, "PAID");
                      }}
                    >
                      <button type="submit" className="dash-view-btn">
                        Mark Paid
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
