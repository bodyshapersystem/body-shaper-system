"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TECHNOLOGIES, ABDOMEN_PRESET, LEGS_PRESETS, generateObjectives, type Technology } from "@/lib/session-objectives";
import { logSession } from "./session-log-actions";
import InteractiveBodyMap from "@/components/InteractiveBodyMap";

const ALL_ABDOMEN_AREAS = [...ABDOMEN_PRESET.front, ...ABDOMEN_PRESET.back];

export default function LogSessionSheet({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [technology, setTechnology] = useState<Technology>("Exilis");
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ matched: string[]; unmatched: string[] } | null>(null);

  const areas = Array.from(selectedAreas);
  const objectives = generateObjectives(technology, areas);

  function toggleArea(area: string) {
    setSelectedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(area)) next.delete(area);
      else next.add(area);
      return next;
    });
  }

  function applyPreset(preset: string[]) {
    setSelectedAreas(new Set(preset));
  }

  function handleSubmit() {
    setError("");
    const formData = new FormData();
    formData.set("technology", technology);
    areas.forEach((a) => formData.append("areas", a));
    objectives.forEach((o) => formData.append("objectives", o));
    formData.set("specialistNotes", notes);
    startTransition(async () => {
      const res = await logSession(clientId, formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setResult(res.alignment ?? null);
      router.refresh();
    });
  }

  function closeAndReset() {
    setOpen(false);
    setTechnology("Exilis");
    setSelectedAreas(new Set());
    setNotes("");
    setResult(null);
    setError("");
  }

  return (
    <>
      <button type="button" className="sched-secondary-btn" onClick={() => setOpen(true)}>
        + Log Session
      </button>

      {open && (
        <div className="bp-sheet-overlay" onClick={closeAndReset}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">Log Session</h3>

            {result ? (
              <>
                <p className="pjic-status-active" style={{ marginBottom: 4 }}>Session saved ✦</p>
                <p className="dtj-field-label">Blueprint Alignment™</p>
                {result.matched.length > 0 ? (
                  <div className="pp-callouts-row" style={{ marginBottom: 12 }}>
                    {result.matched.map((g) => (
                      <div key={g} className="pp-callout">
                        <p className="pp-callout-label"><span className="pp-callout-dot" />✓ {g}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="pay-history-meta">No current Blueprint goals matched this session's areas.</p>
                )}
                <button type="button" className="sched-cta" onClick={closeAndReset}>Done</button>
              </>
            ) : (
              <>
                <p className="dtj-field-label">Step 1 — Technology</p>
                <div className="pp-angle-switch" style={{ marginBottom: 16 }}>
                  {TECHNOLOGIES.map((t) => (
                    <button key={t} type="button" className={`pp-angle-pill ${technology === t ? "pp-angle-pill-active" : ""}`} onClick={() => setTechnology(t)}>
                      {t}
                    </button>
                  ))}
                </div>

                <p className="dtj-field-label">Step 2 — Treated Areas</p>
                <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <button type="button" className="dtj-link-small" onClick={() => applyPreset(ALL_ABDOMEN_AREAS)}>Abdomen Protocol preset</button>
                  <button type="button" className="dtj-link-small" onClick={() => applyPreset(LEGS_PRESETS.posteriorOnly)}>Legs — Posterior Only</button>
                  <button type="button" className="dtj-link-small" onClick={() => applyPreset(LEGS_PRESETS.frontAndBack)}>Legs — Front + Back</button>
                </div>
                <InteractiveBodyMap selectedAreas={selectedAreas} onToggleArea={toggleArea} />

                <p className="dtj-field-label" style={{ marginTop: 14, display: "flex", justifyContent: "space-between" }}>
                  <span>Selected Areas ({areas.length})</span>
                  {areas.length > 0 && (
                    <button type="button" className="dtj-link-small" onClick={() => setSelectedAreas(new Set())}>Clear All</button>
                  )}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                  {areas.length === 0 ? (
                    <p className="pay-history-meta">Tap the body map above to select treated areas.</p>
                  ) : (
                    areas.map((a) => (
                      <span key={a} className="pmc-pill" style={{ position: "static", transform: "none", display: "flex", alignItems: "center", gap: 6 }}>
                        {a}
                        <button type="button" onClick={() => toggleArea(a)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mocha)", padding: 0, fontSize: 11 }}>✕</button>
                      </span>
                    ))
                  )}
                </div>

                <p className="dtj-field-label">Step 3 — Objective (auto-generated)</p>
                {objectives.length > 0 ? (
                  <p className="pay-history-meta" style={{ marginBottom: 16 }}>{objectives.join(" · ")}</p>
                ) : (
                  <p className="pay-history-meta" style={{ marginBottom: 16 }}>Select areas to generate objectives.</p>
                )}

                <p className="dtj-field-label">Step 5 — Specialist Notes</p>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="sched-textarea" style={{ marginBottom: 16 }} />

                {error && <p className="sched-error">{error}</p>}
                <div className="bp-sheet-actions">
                  <button type="button" className="sched-secondary-btn" onClick={closeAndReset}>Cancel</button>
                  <button type="button" className="sched-cta" onClick={handleSubmit} disabled={isPending || areas.length === 0}>
                    {isPending ? "Saving…" : "Save Session"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
