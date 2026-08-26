import { getCurrentPortalClient } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { getClientPhotoSignedUrl } from "./actions";
import { getProgressPhotosData } from "@/lib/progress-photos-data";
import ProgressPhotosView from "./ProgressPhotosView";

export const dynamic = "force-dynamic";

export default async function ProgressPhotosPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const data = await getProgressPhotosData(client.id, getClientPhotoSignedUrl, {
    includeCelebration: true,
    lastCelebratedPhotoSessionNumber: client.lastCelebratedPhotoSessionNumber,
  });

  return (
    <div className="cat-body portal-page">
      <ProgressPhotosView
        sessions={data.sessions}
        firstSessionNumber={data.firstSessionNumber}
        latestSessionNumber={data.latestSessionNumber}
        finalCallouts={data.finalCallouts}
        celebration={data.celebration}
      />
    </div>
  );
}
