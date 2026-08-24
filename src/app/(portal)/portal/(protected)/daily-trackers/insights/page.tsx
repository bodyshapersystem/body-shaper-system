import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import { getInsights } from "@/lib/body-response-timeline";
import InsightsView from "../InsightsView";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const { summary, timeline, insightMoments } = await getInsights(client.id);

  return (
    <div className="cat-body portal-page dtj-page-wrap">
      <InsightsView summary={summary} timeline={timeline} insightMoments={insightMoments} />
    </div>
  );
}
