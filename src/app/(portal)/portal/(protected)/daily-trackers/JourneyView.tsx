"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProtocol, toggleProtocolReminder, stopTrackingProtocol, logPeptideDose, deletePeptideLog } from "./journey-actions";
import { computeNextInjection, daysUntilLabel } from "@/lib/peptide-schedule";
import { GOAL_CATEGORY_OPTIONS } from "@/lib/peptide-goal-copy";
import PeptideWelcomeScreen from "./PeptideWelcomeScreen";
import InjectionSiteDiagram from "./InjectionSiteDiagram";
import { PencilIcon } from "@/components/DTJIcons";

function suggestNextSite(lastSite: string | null): string {
  if (!lastSite) return "LEFT_ABDOMEN";
  if (lastSite.startsWith("LEFT_")) return lastSite.replace("LEFT_", "RIGHT_");
  if (lastSite.startsWith("RIGHT_")) return lastSite.replace("RIGHT_", "LEFT_");
  return "LEFT_ABDOMEN";
}

function siteDisplayLabel(site: string | null): string {
  if (!site) return "—";
  return site.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

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

function VialIcon({ peptideName }: { peptideName?: string }) {
  const label = (peptideName || "PEPTIDE").toUpperCase().slice(0, 10);
  return (
    <svg width="76" height="76" viewBox="0 0 120 120" className="dtj-vial-svg">
      <defs>
        <linearGradient id="vialGlass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8B5A3C" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#B87F4E" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#E8B888" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#8B5A3C" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="vialCap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E7B7AE" />
          <stop offset="100%" stopColor="#C79E93" />
        </linearGradient>
        <clipPath id="vialCircle"><circle cx="60" cy="60" r="58" /></clipPath>
      </defs>
      <circle cx="60" cy="60" r="58" fill="#FBF7F1" stroke="#EADFCF" strokeWidth="1.5" />
      <g clipPath="url(#vialCircle)">
        {/* crimped metal cap */}
        <path d="M40 14 L80 14 L77 34 L43 34 Z" fill="url(#vialCap)" />
        <line x1="43" y1="18" x2="77" y2="18" stroke="#fff" strokeOpacity="0.4" strokeWidth="1" />
        <line x1="42" y1="24" x2="78" y2="24" stroke="#fff" strokeOpacity="0.3" strokeWidth="1" />
        <line x1="42" y1="29" x2="78" y2="29" stroke="#fff" strokeOpacity="0.3" strokeWidth="1" />
        {/* rubber stopper */}
        <rect x="44" y="33" width="32" height="6" fill="#D9CFC2" />
        {/* glass vial body */}
        <path d="M38 39 L82 39 L82 96 Q82 104 74 104 L46 104 Q38 104 38 96 Z" fill="url(#vialGlass)" stroke="#7A5236" strokeWidth="1" />
        <path d="M38 39 L82 39 L82 96 Q82 104 74 104 L46 104 Q38 104 38 96 Z" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="6" />
        {/* label */}
        <rect x="41" y="58" width="38" height="34" rx="2" fill="#FBF8F3" stroke="#D8CBB8" strokeWidth="0.75" />
        <text x="60" y="72" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9.5" fill="#3A322C" fontWeight="600">{label}</text>
        <line x1="46" y1="77" x2="74" y2="77" stroke="#C79E93" strokeWidth="0.75" />
        <text x="60" y="87" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="6.5" fill="#8B7362" letterSpacing="0.5">PEPTIDE</text>
      </g>
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
  const [siteForLog, setSiteForLog] = useState<string | null>(null);

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
        injectionSite: siteForLog ?? p.injectionSite ?? undefined,
        ...checkin,
      });
      if (!result?.error) {
        setOpenLogId(null);
        setCheckin({});
        setSiteForLog(null);
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
        const peptideLogs = logs.filter((l) => l.peptideName === p.peptideName);
        const lastSite = peptideLogs.find((l) => l.injectionSite)?.injectionSite ?? null;
        const suggestedSite = suggestNextSite(lastSite);
        const activeSite = openLogId === p.id ? (siteForLog ?? suggestedSite) : null;

        return (
          <div key={p.id} className="dtj-protocol-block">
            <div className="dtj-vial-card">
              <VialIcon peptideName={p.peptideName} />
              <div className="dtj-vial-info">
                <p className="dtj-mini-label">selected peptide</p>
                <p className="dtj-vial-name">{p.peptideName}</p>
                <p className="dtj-mini-label" style={{ marginTop: 8 }}>dose</p>
                <p className="dtj-vial-name">{p.dose || "—"}</p>
                <span className="isd-protocol-tag">📅 {p.frequency} protocol</span>
              </div>
              <div className="dtj-vial-actions">
                <button type="button" className="dtj-icon-action-btn" onClick={() => openEditForm(p)}>
                  <PencilIcon />
                  <span>Edit</span>
                </button>
                <button type="button" className="dtj-icon-action-btn" onClick={() => handleStopTracking(p)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                  <span>Pause</span>
                </button>
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
              <div className="dtj-protocol-row">
                <span />
                <a href="/portal/daily-trackers/reminders" className="dtj-link-small">Manage reminders →</a>
              </div>
            </div>

            <div className="isd-section">
              <div className="isd-header-row">
                <p className="dtj-field-label" style={{ margin: 0 }}>Select where you injected today</p>
                <span className="isd-suggested-pill">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" strokeLinecap="round" /><path d="M17 4v4h-4M7 20v-4h4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Suggested next side: <strong>{siteDisplayLabel(suggestedSite)}</strong>
                </span>
              </div>
              <InjectionSiteDiagram
                selectedSite={activeSite}
                suggestedSite={openLogId === p.id ? suggestedSite : null}
                onSelect={(site) => setSiteForLog(site)}
              />
              <p className="isd-last-site">Last site: <strong>{siteDisplayLabel(lastSite)}</strong></p>
              <p className="pay-history-meta" style={{ marginTop: 6 }}>This is for site rotation tracking only.</p>
            </div>

            <div className="dtj-next-injection-card">
              <div className="dtj-clock-illustration">
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="27" fill="none" stroke="#C8A15A" strokeWidth="1" opacity="0.5" />
                  {Array.from({ length: 12 }, (_, i) => {
                    const angle = (i * 30 * Math.PI) / 180;
                    const x1 = 30 + 23 * Math.sin(angle), y1 = 30 - 23 * Math.cos(angle);
                    const x2 = 30 + 26 * Math.sin(angle), y2 = 30 - 26 * Math.cos(angle);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C8A15A" strokeWidth="1" opacity="0.6" />;
                  })}
                  <line x1="30" y1="30" x2="30" y2="14" stroke="#C79E93" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="30" y1="30" x2="41" y2="41" stroke="#C79E93" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="30" cy="30" r="2" fill="#C79E93" />
                </svg>
              </div>
              <p className="dtj-mini-label" style={{ color: "rgba(245,238,228,0.7)" }}>next injection</p>
              <p className="dtj-next-injection-date">{nDayLabel}, {nDateLabel} · {timeLabel}</p>
              <div className="dtj-next-injection-divider" />
              <p className="dtj-next-injection-countdown">{daysUntilLabel(next)}</p>
            </div>

            {p.refillOrderByDate && (
              <div className="dtj-refill-card">
                <span>⏳ refill countdown</span>
                <strong>order by {new Date(p.refillOrderByDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong>
              </div>
            )}

            {openLogId !== p.id ? (
              <button type="button" className="dtj-log-btn" onClick={() => { setOpenLogId(p.id); setCheckin({}); setSiteForLog(suggestedSite); }}>
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
