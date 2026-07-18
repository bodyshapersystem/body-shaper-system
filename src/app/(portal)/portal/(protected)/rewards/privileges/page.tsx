import { getRewardsPageData } from "../getRewardsPageData";
import RewardsView from "../RewardsView";

export const dynamic = "force-dynamic";

export default async function PortalRewardsPrivilegesPage() {
  const data = await getRewardsPageData();
  if (!data) {
    return (
      <div className="cat-body portal-page">
        <div className="module-empty">Your Rewards account is being set up — check back soon.</div>
      </div>
    );
  }
  return <RewardsView {...data} activeTab="privileges" />;
}
