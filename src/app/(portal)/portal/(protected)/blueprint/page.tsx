import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentPortalClient } from "@/lib/permissions";
import BlueprintReport from "@/app/(hub)/hub/(protected)/clients/[id]/BlueprintReport";

export const dynamic = "force-dynamic";

export default async function PortalBlueprintPage() {
  const portalClient = await getCurrentPortalClient();
  if (!portalClient) redirect("/portal/login");

  // Same shared include shape BlueprintReport expects — one component,
  // one data source, for both the Owner Hub and the Client Portal.
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
    <div className="cat-body portal-page">
      {client.blueprintAssessments.length === 0 ? (
        <div className="bp-empty-state">
          <p>Your Body Blueprint™ isn't ready yet.</p>
          <p className="pay-history-meta">Your specialist will complete this as soon as your assessment is validated.</p>
        </div>
      ) : (
        <BlueprintReport client={client} clientId={client.id} mode="client" />
      )}
    </div>
  );
}
