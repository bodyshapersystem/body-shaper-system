"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProtocol, toggleProtocolReminder, stopTrackingProtocol, logPeptideDose, deletePeptideLog } from "./journey-actions";
import { computeNextInjection, daysUntilLabel } from "@/lib/peptide-schedule";
import { GOAL_CATEGORY_OPTIONS } from "@/lib/peptide-goal-copy";
import PeptideWelcomeScreen from "./PeptideWelcomeScreen";

type ProtocolT = {
  id: string;
  peptideName: string;
  goalCategory: string | null;
  customGoal: string | null;
  dose: string | null;
  frequency: string;
  injectionDays: string[];
  injectionTime: string;
  injectionSite: string | null;
  provider: string | null;
  reminderEnabled: boolean;
  refillOrderByDate: string | null;
};

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

function VialIcon() {
  return (
    <svg width="44" height="58" viewBox="0 0 52 68" fill="none" className="dtj-vial-svg">
      <rect x="16" y="2" width="20" height="9" rx="2" fill="var(--rose)" />
      <rect x="16" y="2" width="20" height="3" rx="1.5" fill="var(--mocha)" opacity="0.4" />
      <rect x="18" y="11" width="16" height="5" fill="#D8CFC2" />
      <path d="M14 16h24v38a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6V16z" fill="rgba(255,255,255,0.5)" stroke="var(--mocha)" strokeWidth="1.4" />
      <line x1="18" y1="34" x2="34" y2="34" stroke="var(--mocha)" strokeWidth="1" opacity="0.5" />
      <line x1="18" y1="39" x2="30" y2="39" stroke="var(--mocha)" strokeWidth="1" opacity="0.5" />
      <line x1="18" y1="44" x2="32" y2="44" stroke="var(--mocha)" strokeWidth="1" opacity="0.35" />
      <path d="M15 40h22v13a5 5 0 0 1-5 5H20a5 5 0 0 1-5-5V40z" fill="var(--rose)" opacity="0.25" />
    </svg>
  );
}

const CHECKIN_ROWS: { key: keyof LogEntry; label: string }[] = [
  { key: "appetite", label: "Appetite" },
  { key: "energy", label: "Energy" },
  { key: "bloating", label: "Bloating" },
  { key: "digestion", label: "Digestion" },
  { key: "sleepRating", label: "Sleep" },
  { key: "mood", label: "Mood" },
  { key: "nausea", label: "Nausea / discomfort" },
];

const emptyForm = {
  peptideName: "",
  goalCategory: "",
  customGoal: "",
  dose: "",
  frequency: "Weekly",
  injectionDays: [] as string[],
  injectionTime: "08:00",
  injectionSite: "Abdomen",
};

