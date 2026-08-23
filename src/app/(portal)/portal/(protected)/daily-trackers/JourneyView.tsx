"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProtocol, toggleProtocolReminder, logPeptideDose, deletePeptideLog } from "./journey-actions";
import { computeNextInjection, daysUntilLabel } from "@/lib/peptide-schedule";

type Protocol = {
  id: string;
  peptideName: string;
  dose: string | null;
  frequency: string;
  injectionDays: string[];
  injectionTime: string;
  injectionSite: string | null;
  provider: string | null;
  reminderEnabled: boolean;
  refillOrderByDate: string | null;
} | null;

type LogEntry = {
  id: string;
  peptideName: string;
  administeredAt: string;
  dosage: string | null;
  injectionSite: string | null;
  notes: string | null;
  appetite: number | null;
  energy: number | null;
  bloating: number | null;
  digestion: number | null;
  sleepRating: number | null;
  mood: number | null;
  nausea: number | null;
};

const DAY_CHIPS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const CHECKIN_ROWS: { key: keyof LogEntry; label: string }[] = [
  { key: "appetite", label: "Appetite" },
  { key: "energy", label: "Energy" },
  { key: "bloating", label: "Bloating" },
  { key: "digestion", label: "Digestion" },
  { key: "sleepRating", label: "Sleep" },
  { key: "mood", label: "Mood" },
  { key: "nausea", label: "Nausea / discomfort" },
];

