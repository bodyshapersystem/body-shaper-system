import { notFound, redirect } from "next/navigation";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getClientPhotoSignedUrlForAdmin } from "@/app/(portal)/portal/(protected)/photos/actions";
import { getProgressPhotosData } from "@/lib/progress-photos-data";
import ProgressPhotosView from "@/app/(portal)/portal/(protected)/photos/ProgressPhotosView";

export const dynamic = "force-dynamic";

/**
 * Real read-only Hub preview of a client's Progress Photos™ — reuses
 * the exact same ProgressPhotosView the client sees in the portal,
 * fed by the exact same data-assembly logic (getProgressPhotosData),
 * just resolved through Hub admin permissions instead of a portal
 * client session. Celebration overlay is intentionally left off here
 * (it's a client-facing moment, not something the specialist needs
 * triggered while reviewing).
 */
export default async function HubProgressPhotosPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  if (!hasPermission(user, "blueprints.manage")) notFound();

  const client = await prisma.client.findUnique({ where: { id }, select: { firstName: true, lastName: true } });
  if (!client) notFound();

  const data = await getProgressPhotosData(id, (photoId) => getClientPhotoSignedUrlForAdmin(photoId, id));

  return (
    <div className="cat-body portal-page" style={{ background: "var(--ivory)", minHeight: "100vh", padding: "24px 16px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto 16px" }}>
        <a href={`/hub/clients/${id}?tab=blueprint`} className="dtj-link-small">← Back to {client.firstName} {client.lastName}&apos;s Blueprint</a>
        <p className="pay-history-meta" style={{ marginTop: 8 }}>
          This is exactly what {client.firstName} sees in her portal — read-only preview.
        </p>
      </div>
      <ProgressPhotosView
        sessions={data.sessions}
        firstSessionNumber={data.firstSessionNumber}
        latestSessionNumber={data.latestSessionNumber}
        finalCallouts={data.finalCallouts}
        celebration={null}
      />
    </div>
  );
}
