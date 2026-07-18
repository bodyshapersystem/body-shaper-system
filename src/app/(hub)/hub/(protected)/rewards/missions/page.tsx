import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import MissionsTab from "../MissionsTab";

export const dynamic = "force-dynamic";

/**
 * /hub/rewards/missions — RewardsMissionsPage
 *
 * Renders only: active/scheduled/completed missions, submissions, and
 * create/review/approval tools (all handled inside MissionsTab, which
 * already lists every mission with its active state and manage
 * controls). Does not render Experiences or Privileges content here.
 */
export default async function RewardsMissionsPage() {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  const canManage = hasPermission(user, "rewards.manage");

  const missions = await prisma.mission.findMany({ orderBy: { creditReward: "asc" } });

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">business</p>
        <h1>secret missions.</h1>
        <p className="dash-subtitle">Create, review, and manage the missions clients complete to earn points.</p>
      </div>

      <MissionsTab missions={missions} canManage={canManage} />
    </div>
  );
}
