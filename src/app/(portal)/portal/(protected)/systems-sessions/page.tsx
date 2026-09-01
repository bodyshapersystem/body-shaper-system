import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentPortalClient } from "@/lib/permissions";
import BlueprintReport from "@/app/(hub)/hub/(protected)/clients/[id]/BlueprintReport";
import AppointmentsPageContent from "@/app/(portal)/portal/(protected)/appointments/AppointmentsPageContent";
import SystemsSessionsTabbedView from "./SystemsSessionsTabbedView";

export const dynamic = "force-dynamic";

/**
 * Systems & Sessions™ — real migration, not a rebuild: reuses the
 * exact same BlueprintReport data-fetch/markup already used by
 * Blueprint and the Owner Hub (System / Architecture / Why Selected
 * sections, tagged data-bp-tab="system"), just surfaced under its own
 * top-level nav item and CSS-filtered to show only those sections —
 * nothing here is a second copy of that data. Sessions reuses the
 * real appointments view. The Interactive Session Map builder (a
 * genuinely new feature, not a migration) is a later phase.
 */
export default async function PortalSystemsSessionsPage() {
  const portalClient = await getCurrentPortalClient();
  if (!portalClient) redirect("/portal/login");

  const client = await prisma.client.findUnique({
    where: { id: portalClient.id },
    include: {
      blueprintAssessments: {
        where: { status: { in: ["ACTIVE", "BASELINE_PENDING", "BASELINE_COMPLETED", "VALIDATED", "IN_PROGRESS", "COMPLETED"] } },
        orderBy: { version: "desc" },
        take: 1,
        include: {
          bodyMeasurements: { orderBy: { measuredAt: "desc" } },
          renphoScans: { orderBy: { scanDate: "desc" } },
          photos: { orderBy: { uploadedAt: "desc" } },
          specialistObservations: { orderBy: { createdAt: "desc" } },
          strategyChanges: { orderBy: { changedAt: "desc" } },
        },
      },
    },
  });

  if (!client) redirect("/portal/login");

  return (
    <div className="cat-body portal-page bp-client-materials">
      <div className="portal-page-head">
        <p className="portal-eyebrow">your strategy. in action.</p>
        <h1>systems & sessions™.</h1>
      </div>

      {client.blueprintAssessments.length === 0 ? (
        <div className="bp-empty-state">
          <p>Your Personalized System™ isn't ready yet.</p>
          <p className="pay-history-meta">Your specialist will complete this as soon as your assessment is validated.</p>
        </div>
      ) : (
        <SystemsSessionsTabbedView
          systemPanel={<BlueprintReport client={client} clientId={client.id} mode="client" />}
          sessionsPanel={<AppointmentsPageContent heading={false} />}
        />
      )}
    </div>
  );
}
