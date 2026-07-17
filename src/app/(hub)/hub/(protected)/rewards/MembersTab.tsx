"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addRewardsTransaction } from "./actions";
import { moveTier, toggleSuspendRewards } from "./catalog-actions";
import { TIERS } from "@/lib/rewards";

type Account = {
  id: string;
  clientId: string;
  pointsBalance: number;
  lifetimePoints: number;
  tier: string;
  suspended: boolean;
  client: { firstName: string; lastName: string };
  transactions: { id: string; points: number; action: string; createdAt: Date }[];
};

export default function MembersTab({ accounts, canManage }: { accounts: Account[]; canManage: boolean }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Account | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pointsInput, setPointsInput] = useState("");
  const [actionInput, setActionInput] = useState("");

  function handleAdjust(sign: 1 | -1) {
    if (!selected || !pointsInput || !actionInput) return;
    const formData = new FormData();
    formData.set("clientId", selected.clientId);
    formData.set("points", String(Math.abs(Number(pointsInput)) * sign));
    formData.set("action", actionInput);
    startTransition(async () => {
      await addRewardsTransaction(formData);
      setPointsInput("");
      setActionInput("");
      setSelected(null);
      router.refresh();
    });
  }

  function handleMoveTier(tier: string) {
    if (!selected) return;
    startTransition(async () => {
      await moveTier(selected.clientId, tier);
      setSelected(null);
      router.refresh();
    });
  }

  function handleSuspend() {
    if (!selected) return;
    startTransition(async () => {
      await toggleSuspendRewards(selected.clientId);
      setSelected(null);
      router.refresh();
    });
  }

  return (
    <>
      <div style={{ overflowX: "auto" }}>
        <table className="simple-table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th style={{ padding: "10px 8px" }}>Name</th>
              <th style={{ padding: "10px 8px" }}>Tier</th>
              <th style={{ padding: "10px 8px" }}>Credits</th>
              <th style={{ padding: "10px 8px" }}>Status</th>
              <th style={{ padding: "10px 8px" }}>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc) => (
              <tr key={acc.id} onClick={() => setSelected(acc)} style={{ cursor: "pointer" }}>
                <td style={{ padding: "10px 8px" }}>{acc.client.firstName} {acc.client.lastName}</td>
                <td style={{ padding: "10px 8px" }}>{acc.tier}</td>
                <td style={{ padding: "10px 8px" }}>{acc.pointsBalance.toLocaleString()}</td>
                <td style={{ padding: "10px 8px" }}>{acc.suspended ? "Suspended" : "Active"}</td>
                <td style={{ padding: "10px 8px" }}>{acc.transactions[0] ? acc.transactions[0].createdAt.toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="apd-overlay" onClick={() => setSelected(null)}>
          <div className="apd-panel" onClick={(e) => e.stopPropagation()}>
            <div className="apd-time-row">
              <span className="apd-time-range">{selected.client.firstName} {selected.client.lastName}</span>
              <button type="button" className="apd-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="apd-detail-list">
              <div className="apd-detail-row"><span>current credits</span><strong>{selected.pointsBalance.toLocaleString()}</strong></div>
              <div className="apd-detail-row"><span>lifetime credits</span><strong>{selected.lifetimePoints.toLocaleString()}</strong></div>
              <div className="apd-detail-row"><span>current tier</span><strong>{selected.tier}</strong></div>
              <div className="apd-detail-row"><span>status</span><strong>{selected.suspended ? "Suspended" : "Active"}</strong></div>
            </div>

            {canManage && (
              <div className="apd-actions">
                <input placeholder="Points" type="number" value={pointsInput} onChange={(e) => setPointsInput(e.target.value)} className="sched-select" style={{ marginBottom: 8 }} />
                <input placeholder="Reason (e.g. Referral bonus)" value={actionInput} onChange={(e) => setActionInput(e.target.value)} className="sched-select" style={{ marginBottom: 8 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="apd-btn-secondary" style={{ flex: 1 }} disabled={isPending} onClick={() => handleAdjust(1)}>Add Credits</button>
                  <button type="button" className="apd-btn-secondary" style={{ flex: 1 }} disabled={isPending} onClick={() => handleAdjust(-1)}>Remove Credits</button>
                </div>

                <p className="apd-detail-row" style={{ marginTop: 14, borderBottom: "none" }}><span>Move Tier</span></p>
                <select onChange={(e) => handleMoveTier(e.target.value)} value={selected.tier} disabled={isPending} className="sched-select" style={{ marginBottom: 8 }}>
                  {TIERS.map((t) => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>

                <button type="button" className="apd-btn-danger" disabled={isPending} onClick={handleSuspend}>
                  {selected.suspended ? "Resume Rewards Access" : "Suspend Rewards Access"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
