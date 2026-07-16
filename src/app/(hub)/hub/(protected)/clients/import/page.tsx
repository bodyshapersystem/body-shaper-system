import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import ImportWizard from "./ImportWizard";

export const dynamic = "force-dynamic";

export default async function ImportClientsPage() {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "clients.convert")) redirect("/hub/clients");

  return (
    <div className="cat-body portal-page">
      <Link href="/hub/clients" className="cap-secondary-btn" style={{ display: "inline-block", marginBottom: 20, width: "auto" }}>
        ← Back to Clients
      </Link>
      <div className="portal-page-head">
        <p className="portal-eyebrow">clients</p>
        <h1>import clients.</h1>
        <p className="portal-page-sub">Bring in your existing client database from a spreadsheet or export.</p>
      </div>
      <ImportWizard />
    </div>
  );
}
