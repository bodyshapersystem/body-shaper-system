"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveMidpointReview, editMidpointReview, declineMidpointReview, requestExploreNextPhase } from "./midpoint-actions";
import { formatWeight } from "@/lib/units";

type MidpointReviewT = {
  id: string;
  hasSufficientData: boolean;
  baselineWeightKg: number | null;
  baselineBodyFatPercent: number | null;
  baselineMuscleMassKg: number | null;
  baselineSkeletalMuscleKg: number | null;
  baselineBodyWaterPercent: number | null;
  baselineWaistCm: number | null;
  midpointWeightKg: number | null;
  midpointBodyFatPercent: number | null;
  midpointMuscleMassKg: number | null;
  midpointSkeletalMuscleKg: number | null;
  midpointBodyWaterPercent: number | null;
  midpointWaistCm: number | null;
  insightText: string | null;
  nextPhaseCategory: string | null;
  nextPhaseCopy: string | null;
  suggestedAddOn: string | null;
  reviewStatus: string;
  clientRequestedExploreAt: string | null;
};

const CATEGORY_HEADLINES: Record<string, string> = {
  CONTINUE: "Your System is right on track. ✦",
  MUSCLE_SUPPORT: "Muscle Support Opportunity",
  FIRMNESS_SUPPORT: "Firmness Support Opportunity",
  TISSUE_SUPPORT: "Recovery + Tissue Support",
  SYSTEM_EVOLUTION: "Your body has moved beyond your starting point.",
};

function Row({ label, baseline, midpoint }: { label: string; baseline: string; midpoint: string }) {
  return (
    <div className="mpd-row">
      <span>{label}</span>
      <strong>{baseline} → {midpoint}</strong>
    </div>
  );
}

