import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getWeekSync } from "@/lib/protocol-sync";
import { getAllowedAddonsForSystem } from "@/lib/tech-support-config";
import ProtocolSyncView from "../ProtocolSyncView";

export const dynamic = "force-dynamic";

export default async function ProtocolSyncPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const [{ tasks, consistencyScore, weekDays }, assessment] = await Promise.all([
    getWeekSync(client.id),
    prisma.blueprintAssessment.findFirst({
      where: { clientId: client.id, status: { in: ["ACTIVE", "VALIDATED", "IN_PROGRESS", "COMPLETED"] } },
      orderBy: { version: "desc" },
      select: { recommendedSystem: true },
    }),
  ]);

  const systemName = assessment?.recommendedSystem ?? null;
  const allowedAddons = getAllowedAddonsForSystem(systemName);

  return (
    <div className="cat-body portal-page dtj-page-wrap">
      <ProtocolSyncView tasks={tasks} consistencyScore={consistencyScore} weekDays={weekDays} systemName={systemName} allowedAddons={allowedAddons} />
    </div>
  );
}
