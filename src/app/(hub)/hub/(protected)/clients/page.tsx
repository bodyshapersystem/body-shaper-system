import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function HubClientsPage() {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "clients.view")) {
    redirect("/hub/dashboard");
  }

  const clients = await prisma.client.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "desc" },
    include: { user: true, rewardsAccount: true },
  });

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Clients</p>
        <h1>every client, one record.</h1>
      </div>

      {clients.length === 0 ? (
        <p style={{ opacity: 0.6 }}>
          No clients yet. Convert a lead from its detail page once payment is confirmed.
        </p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
              <th style={{ padding: "10px 8px" }}>Name</th>
              <th style={{ padding: "10px 8px" }}>Email</th>
              <th style={{ padding: "10px 8px" }}>Portal Status</th>
              <th style={{ padding: "10px 8px" }}>Tier</th>
              <th style={{ padding: "10px 8px" }}>Client Since</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <td style={{ padding: "10px 8px" }}>
                  <Link href={`/hub/clients/${client.id}`}>
                    {client.firstName} {client.lastName}
                  </Link>
                </td>
                <td style={{ padding: "10px 8px" }}>{client.email}</td>
                <td style={{ padding: "10px 8px" }}>{(client.user.portalStatus ?? "—").replace(/_/g, " ")}</td>
                <td style={{ padding: "10px 8px" }}>{client.membershipTier}</td>
                <td style={{ padding: "10px 8px" }}>{client.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

