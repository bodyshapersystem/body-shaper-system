import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import ClientSidebar from "@/components/portal/ClientSidebar";
import { logoutPortalClient } from "../login/actions";

export default async function PortalProtectedLayout({ children }: { children: React.ReactNode }) {
  const client = await getCurrentPortalClient();

  if (!client) {
    redirect("/portal/login");
  }

  return (
    <div className="portal-shell">
      <ClientSidebar
        name={`${client.firstName} ${client.lastName}`}
        tier={client.rewardsAccount?.tier ?? "Standard"}
        logoutAction={logoutPortalClient}
      />
      <main className="portal-main">{children}</main>
    </div>
  );
}
