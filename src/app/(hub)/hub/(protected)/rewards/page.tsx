import { redirect } from "next/navigation";

/**
 * /hub/rewards — parent route, navigation-only.
 *
 * This route never renders Rewards content itself — it only redirects
 * to the default child page. Each of the four real pages
 * (overview / experiences / missions / privileges) is its own
 * independent route with its own component; see the sibling folders.
 */
export default function HubRewardsIndexPage() {
  redirect("/hub/rewards/overview");
}
