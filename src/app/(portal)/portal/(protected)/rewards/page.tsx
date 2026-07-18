import { redirect } from "next/navigation";

/**
 * /portal/rewards — parent route, navigation-only. Redirects to the
 * default child page; the four real pages (overview / experiences /
 * missions / privileges) each render independently. See sibling
 * folders.
 */
export default function PortalRewardsIndexPage() {
  redirect("/portal/rewards/overview");
}
