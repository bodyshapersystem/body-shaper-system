import { redirect } from "next/navigation";

// Rewards / Society is archived (stand-by). The pages are kept in code;
// delete this layout to bring the section back.
export default function RewardsArchivedLayout() {
  redirect("/portal/dashboard");
}
