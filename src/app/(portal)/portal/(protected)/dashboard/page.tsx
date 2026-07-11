import { getCurrentPortalClient } from "@/lib/permissions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PortalDashboardPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const blueprint = client.blueprintAssessments[0];
  const measurement = client.measurements[0];

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Welcome back, {client.firstName}</p>
        <h1>your journey hub.</h1>
      </div>

      <div className="pd-stats">
        <div className="pd-stat">
          <span className="pd-stat-label">Membership Tier</span>
          <strong>{client.rewardsAccount?.tier ?? "Standard"}</strong>
          <span className="pd-stat-sub">Body Rewards™</span>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Rewards Points</span>
          <strong>{client.rewardsAccount?.pointsBalance ?? 0}</strong>
          <span className="pd-stat-sub">Balance</span>
        </div>
        {measurement && (
          <>
            <div className="pd-stat">
              <span className="pd-stat-label">Latest Weight</span>
              <strong>{measurement.weightKg ?? "—"} kg</strong>
              <span className="pd-stat-sub">{measurement.scanDate.toLocaleDateString()}</span>
            </div>
            <div className="pd-stat">
              <span className="pd-stat-label">Body Fat %</span>
              <strong>{measurement.bodyFatPercent ?? "—"}%</strong>
              <span className="pd-stat-sub">{measurement.deviceSource}</span>
            </div>
          </>
        )}
      </div>

      <div className="pd-cols">
        <div className="pd-card">
          <h3>My Body Blueprint™ Summary</h3>
          {blueprint ? (
            <ul className="pd-summary-list">
              <li>
                <span>Current Goal</span>
                <strong>{blueprint.goals ?? "—"}</strong>
              </li>
              <li>
                <span>Treatment Interests</span>
                <strong>{blueprint.treatmentInterests ?? "—"}</strong>
              </li>
              <li>
                <span>Recommended System</span>
                <strong>{blueprint.recommendedSystem ?? "—"}</strong>
              </li>
            </ul>
          ) : (
            <p style={{ opacity: 0.6, fontSize: 13.5 }}>Your Body Blueprint™ hasn&apos;t been recorded yet.</p>
          )}
          <a href="/portal/blueprint" className="pd-link">
            View Full Blueprint™ →
          </a>
        </div>
      </div>
    </div>
  );
}
