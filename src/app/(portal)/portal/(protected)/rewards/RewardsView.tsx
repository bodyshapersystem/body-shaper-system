"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { requestRedemption, completeMission } from "./actions";

type CatalogItem = { id: string; name: string; description: string | null; category: string; creditCost: number; imageUrl: string | null };
type MissionItem = { id: string; name: string; description: string | null; creditReward: number; type: string; alreadyDone: boolean };
type Transaction = { id: string; points: number; action: string; createdAt: string };
type PartnerItem = { id: string; name: string; category: string | null; creditValue: number | null; notes: string | null };

const MISSION_ICONS: Record<string, string> = {
  weekly: "📅", zodiac: "♊", secret: "🎁", social: "📸", referral: "🤝", birthday: "🎂", seasonal: "🍂",
};
function missionIcon(name: string): string {
  const key = Object.keys(MISSION_ICONS).find((k) => name.toLowerCase().includes(k));
  return key ? MISSION_ICONS[key] : "✦";
}

const HERO_COPY: Record<string, { title: string; sub: string }> = {
  overview: { title: "Welcome to\nThe Body Shaper System Society™", sub: "Your loyalty. Your commitment. Your transformation.\nWe reward every step of your journey." },
  experiences: { title: "Treat yourself. You've earned it.", sub: "Explore our curated collection of treatments, experiences, and privileges designed to elevate your journey." },
  missions: { title: "Your journey. Your missions.", sub: "New missions drop every week.\nStay consistent, earn more, unlock more." },
  privileges: { title: "You're not just a client,\nyou're part of something exclusive.", sub: "As a valued member of The Body Shaper System Society™, you unlock a world of privileges designed to elevate your transformation journey." },
};

// Each tab's hero is the full designed Society image itself — not a
// background behind separately-rendered text. These already contain
// their own headline/copy/styling, so we display them as-is and skip
// rendering HERO_COPY/BenefitsRow/MembershipCard over them.
const HERO_IMAGE: Record<string, string> = {
  overview: "/images/rewards/overview-bg.jpg",
  experiences: "/images/rewards/experiences-bg.jpg",
  missions: "/images/rewards/missions-bg.jpg",
  privileges: "/images/rewards/privileges-bg.jpg",
};

