import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { createPayment, updatePaymentStatus } from "./actions";

export const dynamic = "force-dynamic";

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function HubPaymentsPage() {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  const canManage = hasPermission(user, "payments.manage");

  const [payments, clients] = await Promise.all([
    prisma.payment.findMany({ include: { client: true }, orderBy: { createdAt: "desc" } }),
    prisma.client.findMany({ where: { archivedAt: null }, orderBy: { firstName: "asc" } }),
  ]);

  const totalPaid = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amountCents, 0);
  const totalPending = payments.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amountCents, 0);

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Business</p>
        <h1>payments.</h1>
      </div>

      <div className="pd-stats" style={{ marginBottom: 32 }}>
        <div className="pd-stat">
          <span className="pd-stat-label">Total Paid</span>
          <strong>{money(totalPaid)}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Pending</span>
          <strong>{money(totalPending)}</strong>
        </div>
      </div>

      {canManage && (
        <form
          action={async (formData: FormData) => {
            "use server";
            await createPayment(formData);
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
          <input name="amount" type="number" step="0.01" placeholder="Amount ($)" required style={{ padding: 10 }} />
          <select name="method" defaultValue="CARD" style={{ padding: 10 }}>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="TRANSFER">Transfer</option>
            <option value="OTHER">Other</option>
          </select>
          <select name="status" defaultValue="PENDING" style={{ padding: 10 }}>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
          </select>
          <input name="notes" placeholder="Notes" style={{ padding: 10, flex: 1 }} />
          <button type="submit" className="auth-submit" style={{ width: "auto", padding: "10px 20px" }}>
            Record Payment
          </button>
        </form>
      )}

      {payments.length === 0 ? (
        <p style={{ opacity: 0.6 }}>No payments recorded yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
              <th style={{ padding: "10px 8px" }}>Client</th>
              <th style={{ padding: "10px 8px" }}>Amount</th>
              <th style={{ padding: "10px 8px" }}>Method</th>
              <th style={{ padding: "10px 8px" }}>Status</th>
              <th style={{ padding: "10px 8px" }}>Date</th>
              {canManage && <th style={{ padding: "10px 8px" }}>Action</th>}
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <td style={{ padding: "10px 8px" }}>
                  <Link href={`/hub/clients/${p.clientId}`}>
                    {p.client.firstName} {p.client.lastName}
                  </Link>
                </td>
                <td style={{ padding: "10px 8px" }}>{money(p.amountCents)}</td>
                <td style={{ padding: "10px 8px" }}>{p.method}</td>
                <td style={{ padding: "10px 8px" }}>{p.status}</td>
                <td style={{ padding: "10px 8px" }}>{p.createdAt.toLocaleDateString()}</td>
                {canManage && (
                  <td style={{ padding: "10px 8px" }}>
                    {p.status === "PENDING" && (
                      <form
                        action={async () => {
                          "use server";
                          await updatePaymentStatus(p.id, "PAID");
                        }}
                      >
                        <button type="submit" style={{ fontSize: 12, padding: "4px 10px", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 4, background: "none" }}>
                          Mark Paid
                        </button>
                      </form>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
