import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function ReminderCenterPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  return (
    <div className="cat-body portal-page dtj-page-wrap">
      <div className="dtj-today">
        <p className="dtj-page-title">reminder center™</p>
        <p className="dtj-page-sub">your routine, gently kept on track.</p>
        <div className="mpd-locked-card" style={{ marginTop: 20 }}>
          <p className="mpd-locked-text">Coming soon.</p>
          <p className="pay-history-meta">We're building a full space here to manage every reminder — hydration, protein, your protocol, and more — exactly the way you want them.</p>
        </div>
        <p className="dtj-footer-tag">small steps. one system.<br />bodyshapersystem.com</p>
      </div>
    </div>
  );
}