export default function RewardsView({
  firstName,
  tier,
  pointsBalance,
  lifetimePoints,
  nextTier,
  creditsToNext,
  currentSystem,
  catalogItems,
  missions,
  transactions,
  categoryLabels,
  categoryIcons,
  partners,
  memberSince,
  activeTab,
  eligibleForSignature,
}: {
  firstName: string;
  tier: string;
  pointsBalance: number;
  lifetimePoints: number;
  nextTier: string | null;
  creditsToNext: number | null;
  currentSystem: string | null;
  catalogItems: CatalogItem[];
  missions: MissionItem[];
  transactions: Transaction[];
  categoryLabels: Record<string, string>;
  categoryIcons: Record<string, string>;
  partners: PartnerItem[];
  memberSince: string;
  activeTab: "overview" | "experiences" | "missions" | "privileges";
  eligibleForSignature: boolean;
}) {
  const router = useRouter();
  const tab = activeTab;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const categories = Array.from(new Set(catalogItems.map((i) => i.category)));

  function handleRedeem(itemId: string) {
    setMessage("");
    startTransition(async () => {
      const result = await requestRedemption(itemId);
      setMessage(result?.success ? "Redemption requested — your concierge will follow up shortly." : result?.error ?? "Something went wrong.");
      router.refresh();
    });
  }

  function handleMission(missionId: string) {
    setMessage("");
    startTransition(async () => {
      const result = await completeMission(missionId);
      if (result?.success) setMessage(result.pending ? "Submitted for review — points added once approved." : "Mission complete — points added!");
      else setMessage(result?.error ?? "Something went wrong.");
      router.refresh();
    });
  }

  const progressPercent = creditsToNext !== null ? Math.round((lifetimePoints / (lifetimePoints + creditsToNext)) * 100) : 100;
  const hero = HERO_COPY[tab];

  return (
    <div className="cat-body portal-page rw-page">
      {/* ---------- Top bar ---------- */}
      <div className="rw-topbar">
        <div>
          <p className="portal-eyebrow">rewards</p>
          <h1 style={{ margin: 0 }}>The Body Shaper System Society™</h1>
        </div>
        <div className="rw-points-pill">
          <span>⭐ {pointsBalance.toLocaleString()} <small>Society Points</small></span>
          <small>{tier} Member</small>
        </div>
      </div>

      {message && <p className="pay-history-meta" style={{ marginBottom: 16 }}>{message}</p>}

      {/* ---------- Hero banner ----------
           Each image below IS the complete designed hero for that tab
           (own headline, own copy, own card art already in the photo) —
           displayed as-is, not as a background behind separate text. */}
      <img
        src={HERO_IMAGE[tab]}
        alt={hero.title.replace(/\n/g, " ")}
        className="rw-hero-banner-img"
      />

      {/* ---------- OVERVIEW ---------- */}
      {tab === "overview" && (
        <>
          <div className="rw-stat-grid">
            <div className="rw-stat-card rw-card-metal">
              <span className="rw-card-star">★</span>
              <p className="rw-stat-label rw-label-on-dark">SOCIETY POINTS</p>
              <p className="rw-stat-value rw-value-on-dark">{pointsBalance.toLocaleString()}</p>
              <p className="rw-stat-foot rw-foot-on-dark">{tier} Member</p>
            </div>
            <div className="rw-stat-card rw-card-stone">
              <span className="rw-card-watermark">✦</span>
              <p className="rw-stat-label">MEMBERSHIP LEVEL</p>
              <p className="rw-stat-value" style={{ fontSize: 22 }}>{tier} Member</p>
              <p className="rw-stat-foot">You're valued. You're recognized.</p>
            </div>
            <div className="rw-stat-card rw-card-glass">
              <p className="rw-stat-label">PROGRESS TO NEXT REWARD {creditsToNext !== null && <span style={{ float: "right" }}>{creditsToNext} Society Points To Go</span>}</p>
              <div className="rw-progress-line">
                <div className="rw-progress-line-fill" style={{ width: `${progressPercent}%` }} />
                <span className="rw-progress-milestone" style={{ left: `${progressPercent}%` }}>🎁</span>
              </div>
              <p className="rw-stat-foot">{lifetimePoints.toLocaleString()} / {(lifetimePoints + (creditsToNext ?? 0)).toLocaleString()} Society Points · {progressPercent}%</p>
            </div>
            <div className="rw-stat-card rw-card-paper">
              <span className="rw-card-icon-badge">📅</span>
              <p className="rw-stat-label">MEMBER SINCE</p>
              <p className="rw-stat-value" style={{ fontSize: 20 }}>{memberSince}</p>
              <p className="rw-stat-foot">Thank you for being part of our Society.</p>
            </div>
          </div>

          <div className="rw-overview-row">
            <div className="rw-next-reward-card">
              <p className="rw-next-reward-eyebrow">NEXT REWARD TO UNLOCK</p>
              {(() => {
                const next = catalogItems.filter((i) => i.creditCost > pointsBalance).sort((a, b) => a.creditCost - b.creditCost)[0];
                return next ? (
                  <>
                    <p className="rw-next-reward-name">{next.name}</p>
                    <p className="rw-next-reward-pts">{next.creditCost.toLocaleString()} Society Points</p>
                    <Link href="/portal/rewards/experiences" className="rw-dark-btn" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>View Reward</Link>
                  </>
                ) : (
                  <p className="pay-history-meta">You've unlocked everything in our current catalog!</p>
                );
              })()}
            </div>
            <div className="rw-ways-card">
              <p className="rw-stat-label" style={{ marginBottom: 10 }}>WAYS TO EARN POINTS</p>
              <div className="rw-ways-grid">
                {missions.slice(0, 6).map((m) => (
                  <div key={m.id} className="rw-ways-row">
                    <span>{missionIcon(m.name)} {m.name}</span>
                    <strong>+{m.creditReward} Society Points</strong>
                  </div>
                ))}
              </div>
              <Link href="/portal/rewards/missions" className="trk-link-btn">View All Missions →</Link>
            </div>
          </div>

          <div className="rw-activity-card">
            <p className="rw-stat-label" style={{ marginBottom: 14 }}>RECENT ACTIVITY</p>
            <div className="rw-activity-row">
              {transactions.slice(0, 4).map((t) => (
                <div key={t.id} className="rw-activity-item">
                  <span className="rw-activity-icon">{t.points > 0 ? "⭐" : "🎁"}</span>
                  <div>
                    <p className="doc-card-title" style={{ marginBottom: 2 }}>{t.action}</p>
                    <p className="pay-history-meta">{t.points > 0 ? "+" : ""}{t.points} Society Points · {new Date(t.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && <div className="module-empty">No activity yet.</div>}
            </div>
          </div>
        </>
      )}

      {/* ---------- UNLOCK EXPERIENCES ---------- */}
      {tab === "experiences" && (
        <>
          <div className="rw-pill-row">
            <button type="button" className={`rw-pill ${!selectedCategory ? "rw-pill-active" : ""}`} onClick={() => setSelectedCategory(null)}>⭐ All Experiences</button>
            {categories.map((cat) => (
              <button key={cat} type="button" className={`rw-pill ${selectedCategory === cat ? "rw-pill-active" : ""}`} onClick={() => setSelectedCategory(cat)}>
                {categoryIcons[cat] ?? "✦"} {categoryLabels[cat] ?? cat}
              </button>
            ))}
          </div>

          <div className="rw-grid">
            {catalogItems.filter((i) => !selectedCategory || i.category === selectedCategory).map((item) => {
              const locked = item.category === "VIP" ? !eligibleForSignature || pointsBalance < item.creditCost : pointsBalance < item.creditCost;
              return (
                <div key={item.id} className="rw-item-card">
                  <div className="rw-item-image" style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : undefined}>
                    {!locked && <span className="rw-item-badge">{item.creditCost.toLocaleString()} Society Points</span>}
                    {locked && (
                      <div className="rw-item-locked-overlay">
                        <span className="rw-lock-icon">🔒</span>
                        {item.category === "VIP" ? (
                          <span>Locked</span>
                        ) : (
                          <span>Unlock at<br />{item.creditCost.toLocaleString()} Society Points</span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="doc-card-title">{item.name}</p>
                  {item.description && <p className="pay-history-meta" style={{ marginBottom: 8 }}>{item.description}</p>}
                  {!locked && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontFamily: "var(--serif)", color: "#7A2E38" }}>{item.creditCost.toLocaleString()} Society Points</strong>
                      <button type="button" className="rw-dark-btn" style={{ width: "auto", padding: "8px 16px" }} onClick={() => handleRedeem(item.id)} disabled={isPending}>Redeem</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="rw-bottom-bar">
            <span>🎁 New rewards are added every month. Stay active, earn points, and unlock more exclusive experiences.</span>
          </div>
        </>
      )}

      {/* ---------- SECRET MISSIONS ---------- */}
      {tab === "missions" && (
        <>
          <div className="rw-pill-row">
            <button type="button" className="rw-pill rw-pill-active">⭐ All Missions</button>
          </div>

          <p className="dash-section-title">Active Missions</p>
          <div className="rw-grid">
            {missions.map((m) => (
              <div key={m.id} className="rw-item-card">
                <div className="rw-item-image rw-mission-image">
                  <span className="rw-item-badge">{missionIcon(m.name)} MISSION</span>
                </div>
                <p className="doc-card-title">{m.name}</p>
                {m.description && <p className="pay-history-meta" style={{ marginBottom: 8 }}>{m.description}</p>}
                <strong style={{ fontFamily: "var(--serif)", color: "#C9A876", display: "block", marginBottom: 10 }}>+{m.creditReward} Society Points</strong>
                {m.alreadyDone ? (
                  <p className="pay-history-meta">✓ Completed</p>
                ) : (
                  <button type="button" className="rw-dark-btn" onClick={() => handleMission(m.id)} disabled={isPending}>
                    {m.type === "MANUAL_APPROVAL" ? "Submit for Review" : "Start Mission"}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="rw-overview-row">
            <div className="rw-next-reward-card">
              <p className="doc-card-title">Secret Challenge Drop</p>
              <p className="pay-history-meta">Something special is coming... complete secret actions and earn big.</p>
            </div>
            <div className="rw-ways-card">
              <p className="rw-stat-label" style={{ marginBottom: 10 }}>YOUR MISSION STATS</p>
              <div className="rw-stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                <div><p className="rw-stat-value" style={{ fontSize: 20 }}>{transactions.filter((t) => t.points > 0).length}</p><p className="pay-history-meta">Missions Completed</p></div>
                <div><p className="rw-stat-value" style={{ fontSize: 20 }}>{lifetimePoints.toLocaleString()}</p><p className="pay-history-meta">Points Earned</p></div>
                <div><p className="rw-stat-value" style={{ fontSize: 20 }}>—</p><p className="pay-history-meta">Day Streak</p></div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ---------- PRIVILEGES ---------- */}
      {tab === "privileges" && (
        <>
          <div className="rw-pill-row">
            <button type="button" className="rw-pill rw-pill-active">⭐ All Privileges</button>
          </div>
          <p className="dash-section-title">Your Exclusive Privileges</p>
          <div className="rw-grid">
            {partners.map((p) => {
              const locked = p.creditValue !== null && lifetimePoints < p.creditValue;
              return (
                <div key={p.id} className="rw-item-card">
                  <div className="rw-item-image">
                    <span className={`rw-status-badge ${locked ? "rw-status-locked" : "rw-status-unlocked"}`}>{locked ? "LOCKED" : "UNLOCKED"}</span>
                    {locked && <div className="rw-item-locked-overlay"><span className="rw-lock-icon">🔒</span></div>}
                  </div>
                  <p className="doc-card-title">{p.name}</p>
                  <p className="pay-history-meta" style={{ marginBottom: 8 }}>{p.notes ?? p.category ?? "Member Benefit"}</p>
                  <p className="pay-history-meta">{locked ? `UNLOCK AT ${p.creditValue?.toLocaleString()} Society Points` : "EXCLUSIVE ACCESS"}</p>
                </div>
              );
            })}
            {partners.length === 0 && <div className="module-empty">Member privileges are being finalized — check back soon.</div>}
          </div>

          <div className="rw-bottom-bar">
            <span>👑 The more you invest in yourself, the more you unlock. Reach higher levels and enjoy elevated privileges.</span>
          </div>
        </>
      )}

      {/* Mobile-only quick nav, matching the master reference's persistent bottom bar — supplements the sidebar, doesn't replace it. */}
      <nav className="rw-bottom-nav">
        <Link href="/portal/rewards/overview" className={tab === "overview" ? "rw-bottom-nav-active" : ""}>
          <span>✦</span>Overview
        </Link>
        <Link href="/portal/rewards/experiences" className={tab === "experiences" ? "rw-bottom-nav-active" : ""}>
          <span>🔒</span>Unlock Experiences
        </Link>
        <Link href="/portal/rewards/missions" className={tab === "missions" ? "rw-bottom-nav-active" : ""}>
          <span>🎯</span>Secret Missions
        </Link>
        <Link href="/portal/rewards/privileges" className={tab === "privileges" ? "rw-bottom-nav-active" : ""}>
          <span>👑</span>Privileges
        </Link>
      </nav>
    </div>
  );
}
