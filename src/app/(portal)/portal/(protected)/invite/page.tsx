import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import { getLevels, getSocietyDashboard, participantForClient } from "@/lib/society";
import SocietyDashboard from "@/components/society/SocietyDashboard";
import JoinSociety from "./JoinSociety";
import InviteLinkCopy from "./InviteLinkCopy";

export const dynamic = "force-dynamic";

/**
 * Invite & Earn — one clear choice:
 *  · Points toward sessions (250 per friend who pays), or
 *  · Shaper Society: money (5–12% by level).
 * Members see the Society area as 4 steps.
 */
export default async function InviteEarnPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const participant = await participantForClient(client.id);
  const dashboard = participant && participant.status === "ACTIVE" ? await getSocietyDashboard(participant.id) : null;
  const levels = await getLevels();
  const minPct = Math.min(...levels.map((l) => l.percent));
  const maxPct = Math.max(...levels.map((l) => l.percent));
  const points = client.rewardsAccount?.pointsBalance ?? 0;
  const pointsLink = `https://www.bodyshapersystem.com/refer/${client.id}`;

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">invite &amp; earn</p>
        <h1>share the system.</h1>
        <p className="portal-page-sub">When a friend becomes a client because of you, you&apos;re rewarded.</p>
      </div>

      {/* how it works */}
      <ol className="ss-how">
        <li><span>1</span><strong>Share your link</strong><em>with a friend, in your stories or bio</em></li>
        <li><span>2</span><strong>She books her system</strong><em>Body Blueprint™ → her plan → payment</em></li>
        <li><span>3</span><strong>You&apos;re rewarded</strong><em>in points or in money — you choose</em></li>
      </ol>

      {dashboard ? (
        <>
          <div className="ss-chosen">
            <span className="ss-chosen-badge">✓</span>
            <div>
              <strong>You chose money — Shaper Society™</strong>
              <p>
                You earn {dashboard.level.percent}% of every friend&apos;s system.
                {points > 0 && <> Your {points} points are still yours — <Link href="/portal/messages">contact us</Link> to use them.</>}
              </p>
            </div>
          </div>
          {(() => {
            const { participant: _p, ...props } = dashboard;
            return <SocietyDashboard data={props} siteOrigin="https://www.bodyshapersystem.com" />;
          })()}
        </>
      ) : (
        <>
          <p className="ss-choose-title">choose your reward</p>
          <div className="ss-choice">
            <section className="ss-option">
              <p className="ss-option-eyebrow">option 1</p>
              <h3>Points toward sessions</h3>
              <p className="ss-option-big">250 <span>points per friend</span></p>
              <p className="ss-option-text">Use them toward your own sessions. Your balance: <strong>{points} points</strong>.</p>
              <p className="ss-label">your invite link</p>
              <InviteLinkCopy url={pointsLink} />
              <p className="ss-hint">To use your points, <Link href="/portal/messages">contact your specialist</Link>.</p>
            </section>

            <section className="ss-option ss-option-marble">
              <p className="ss-option-eyebrow">option 2 · shaper society™</p>
              <h3>Money for every friend</h3>
              <p className="ss-option-big">{minPct}–{maxPct}% <span>of her system</span></p>
              <p className="ss-option-text">Your percentage grows as more friends join. Paid by Zelle or PayPal.</p>
              {participant && participant.status !== "ACTIVE" ? <p className="ss-option-text">Your membership is paused — contact us.</p> : <JoinSociety />}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
