import { redirect } from "next/navigation";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import HubSidebar from "@/components/hub/HubSidebar";

export default async function HubProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentHubUser();

  if (!user) {
    redirect("/hub/login");
  }

  if (!hasPermission(user, "hub.access")) {
    redirect("/hub/login");
  }

  return (
    <div className="portal-shell">
      <HubSidebar userName={user.fullName} roleName={user.role.name} />
      <main className="portal-main">{children}</main>
    </div>
  );
}
