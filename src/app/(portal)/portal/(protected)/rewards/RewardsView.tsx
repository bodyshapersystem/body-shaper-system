"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestRedemption, completeMission } from "./actions";

type CatalogItem = { id: string; name: string; description: string | null; category: string; creditCost: number; imageUrl: string | null };
type MissionItem = { id: string; name: string; description: string | null; creditReward: number; type: string; alreadyDone: boolean };
type Transaction = { id: string; points: number; action: string; createdAt: string };

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
}) {
  const router = useRouter();
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
      if (result?.success) {
        setMessage(result.pending ? "Submitted for review — credits will be added once approved." : "Mission complete — credits added!");
      } else {
        setMessage(result?.error ?? "Something went wrong.");
      }
      router.refresh();
    });
  }

  const progressPercent = creditsToNext !== null ? Math.round((lifetimePoints / (lifetimePoints + creditsToNext)) * 100) : 100;

  return (
    <>
      {/* ---------- Hero ---------- */}
      <div className="rw-hero">
        <p className="rw-hero-eyebrow">welcome to</p>
        <h1 className="rw-hero-title">The Body Shaper System Society™</h1>
        <p className="rw-hero-sub">
          Your transformation now comes with exclusive experiences, privileges and rewards designed exclusively for our members.
        </p>
      </div>

      <div className="rw-summary-bar">
        <div>
          <p className="rw-summary-label">Current Tier</p>
          <p className="rw-summary-value">{tier}</p>
        </div>
        <div>
          <p className="rw-summary-label">Body Credits™</p>
          <p className="rw-summary-value">{pointsBalance.toLocaleString()}</p>
        </div>
        <div>
          <p className="rw-summary-label">Lifetime Credits</p>
          <p className="rw-summary-value">{lifetimePoints.toLocaleString()}</p>
        </div>
        <div>
          <p className="rw-summary-label">Next Unlock</p>
          <p className="rw-summary-value" style={{ fontSize: 15 }}>{nextTier ? `${creditsToNext} to ${nextTier}` : "Top Tier"}</p>
        </div>
      </div>

      {message && <p className="pay-history-meta" style={{ marginBottom: 16 }}>{message}</p>}

      <div className="doc-card-grid" style={{ marginBottom: 28 }}>
        <div className="trk-card">
          <h3 className="trk-card-title">Body Credits™</h3>
          <p style={{ fontFamily: "var(--serif)", fontSize: 28, color: "#6B4E3D", margin: "0 0 6px" }}>{pointsBalance.toLocaleString()}</p>
          <p className="pay-history-meta" style={{ marginBottom: 10 }}>Current balance</p>
          <a href="#activity" className="trk-link-btn">View History →</a>
        </div>
        <div className="trk-card">
          <h3 className="trk-card-title">Current Tier</h3>
          <p style={{ fontFamily: "var(--serif)", fontSize: 22, color: "#2B2622", margin: "0 0 6px" }}>{currentSystem ?? tier}</p>
          <p className="pay-history-meta">Benefits included with your {tier} membership</p>
        </div>
        <div className="trk-card">
          <h3 className="trk-card-title">Next Unlock</h3>
          {creditsToNext !== null ? (
            <>
              <div className="onb-progress-track" style={{ marginBottom: 8 }}>
                <div className="onb-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="pay-history-meta">{lifetimePoints} / {lifetimePoints + creditsToNext} Body Credits — unlocks {nextTier} in {creditsToNext} credits</p>
            </>
          ) : (
            <p className="pay-history-meta">You've reached our top membership tier.</p>
          )}
        </div>
      </div>

      {/* ---------- Unlock Experiences ---------- */}
      <h3 className="dash-section-title">Unlock Experiences™</h3>
      {!selectedCategory ? (
        <div className="rw-category-grid">
          {categories.map((cat) => (
            <button key={cat} type="button" className="rw-category-card" onClick={() => setSelectedCategory(cat)}>
              <span style={{ fontSize: 28 }}>{categoryIcons[cat] ?? "✦"}</span>
              <span>{categoryLabels[cat] ?? cat}</span>
            </button>
          ))}
        </div>
      ) : (
        <>
          <button type="button" className="cap-secondary-btn" style={{ display: "inline-block", width: "auto", marginBottom: 16 }} onClick={() => setSelectedCategory(null)}>
            ← Back to Categories
          </button>
          <div className="doc-card-grid" style={{ marginBottom: 28 }}>
            {catalogItems
              .filter((i) => i.category === selectedCategory)
              .map((item) => {
                const locked = pointsBalance < item.creditCost;
                return (
                  <div key={item.id} className="rw-reward-card">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10, marginBottom: 10 }} />
                    ) : (
                      <div style={{ width: "100%", height: 120, background: "rgba(107,78,61,0.06)", borderRadius: 10, marginBottom: 10 }} />
                    )}
                    <p className="doc-card-title">{item.name}</p>
                    {item.description && <p className="pay-history-meta" style={{ marginBottom: 8 }}>{item.description}</p>}
                    <p style={{ fontFamily: "var(--serif)", fontSize: 15, color: "#6B4E3D", marginBottom: 10 }}>{item.creditCost} Body Credits™</p>
                    {locked ? (
                      <p className="rw-locked">🔒 Unlock at {item.creditCost} Credits</p>
                    ) : (
                      <button type="button" className="cap-primary-btn" onClick={() => handleRedeem(item.id)} disabled={isPending}>
                        Redeem
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </>
      )}

      {/* ---------- Secret Missions ---------- */}
      <h3 className="dash-section-title">Secret Missions™</h3>
      <div className="doc-card-grid" style={{ marginBottom: 28 }}>
        {missions.map((m) => (
          <div key={m.id} className="rw-reward-card">
            <p className="doc-card-title">{m.name}</p>
            {m.description && <p className="pay-history-meta" style={{ marginBottom: 8 }}>{m.description}</p>}
            <p style={{ fontFamily: "var(--serif)", fontSize: 15, color: "#6B4E3D", marginBottom: 10 }}>Earn {m.creditReward} Credits</p>
            {m.alreadyDone ? (
              <p className="pay-history-meta">✓ Completed</p>
            ) : (
              <button type="button" className="cap-secondary-btn" onClick={() => handleMission(m.id)} disabled={isPending}>
                {m.type === "MANUAL_APPROVAL" ? "Submit for Review" : "Mark Complete"}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ---------- Activity ---------- */}
      <h3 className="dash-section-title" id="activity">Activity</h3>
      <div className="cap-list">
        {transactions.length === 0 && <div className="module-empty">No activity yet.</div>}
        {transactions.map((t) => (
          <div key={t.id} className="cap-card" style={{ borderLeftColor: t.points > 0 ? "#6B4E3D" : "#c9bdb0" }}>
            <div className="cap-card-time">{new Date(t.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
            <div className="cap-card-title">{t.points > 0 ? "+" : ""}{t.points}</div>
            <div className="cap-card-meta">{t.action}</div>
          </div>
        ))}
      </div>
    </>
  );
}