export default function MidpointDataView({
  review,
  totalSessions,
  completedSessions,
  systemName,
  mode,
  weightUnit = "lb",
}: {
  review: MidpointReviewT | null;
  totalSessions: number | null;
  completedSessions: number;
  systemName: string;
  mode: "owner" | "client";
  weightUnit?: "lb" | "kg";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [editedCopy, setEditedCopy] = useState(review?.nextPhaseCopy ?? "");

  if (!review) {
    if (!totalSessions) return null;
    const remaining = Math.max(0, Math.ceil(totalSessions * 0.5) - completedSessions);
    if (remaining <= 0) return null;
    return (
      <div className="mpd-locked-card">
        <p className="mpd-eyebrow">MIDPOINT DATA™</p>
        <p className="mpd-locked-text">{remaining} session{remaining === 1 ? "" : "s"} until your Midpoint Review.</p>
        <p className="pay-history-meta">Your body is building the data.</p>
      </div>
    );
  }

  if (!review.hasSufficientData) {
    return (
      <div className="mpd-locked-card">
        <p className="mpd-eyebrow">MIDPOINT DATA™</p>
        <p className="mpd-locked-text">Your Midpoint Review is ready.</p>
        <p className="pay-history-meta" style={{ marginBottom: 12 }}>Complete your updated Body Blueprint to unlock your Midpoint Data™.</p>
        {mode === "client" && (
          <a href="#composition" className="dtj-log-btn" style={{ display: "inline-block", textDecoration: "none", textAlign: "center" }}>
            UPDATE MY BLUEPRINT →
          </a>
        )}
      </div>
    );
  }

  const showNextPhase = review.nextPhaseCategory === "CONTINUE" || review.reviewStatus === "APPROVED";

  function handleApprove() {
    startTransition(async () => {
      await approveMidpointReview(review!.id);
      router.refresh();
    });
  }
  function handleSaveEdit() {
    startTransition(async () => {
      await editMidpointReview(review!.id, editedCopy);
      setEditing(false);
      router.refresh();
    });
  }
  function handleDecline() {
    if (!confirm("Decline this suggestion? It will not be shown to the client.")) return;
    startTransition(async () => {
      await declineMidpointReview(review!.id);
      router.refresh();
    });
  }
  function handleExplore() {
    startTransition(async () => {
      await requestExploreNextPhase(review!.id);
      router.refresh();
    });
  }

  return (
    <div className="mpd-wrap">
      <p className="mpd-eyebrow">HALFWAY THROUGH YOUR SYSTEM</p>
      <h3 className="mpd-heading">MIDPOINT DATA™</h3>
      <p className="mpd-intro">Your body has been responding. Now we have enough data to understand how.</p>

      <p className="mpd-section-label">YOUR STARTING POINT → WHERE YOU ARE NOW</p>
      <div className="mpd-comparison-card">
        {review.baselineWeightKg != null && (
          <Row label="Weight" baseline={formatWeight(review.baselineWeightKg, weightUnit)} midpoint={formatWeight(review.midpointWeightKg, weightUnit)} />
        )}
        {review.baselineBodyFatPercent != null && (
          <Row label="Body Fat" baseline={`${review.baselineBodyFatPercent.toFixed(1)}%`} midpoint={`${review.midpointBodyFatPercent?.toFixed(1) ?? "—"}%`} />
        )}
        {review.baselineMuscleMassKg != null && (
          <Row label="Muscle Mass" baseline={formatWeight(review.baselineMuscleMassKg, weightUnit)} midpoint={formatWeight(review.midpointMuscleMassKg, weightUnit)} />
        )}
        {review.baselineSkeletalMuscleKg != null && (
          <Row label="Skeletal Muscle" baseline={formatWeight(review.baselineSkeletalMuscleKg, weightUnit)} midpoint={formatWeight(review.midpointSkeletalMuscleKg, weightUnit)} />
        )}
        {review.baselineBodyWaterPercent != null && (
          <Row label="Body Water" baseline={`${review.baselineBodyWaterPercent.toFixed(1)}%`} midpoint={`${review.midpointBodyWaterPercent?.toFixed(1) ?? "—"}%`} />
        )}
        {review.baselineWaistCm != null && (
          <Row label="Waist" baseline={`${review.baselineWaistCm.toFixed(1)} cm`} midpoint={`${review.midpointWaistCm?.toFixed(1) ?? "—"} cm`} />
        )}
      </div>

      {review.insightText && (
        <div className="mpd-insight-card">
          <p className="mpd-section-label">YOUR MIDPOINT INSIGHT</p>
          <p className="mpd-insight-text">{review.insightText}</p>
        </div>
      )}

      {(showNextPhase || mode === "owner") && (
        <div className="mpd-next-phase-card" style={mode === "client" && review.clientRequestedExploreAt ? { textAlign: "center" } : undefined}>
          <p className="mpd-section-label">YOUR NEXT PHASE</p>
          {mode === "owner" && review.reviewStatus === "PENDING_REVIEW" && (
            <p className="mpd-review-badge">AI SUGGESTION — REVIEW REQUIRED</p>
          )}

          {mode === "client" && review.clientRequestedExploreAt && review.nextPhaseCategory !== "CONTINUE" ? (
            <>
              <p className="mpd-check-icon">✦</p>
              <p className="mpd-confirmed-headline">You're on the list.</p>
              <p className="mpd-confirmed-body" style={{ textAlign: "left" }}>
                We've let your specialist know you'd like to explore this for the second half of your System.
                <br />
                <br />
                Emmy will reach out personally to walk through the options and next steps — nothing has been booked or charged yet.
              </p>
            </>
          ) : (
            <>
              <p className="mpd-next-phase-headline">{CATEGORY_HEADLINES[review.nextPhaseCategory ?? "CONTINUE"]}</p>

              {editing ? (
                <>
                  <textarea value={editedCopy} onChange={(e) => setEditedCopy(e.target.value)} className="dtj-editor-textarea" rows={4} />
                  <button type="button" className="dtj-editor-save" onClick={handleSaveEdit} disabled={isPending}>
                    {isPending ? "Saving…" : "Save & Approve"}
                  </button>
                </>
              ) : (
                <p className="mpd-next-phase-body">{review.nextPhaseCopy}</p>
              )}

              {review.suggestedAddOn && (mode === "owner" || showNextPhase) && (
                <p className="mpd-suggested-addon">Possible: {review.suggestedAddOn}</p>
              )}

              {mode === "owner" && review.reviewStatus === "PENDING_REVIEW" && !editing && (
                <div className="mpd-review-actions">
                  <button type="button" className="dtj-editor-save" onClick={handleApprove} disabled={isPending}>Approve</button>
                  <button type="button" className="dtj-link-small" onClick={() => setEditing(true)}>Edit</button>
                  <button type="button" className="dtj-link-small" onClick={handleDecline}>Decline</button>
                </div>
              )}

              {mode === "owner" && review.reviewStatus === "APPROVED" && (
                <p className="pay-history-meta">✓ Approved — visible to client.</p>
              )}
              {mode === "owner" && review.reviewStatus === "DECLINED" && (
                <p className="pay-history-meta">Declined — not shown to client.</p>
              )}

              {review.nextPhaseCategory === "CONTINUE" && mode === "client" && (
                <button type="button" className="dtj-log-btn" style={{ marginTop: 10 }}>CONTINUE CURRENT SYSTEM →</button>
              )}

              {mode === "client" && showNextPhase && review.nextPhaseCategory !== "CONTINUE" && (
                <button type="button" className="mpd-explore-btn" onClick={handleExplore} disabled={isPending}>
                  {isPending ? "…" : "EXPLORE MY NEXT PHASE →"}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