export default function JourneyView({
  protocols,
  logs,
  currentSystemName,
  forceWelcome,
}: {
  protocols: ProtocolT[];
  logs: LogEntry[];
  currentSystemName: string | null;
  forceWelcome?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"list" | "form">(protocols.length === 0 ? "form" : "list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [welcomeProtocol, setWelcomeProtocol] = useState<ProtocolT | null>(
    forceWelcome && protocols.length > 0 ? protocols[protocols.length - 1] : null
  );
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [openLogId, setOpenLogId] = useState<string | null>(null);
  const [checkin, setCheckin] = useState<Record<string, number>>({});

  function toggleDay(day: string) {
    setForm((f) => ({ ...f, injectionDays: f.injectionDays.includes(day) ? f.injectionDays.filter((d) => d !== day) : [...f.injectionDays, day] }));
  }

  function openAddForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setMode("form");
  }

  function openEditForm(p: ProtocolT) {
    setForm({
      peptideName: p.peptideName,
      goalCategory: p.goalCategory ?? "",
      customGoal: p.customGoal ?? "",
      dose: p.dose ?? "",
      frequency: p.frequency,
      injectionDays: p.injectionDays,
      injectionTime: p.injectionTime,
      injectionSite: p.injectionSite ?? "Abdomen",
    });
    setEditingId(p.id);
    setError("");
    setMode("form");
  }

  function handleSaveProtocol() {
    setError("");
    startTransition(async () => {
      const result = await saveProtocol({
        protocolId: editingId ?? undefined,
        peptideName: form.peptideName,
        goalCategory: form.goalCategory || undefined,
        customGoal: form.customGoal || undefined,
        dose: form.dose,
        frequency: form.frequency,
        injectionDays: form.injectionDays,
        injectionTime: form.injectionTime,
        injectionSite: form.injectionSite,
        reminderEnabled: true,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setMode("list");
      if (result?.isNewPeptide) {
        setWelcomeProtocol({
          id: result.protocolId!,
          peptideName: form.peptideName,
          goalCategory: form.goalCategory || null,
          customGoal: form.customGoal || null,
          dose: form.dose || null,
          frequency: form.frequency,
          injectionDays: form.injectionDays,
          injectionTime: form.injectionTime,
          injectionSite: form.injectionSite || null,
          provider: null,
          reminderEnabled: true,
          refillOrderByDate: null,
        });
      } else {
        router.refresh();
      }
    });
  }

  function handleToggleReminder(p: ProtocolT) {
    startTransition(async () => {
      await toggleProtocolReminder(p.id, !p.reminderEnabled);
      router.refresh();
    });
  }

  function handleStopTracking(p: ProtocolT) {
    if (!confirm(`Stop tracking ${p.peptideName}? Your history stays on record.`)) return;
    startTransition(async () => {
      await stopTrackingProtocol(p.id);
      router.refresh();
    });
  }

  function handleLogDose(p: ProtocolT) {
    startTransition(async () => {
      const result = await logPeptideDose({
        peptideName: p.peptideName,
        administeredAt: new Date().toISOString(),
        dosage: p.dose ?? undefined,
        injectionSite: p.injectionSite ?? undefined,
        ...checkin,
      });
      if (!result?.error) {
        setOpenLogId(null);
        setCheckin({});
        router.refresh();
      }
    });
  }

  function handleDeleteLog(id: string) {
    if (!confirm("Remove this entry?")) return;
    startTransition(async () => {
      await deletePeptideLog(id);
      router.refresh();
    });
  }

  if (welcomeProtocol) {
    return (
      <PeptideWelcomeScreen
        peptideName={welcomeProtocol.peptideName}
        goalCategory={welcomeProtocol.goalCategory}
        customGoal={welcomeProtocol.customGoal}
        currentSystemName={currentSystemName}
        onReviewProtocol={() => { setWelcomeProtocol(null); router.refresh(); }}
      />
    );
  }

  if (mode === "form") {
    return (
      <div className="dtj-today">
        <p className="dtj-page-title">peptide journey™</p>
        <p className="dtj-page-sub">{editingId ? "Edit your protocol." : "Add a peptide to start tracking."}</p>

        <div className="dtj-editor" style={{ marginTop: 16 }}>
          <label className="dtj-field-label">Peptide / medication name</label>
          <input value={form.peptideName} onChange={(e) => setForm((f) => ({ ...f, peptideName: e.target.value }))} placeholder="e.g. Tirzepatide" className="dtj-editor-input" />

          <label className="dtj-field-label">What's your main goal for this peptide?</label>
          <select value={form.goalCategory} onChange={(e) => setForm((f) => ({ ...f, goalCategory: e.target.value }))} className="dtj-editor-input">
            <option value="">Select…</option>
            {GOAL_CATEGORY_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
          {form.goalCategory === "GENERAL_CUSTOM" && (
            <input
              value={form.customGoal}
              onChange={(e) => setForm((f) => ({ ...f, customGoal: e.target.value }))}
              placeholder="Describe your goal in your own words"
              className="dtj-editor-input"
            />
          )}

          <label className="dtj-field-label">Dose</label>
          <input value={form.dose} onChange={(e) => setForm((f) => ({ ...f, dose: e.target.value }))} placeholder="e.g. 5.0 mg" className="dtj-editor-input" />

          <label className="dtj-field-label">Frequency</label>
          <select value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))} className="dtj-editor-input">
            <option>Daily</option>
            <option>Weekly</option>
            <option>Bi-weekly</option>
            <option>Custom</option>
          </select>

          <label className="dtj-field-label">Injection day(s)</label>
          <div className="dtj-pill-row" style={{ marginBottom: 8 }}>
            {DAY_CHIPS.map((d) => (
              <button key={d} type="button" className={`dtj-pill ${form.injectionDays.includes(d) ? "dtj-pill-active" : ""}`} onClick={() => toggleDay(d)}>
                {d}
              </button>
            ))}
          </div>

          <label className="dtj-field-label">Time</label>
          <input type="time" value={form.injectionTime} onChange={(e) => setForm((f) => ({ ...f, injectionTime: e.target.value }))} className="dtj-editor-input" />

          <label className="dtj-field-label">Injection site</label>
          <select value={form.injectionSite} onChange={(e) => setForm((f) => ({ ...f, injectionSite: e.target.value }))} className="dtj-editor-input">
            <option>Abdomen</option>
            <option>Thigh</option>
            <option>Upper Arm</option>
            <option>Glute</option>
          </select>

          {error && <p className="sched-error">{error}</p>}
          <button type="button" className="dtj-editor-save" onClick={handleSaveProtocol} disabled={isPending} style={{ width: "100%", marginTop: 8 }}>
            {isPending ? "Saving…" : editingId ? "Save Changes" : "Add Peptide"}
          </button>
          {protocols.length > 0 && (
            <button type="button" className="dtj-link-small" style={{ marginTop: 10, display: "block", textAlign: "center" }} onClick={() => setMode("list")}>
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dtj-today">
      <div className="dtj-journey-header">
        <p className="dtj-page-title">peptide journey™</p>
        <button type="button" className="dtj-link-small" onClick={openAddForm}>+ Add Peptide</button>
      </div>

      {protocols.map((p) => {
        const next = computeNextInjection(p.frequency, p.injectionDays, p.injectionTime);
        const timeLabel = next.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        const nDayLabel = next.toLocaleDateString("en-US", { weekday: "long" });
        const nDateLabel = next.toLocaleDateString("en-US", { month: "short", day: "numeric" });

        return (
          <div key={p.id} className="dtj-protocol-block">
            <div className="dtj-vial-card">
              <VialIcon />
              <div className="dtj-vial-info">
                <p className="dtj-mini-label">selected peptide</p>
                <p className="dtj-vial-name">{p.peptideName}</p>
                <p className="dtj-mini-label" style={{ marginTop: 8 }}>dose</p>
                <p className="dtj-vial-name">{p.dose || "—"}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button type="button" className="dtj-link-small" onClick={() => openEditForm(p)}>Edit</button>
                <button type="button" className="dtj-link-small" onClick={() => handleStopTracking(p)}>Stop</button>
              </div>
            </div>

            <div className="dtj-protocol-rows">
              <div className="dtj-protocol-row"><span>Injection day</span><strong>{p.injectionDays.join(", ") || "—"}</strong></div>
              <div className="dtj-protocol-row"><span>Time</span><strong>{timeLabel}</strong></div>
              <div className="dtj-protocol-row"><span>Frequency</span><strong>{p.frequency}</strong></div>
              <div className="dtj-protocol-row"><span>Injection site</span><strong>{p.injectionSite || "—"}</strong></div>
              <div className="dtj-protocol-row">
                <span>Reminder</span>
                <button type="button" className={`dtj-toggle ${p.reminderEnabled ? "dtj-toggle-on" : ""}`} onClick={() => handleToggleReminder(p)}>
                  <span className="dtj-toggle-dot" />
                </button>
              </div>
            </div>

            <div className="dtj-next-injection-card">
              <p className="dtj-mini-label" style={{ color: "rgba(245,238,228,0.7)" }}>next injection</p>
              <p className="dtj-next-injection-date">{nDayLabel}, {nDateLabel} · {timeLabel}</p>
              <p className="dtj-next-injection-countdown">{daysUntilLabel(next)}</p>
            </div>

            {p.refillOrderByDate && (
              <div className="dtj-refill-card">
                <span>⏳ refill countdown</span>
                <strong>order by {new Date(p.refillOrderByDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong>
              </div>
            )}

            {openLogId !== p.id ? (
              <button type="button" className="dtj-log-btn" onClick={() => { setOpenLogId(p.id); setCheckin({}); }}>
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
                <button type="button" className="dtj-editor-save" style={{ width: "100%", marginTop: 10 }} onClick={() => handleLogDose(p)} disabled={isPending}>
                  {isPending ? "Saving…" : "Log Injection"}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {logs.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <p className="dtj-field-label">injection history</p>
          {logs.slice(0, 12).map((log) => (
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
              <button type="button" className="trk-peptide-delete" onClick={() => handleDeleteLog(log.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      <p className="dtj-footer-tag">bodyshapersystem.com</p>
    </div>
  );
}
