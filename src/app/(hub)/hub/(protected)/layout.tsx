import { redirect } from "next/navigation";
import { cookies } from "next/headers";
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

  // Second factor: password alone (already verified by getCurrentHubUser
  // resolving a real session) isn't enough once 2FA is enabled — this
  // cookie is only ever set by verifyTotpLogin, after a real 6-digit
  // code check, so its presence (matching this exact user) is what
  // actually gates every protected page.
  if (user.totpEnabled) {
    const cookieStore = await cookies();
    const totpCookie = cookieStore.get("hub_2fa_ok");
    if (totpCookie?.value !== user.id) {
      redirect("/hub/login/verify-2fa");
    }
  }

  const avatarUrl = user.avatarStoragePath ? await getUserAvatarUrl(user.avatarStoragePath) : null;

  return (
    <div className="portal-shell">
      <HubSidebar userName={user.fullName} roleName={user.role.name} avatarUrl={avatarUrl} />
      <main className="portal-main">{children}</main>
    </div>
  );
}
