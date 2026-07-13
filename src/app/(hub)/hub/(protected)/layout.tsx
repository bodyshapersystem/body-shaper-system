import { redirect } from "next/navigation";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import HubSidebar from "@/components/hub/HubSidebar";
import { getUserAvatarUrl } from "./settings/actions";

export default async function HubProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentHubUser();

  if (!user) {
    redirect("/hub/login");
  }

  if (!hasPermission(user, "hub.access")) {
    redirect("/hub/login");
  }

  const avatarUrl = user.avatarStoragePath ? await getUserAvatarUrl(user.avatarStoragePath) : null;

  return (
    <div className="portal-shell">
      <HubSidebar userName={user.fullName} roleName={user.role.name} avatarUrl={avatarUrl} />
      <main className="portal-main">{children}</main>
    </div>
  );
}
