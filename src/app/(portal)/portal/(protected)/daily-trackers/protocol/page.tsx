import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import { getWeekSync } from "@/lib/protocol-sync";
import ProtocolSyncView from "../ProtocolSyncView";

export const dynamic = "force-dynamic";

export default async function ProtocolSyncPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const { tasks, consistencyScore, weekDays } = await getWeekSync(client.id);

  return (
    <div className="cat-body portal-page dtj-page-wrap">
      <ProtocolSyncView tasks={tasks} consistencyScore={consistencyScore} weekDays={weekDays} />
    </div>
  );
}
