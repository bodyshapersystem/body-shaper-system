import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { addRewardsTransaction } from "./actions";

export const dynamic = "force-dynamic";

export default async function HubRewardsPage() {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  const canManage = hasPermission(user, "rewards.manage");

  const accounts = await prisma.rewardsAccount.findMany({
    include: {
      client: true,
      transactions: { orderBy: { createdAt: "desc" }, take: 3 },
    },
    orderBy: { pointsBalance: "desc" },
  });

  const clients = await prisma.client.findMany({ where: { archivedAt: null }, orderBy: { firstName: "asc" } });

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Business</p>
        <h1>rewards™.</h1>
      </div>

      {canManage && (
        <form
          action={async (formData: FormData) => {
            "use server";
            await addRewardsTransaction(formData);
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
          <input name="points" type="number" placeholder="Points (+/-)" required style={{ padding: 10, width: 140 }} />
          <input name="action" placeholder="Action (e.g. Referral bonus)" required style={{ padding: 10, flex: 1 }} />
          <input name="notes" placeholder="Notes" style={{ padding: 10, flex: 1 }} />
          <button type="submit" className="auth-submit" style={{ width: "auto", padding: "10px 20px" }}>
            Add
          </button>
        </form>
      )}

      {accounts.length === 0 ? (
        <p style={{ opacity: 0.6 }}>No rewards accounts yet — they're created automatically when a Lead converts to a Client.</p>
      ) : (
        <ul style={{ display: "flex", flexDirection: "column", gap: 16, listStyle: "none", paddingLeft: 0 }}>
          {accounts.map((acc) => (
            <li key={acc.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: 14, fontSize: 13.5 }}>
              <strong>
                <Link href={`/hub/clients/${acc.clientId}`}>
                  {acc.client.firstName} {acc.client.lastName}
                </Link>
              </strong>{" "}
              — {acc.pointsBalance} pts — {acc.tier}
              {acc.transactions.length > 0 && (
                <ul style={{ marginTop: 6, opacity: 0.7, paddingLeft: 16 }}>
                  {acc.transactions.map((t) => (
                    <li key={t.id}>
                      {t.createdAt.toLocaleDateString()}: {t.points > 0 ? "+" : ""}
                      {t.points} — {t.action}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