export default function JourneyView({ protocol, logs }: { protocol: Protocol; logs: LogEntry[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [settingUp, setSettingUp] = useState(!protocol);
  const [error, setError] = useState("");

  // Protocol form state
  const [peptideName, setPeptideName] = useState(protocol?.peptideName ?? "");
  const [dose, setDose] = useState(protocol?.dose ?? "");
  const [frequency, setFrequency] = useState(protocol?.frequency ?? "Weekly");
  const [injectionDays, setInjectionDays] = useState<string[]>(protocol?.injectionDays ?? []);
  const [injectionTime, setInjectionTime] = useState(protocol?.injectionTime ?? "08:00");
  const [injectionSite, setInjectionSite] = useState(protocol?.injectionSite ?? "Abdomen");

  // Check-in / log-dose form state
  const [loggingDose, setLoggingDose] = useState(false);
  const [checkin, setCheckin] = useState<Record<string, number>>({});

  function toggleDay(day: string) {
    setInjectionDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function handleSaveProtocol() {
    setError("");
    startTransition(async () => {
      const result = await saveProtocol({
        peptideName,
        dose,
        frequency,
        injectionDays,
        injectionTime,
        injectionSite,
        reminderEnabled: true,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSettingUp(false);
      router.refresh();
    });
  }

  function handleToggleReminder() {
    if (!protocol) return;
    startTransition(async () => {
      await toggleProtocolReminder(protocol.id, !protocol.reminderEnabled);
      router.refresh();
    });
  }

  function handleLogDose() {
    if (!protocol) return;
    startTransition(async () => {
      const result = await logPeptideDose({
        peptideName: protocol.peptideName,
        administeredAt: new Date().toISOString(),
        dosage: protocol.dose ?? undefined,
        injectionSite: protocol.injectionSite ?? undefined,
        ...checkin,
      });
      if (!result?.error) {
        setLoggingDose(false);
        setCheckin({});
        router.refresh();
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Remove this entry?")) return;
    startTransition(async () => {
      await deletePeptideLog(id);
      router.refresh();
    });
  }

  if (settingUp) {
    return (
      <div className="dtj-today">
        <p className="dtj-page-title">peptide journey™</p>
        <p className="dtj-page-sub">Set up your protocol to start tracking.</p>

        <div className="dtj-editor" style={{ marginTop: 16 }}>
          <label className="dtj-field-label">Peptide / medication name</label>
          <input value={peptideName} onChange={(e) => setPeptideName(e.target.value)} placeholder="e.g. Tirzepatide" className="dtj-editor-input" />

          <label className="dtj-field-label">Dose</label>
          <input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="e.g. 5.0 mg" className="dtj-editor-input" />

          <label className="dtj-field-label">Frequency</label>
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="dtj-editor-input">
            <option>Daily</option>
            <option>Weekly</option>
            <option>Bi-weekly</option>
            <option>Custom</option>
          </select>

          <label className="dtj-field-label">Injection day(s)</label>
          <div className="dtj-pill-row" style={{ marginBottom: 8 }}>
            {DAY_CHIPS.map((d) => (
              <button key={d} type="button" className={`dtj-pill ${injectionDays.includes(d) ? "dtj-pill-active" : ""}`} onClick={() => toggleDay(d)}>
                {d}
              </button>
            ))}
          </div>

          <label className="dtj-field-label">Time</label>
          <input type="time" value={injectionTime} onChange={(e) => setInjectionTime(e.target.value)} className="dtj-editor-input" />

          <label className="dtj-field-label">Injection site</label>
          <select value={injectionSite} onChange={(e) => setInjectionSite(e.target.value)} className="dtj-editor-input">
            <option>Abdomen</option>
            <option>Thigh</option>
            <option>Upper Arm</option>
            <option>Glute</option>
          </select>

          {error && <p className="sched-error">{error}</p>}
          <button type="button" className="dtj-editor-save" onClick={handleSaveProtocol} disabled={isPending} style={{ width: "100%", marginTop: 8 }}>
            {isPending ? "Saving…" : "Save Protocol"}
          </button>
        </div>
      </div>
    );
  }

  const next = computeNextInjection(protocol!.frequency, protocol!.injectionDays, protocol!.injectionTime);
  const timeLabel = next.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const dayLabel = next.toLocaleDateString("en-US", { weekday: "long" });
  const dateLabel = next.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="dtj-today">
      <div className="dtj-journey-header">
        <p className="dtj-page-title">peptide journey™</p>
        <button type="button" className="dtj-link-small" onClick={() => setSettingUp(true)}>Edit Protocol</button>
      </div>

      <div className="dtj-vial-card">
        <div className="dtj-vial-icon">💊</div>
        <div className="dtj-vial-info">
          <p className="dtj-mini-label">selected peptide</p>
          <p className="dtj-vial-name">{protocol!.peptideName}</p>
          <p className="dtj-mini-label" style={{ marginTop: 8 }}>dose</p>
          <p className="dtj-vial-name">{protocol!.dose || "—"}</p>
        </div>
      </div>

      <div className="dtj-protocol-rows">
        <div className="dtj-protocol-row"><span>Injection day</span><strong>{protocol!.injectionDays.join(", ") || "—"}</strong></div>
        <div className="dtj-protocol-row"><span>Time</span><strong>{timeLabel}</strong></div>
        <div className="dtj-protocol-row"><span>Frequency</span><strong>{protocol!.frequency}</strong></div>
        <div className="dtj-protocol-row"><span>Injection site</span><strong>{protocol!.injectionSite || "—"}</strong></div>
        <div className="dtj-protocol-row">
          <span>Reminder</span>
          <button type="button" className={`dtj-toggle ${protocol!.reminderEnabled ? "dtj-toggle-on" : ""}`} onClick={handleToggleReminder}>
            <span className="dtj-toggle-dot" />
          </button>
        </div>
      </div>

      <div className="dtj-next-injection-card">
        <p className="dtj-mini-label" style={{ color: "rgba(245,238,228,0.7)" }}>next injection</p>
        <p className="dtj-next-injection-date">{dayLabel}, {dateLabel} · {timeLabel}</p>
        <p className="dtj-next-injection-countdown">{daysUntilLabel(next)}</p>
      </div>

      {protocol!.refillOrderByDate && (
        <div className="dtj-refill-card">
          <span>⏳ refill countdown</span>
          <strong>order by {new Date(protocol!.refillOrderByDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong>
        </div>
      )}

      {!loggingDose ? (
        <button type="button" className="dtj-log-btn" onClick={() => setLoggingDose(true)}>
          Log Injection
        </button>
      ) : (
        <div className="dtj-editor">
          <p className="dtj-field-label" style={{ marginBottom: 10 }}>how are you feeling?</p>
          {CHECKIN_ROWS.map((row) => (
            <div key={row.key} className="dtj-dotrow">
              <span>{row.label}</span>
              <div className="dtj-dotrow-dots">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`dtj-rating-dot ${(checkin[row.key] ?? 0) >= v ? "dtj-rating-dot-filled" : ""}`}
                    onClick={() => setCheckin((c) => ({ ...c, [row.key]: v }))}
                  />
                ))}
              </div>
            </div>
          ))}
          <button type="button" className="dtj-editor-save" style={{ width: "100%", marginTop: 10 }} onClick={handleLogDose} disabled={isPending}>
            {isPending ? "Saving…" : "Log Injection"}
          </button>
        </div>
      )}

      {logs.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <p className="dtj-field-label">injection history</p>
          {logs.slice(0, 8).map((log) => (
            <div key={log.id} className="trk-peptide-entry">
              <div>
                <strong>{log.peptideName}</strong>
                {log.dosage && <span className="trk-peptide-dosage"> · {log.dosage}</span>}
                <p className="pay-history-meta">
                  {new Date(log.administeredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} ·{" "}
                  {new Date(log.administeredAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  {log.injectionSite ? ` · ${log.injectionSite}` : ""}
                </p>
              </div>
              <button type="button" className="trk-peptide-delete" onClick={() => handleDelete(log.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      <p className="dtj-footer-tag">bodyshapersystem.com</p>
    </div>
  );
}
