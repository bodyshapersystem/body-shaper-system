import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import { getLevels, getSocietyDashboard, participantForClient } from "@/lib/society";
import SocietyDashboard from "@/components/society/SocietyDashboard";
import JoinSociety from "./JoinSociety";

export const dynamic = "force-dynamic";

/**
 * Invite & Earn — two ways to refer:
 *  1. Points (250 per referral who pays), redeemable toward sessions.
 *  2. Shaper Society — money commissions with levels.
 */
export default async function InviteEarnPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const participant = await participantForClient(client.id);
  const dashboard = participant && participant.status === "ACTIVE" ? await getSocietyDashboard(participant.id) : null;
  const levels = await getLevels();
  const levelsText = levels
    .map((l, i) => {
      const nextMin = levels[i + 1]?.minSales;
      return `${l.percent}% (${nextMin ? `${l.minSales}–${nextMin - 1}` : `${l.minSales}+`})`;
    })
    .join(", ");
  const pointsLink = `https://www.bodyshapersystem.com/refer/${client.id}`;

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">invite &amp; earn</p>
        <h1>share the system.</h1>
        <p className="portal-page-sub">Refer a friend and choose how you&apos;re rewarded.</p>
      </div>

      <div className="soc-wrap">
        <div className="soc-card">
          <p className="soc-eyebrow">option 1 · points</p>
          <h3 className="soc-title">Earn toward your sessions</h3>
          <p className="soc-body">
            Earn 250 points every time a friend you invite pays for their system. Your balance: <strong>{client.rewardsAccount?.pointsBalance ?? 0} points</strong>.
          </p>
          <p className="soc-body">Your invite link:</p>
          <code className="soc-link">{pointsLink.replace(/^https?:\/\//, "")}</code>
          <p className="soc-note">
            Want to use your points for a session? <Link href="/portal/messages">Contact your specialist</Link>.
          </p>
        </div>

        {dashboard ? (
          <>
            <p className="soc-eyebrow" style={{ marginTop: 8 }}>option 2 · shaper society™ — you&apos;re a member</p>
            {(() => {
              const { participant: _p, ...props } = dashboard;
              return <SocietyDashboard data={props} siteOrigin="https://www.bodyshapersystem.com" />;
            })()}
          </>
        ) : participant && participant.status !== "ACTIVE" ? (
          <div className="soc-card"><p className="soc-body">Your Shaper Society membership is paused. Contact us for help.</p></div>
        ) : (
          <JoinSociety levelsText={levelsText} />
        )}
      </div>
    </div>
  );
}
