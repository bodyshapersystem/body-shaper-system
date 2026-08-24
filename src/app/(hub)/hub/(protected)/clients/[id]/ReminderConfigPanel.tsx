"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveReminderGoals } from "./reminder-config-actions";

const DAY_CHIPS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function ReminderConfigPanel({
  clientId,
  canManage,
  hydrationGoalGlasses,
  proteinGoalGrams,
  movementGoalSteps,
  compressionDays,
  compressionHoursRequired,
  compressionProtocolStartDate,
  compressionProtocolEndDate,
}: {
  clientId: string;
  canManage: boolean;
  hydrationGoalGlasses: number;
  proteinGoalGrams: number | null;
  movementGoalSteps: number;
  compressionDays: string[];
  compressionHoursRequired: number | null;
  compressionProtocolStartDate: string | null;
  compressionProtocolEndDate: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hydration, setHydration] = useState(hydrationGoalGlasses);
  const [protein, setProtein] = useState(proteinGoalGrams?.toString() ?? "");
  const [movement, setMovement] = useState(movementGoalSteps);
  const [days, setDays] = useState<string[]>(compressionDays);
  const [hours, setHours] = useState(compressionHoursRequired?.toString() ?? "");
  const [startDate, setStartDate] = useState(compressionProtocolStartDate?.slice(0, 10) ?? "");
  const [endDate, setEndDate] = useState(compressionProtocolEndDate?.slice(0, 10) ?? "");
  const [saved, setSaved] = useState(false);

  if (!canManage) return null;

  function toggleDay(d: string) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await saveReminderGoals(clientId, {
        hydrationGoalGlasses: hydration,
        proteinGoalGrams: protein ? Number(protein) : null,
        movementGoalSteps: movement,
        compressionDays: days,
        compressionHoursRequired: hours ? Number(hours) : null,
        compressionProtocolStartDate: startDate || null,
        compressionProtocolEndDate: endDate || null,
      });
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="bbp-card bbp-panel bp-tex-taupe" style={{ marginTop: 24 }}>
      <h3 className="dash-section-title">Reminder Center™ — Protocol Goals</h3>
      <p className="pay-history-meta" style={{ marginBottom: 16 }}>
        These goals drive the client&apos;s Daily Tracker cards and System Nudges — set once here, not the same for every client.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <label className="sched-label">
          Hydration goal (glasses/day)
          <input type="number" value={hydration} onChange={(e) => setHydration(Number(e.target.value) || 8)} className="sched-select" />
        </label>
        <label className="sched-label">
          Movement goal (steps/day)
          <input type="number" value={movement} onChange={(e) => setMovement(Number(e.target.value) || 8000)} className="sched-select" />
        </label>
        <label className="sched-label">
          Protein goal (g/day, optional)
          <input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="Not set" className="sched-select" />
        </label>
        <label className="sched-label">
          Compression hours required (per day)
          <input type="number" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Not set" className="sched-select" />
        </label>
      </div>

      <label className="sched-label" style={{ marginBottom: 8, display: "block" }}>Compression protocol days</label>
      <div className="dtj-pill-row" style={{ marginBottom: 16 }}>
        {DAY_CHIPS.map((d) => (
          <button key={d} type="button" className={`dtj-pill ${days.includes(d) ? "dtj-pill-active" : ""}`} onClick={() => toggleDay(d)}>
            {d}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <label className="sched-label">
          Compression start date
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="sched-select" />
        </label>
        <label className="sched-label">
          Compression end date
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="sched-select" />
        </label>
      </div>

      <button type="button" className="sched-cta" onClick={handleSave} disabled={isPending}>
        {isPending ? "Saving…" : "Save Goals"}
      </button>
      {saved && <span className="pay-history-meta" style={{ marginLeft: 12 }}>✓ Saved</span>}
    </div>
  );
}
