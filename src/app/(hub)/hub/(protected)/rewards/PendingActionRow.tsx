"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { fulfillRedemption, cancelRedemption, approveMissionCompletion, rejectMissionCompletion } from "./catalog-actions";

export function RedemptionRow({ id, clientName, itemName, creditsCost }: { id: string; clientName: string; itemName: string; creditsCost: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handle(action: (id: string) => Promise<unknown>) {
    startTransition(async () => {
      await action(id);
      router.refresh();
    });
  }

  return (
    <div className="cap-card" style={{ borderLeftColor: "#C9A876", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
      <div>
        <div className="cap-card-title">{clientName}</div>
        <div className="cap-card-meta">{itemName} — {creditsCost} PTS</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" className="dash-view-btn" disabled={isPending} onClick={() => handle(fulfillRedemption)}>Fulfill</button>
        <button type="button" className="dash-view-btn" style={{ color: "#a33" }} disabled={isPending} onClick={() => handle(cancelRedemption)}>Cancel</button>
      </div>
    </div>
  );
}

export function MissionReviewRow({ id, clientName, missionName, creditReward }: { id: string; clientName: string; missionName: string; creditReward: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handle(action: (id: string) => Promise<unknown>) {
    startTransition(async () => {
      await action(id);
      router.refresh();
    });
  }

  return (
    <div className="cap-card" style={{ borderLeftColor: "#6D7A64", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
      <div>
        <div className="cap-card-title">{clientName}</div>
        <div className="cap-card-meta">{missionName} — {creditReward} PTS</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" className="dash-view-btn" disabled={isPending} onClick={() => handle(approveMissionCompletion)}>Approve</button>
        <button type="button" className="dash-view-btn" style={{ color: "#a33" }} disabled={isPending} onClick={() => handle(rejectMissionCompletion)}>Reject</button>
      </div>
    </div>
  );
}
