import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  INTAKE_SUBMITTED: "Intake Submitted",
  BASELINE_PENDING: "Baseline Pending",
  BASELINE_COMPLETED: "Baseline Completed",
  VALIDATED: "Validated",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  SUPERSEDED: "Superseded",
  ARCHIVED: "Archived",
};

export default async function HubBlueprintsPage() {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "blueprints.manage")) redirect("/hub/dashboard");

  const assessments = await prisma.blueprintAssessment.findMany({
    where: { clientId: { not: null } },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Operations</p>
        <h1>body blueprint™.</h1>
      </div>

      {assessments.length === 0 ? (
        <p style={{ opacity: 0.6 }}>No Blueprint Assessments yet — they're created automatically when a Lead converts to a Client.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
              <th style={{ padding: "10px 8px" }}>Client</th>
              <th style={{ padding: "10px 8px" }}>Version</th>
              <th style={{ padding: "10px 8px" }}>Status</th>
              <th style={{ padding: "10px 8px" }}>Recommended System</th>
              <th style={{ padding: "10px 8px" }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <td style={{ padding: "10px 8px" }}>
                  <Link href={`/hub/clients/${a.clientId}?tab=blueprint`}>
                    {a.client?.firstName} {a.client?.lastName}
                  </Link>
                </td>
                <td style={{ padding: "10px 8px" }}>v{a.version}</td>
                <td style={{ padding: "10px 8px" }}>{STATUS_LABELS[a.status] ?? a.status}</td>
                <td style={{ padding: "10px 8px" }}>{a.recommendedSystem ?? "—"}</td>
                <td style={{ padding: "10px 8px" }}>{a.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
