import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import AppointmentsPageContent from "./AppointmentsPageContent";

export const dynamic = "force-dynamic";

export default async function PortalAppointmentsPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  return <AppointmentsPageContent />;
}
