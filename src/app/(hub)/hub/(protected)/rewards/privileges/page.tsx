import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import MembersTab from "../MembersTab";

export const dynamic = "force-dynamic";

/**
 * /hub/rewards/privileges — RewardsPrivilegesPage
 *
 * Renders member tiers and eligibility (MembersTab) — the real,
 * existing data this app has for "who's eligible for what": each
 * member's tier, lifetime points, and suspension state. There is no
 * separate partner-benefits/priority-access/birthday-privilege model
 * in the schema yet, so this page does not fabricate that UI — it
 * surfaces the tier/eligibility data that actually exists. Does not
 * render the other Rewards pages here.
 */
export default async function RewardsPrivilegesPage() {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  const canManage = hasPermission(user, "rewards.manage");

  const accounts = await prisma.rewardsAccount.findMany({
    include: { client: true, transactions: { orderBy: { createdAt: "desc" }, take: 3 } },
    orderBy: { pointsBalance: "desc" },
  });

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">business</p>
        <h1>privileges.</h1>
        <p className="dash-subtitle">Member tiers, lifetime points, and eligibility — the basis for every privilege in the Society.</p>
      </div>

      <MembersTab accounts={accounts} canManage={canManage} />
    </div>
  );
}
