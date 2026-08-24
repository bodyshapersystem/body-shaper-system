import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function siteDisplayLabel(site: string | null): string {
  if (!site) return "—";
  return site.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function InjectionHistoryPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const logs = await prisma.peptideLog.findMany({ where: { clientId: client.id }, orderBy: { administeredAt: "desc" } });

  return (
    <div className="cat-body portal-page dtj-page-wrap">
      <div className="dtj-today">
        <div className="dtj-journey-header">
          <p className="dtj-page-title">injection history</p>
          <a href="/portal/daily-trackers/journey" className="dtj-link-small">← Back</a>
        </div>

        {logs.length === 0 && <p className="pay-history-meta">No injections logged yet.</p>}

        {logs.map((log) => (
          <div key={log.id} className="trk-peptide-entry">
            <div>
              <strong>{log.peptideName}</strong>
              {log.dosage && <span className="trk-peptide-dosage"> · {log.dosage}</span>}
              <p className="pay-history-meta">
                {log.administeredAt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} ·{" "}
                {log.administeredAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                {log.injectionSite ? ` · ${siteDisplayLabel(log.injectionSite)}` : ""}
              </p>
            </div>
          </div>
        ))}

        <p className="dtj-footer-tag">small steps. one system.<br />bodyshapersystem.com</p>
      </div>
    </div>
  );
}
