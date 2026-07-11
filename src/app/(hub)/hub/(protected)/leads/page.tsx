import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HubLeadsPage() {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "leads.view")) {
    redirect("/hub/dashboard");
  }

  const leads = await prisma.lead.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Leads</p>
        <h1>every lead, one pipeline.</h1>
      </div>

      {hasPermission(user, "leads.create") && (
        <p style={{ marginBottom: 24 }}>
          <Link href="/hub/leads/new" className="cta btn">
            + New Lead
          </Link>
        </p>
      )}

      {leads.length === 0 ? (
        <p style={{ opacity: 0.6 }}>No leads yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
              <th style={{ padding: "10px 8px" }}>Name</th>
              <th style={{ padding: "10px 8px" }}>Email</th>
              <th style={{ padding: "10px 8px" }}>Status</th>
              <th style={{ padding: "10px 8px" }}>Source</th>
              <th style={{ padding: "10px 8px" }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <td style={{ padding: "10px 8px" }}>
                  <Link href={`/hub/leads/${lead.id}`}>{lead.name}</Link>
                </td>
                <td style={{ padding: "10px 8px" }}>{lead.email}</td>
                <td style={{ padding: "10px 8px" }}>{lead.status.replace(/_/g, " ")}</td>
                <td style={{ padding: "10px 8px" }}>{lead.source ?? "—"}</td>
                <td style={{ padding: "10px 8px" }}>{lead.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
