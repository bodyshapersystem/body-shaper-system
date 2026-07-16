"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createAppointment, getClientSessionContext } from "./actions";

type ClientOption = { id: string; firstName: string; lastName: string };

type SessionContext = {
  firstName: string;
  lastName: string;
  system: string | null;
  currentSession: number;
  totalSessions: number | null;
  progressPercent: number | null;
  specialistName: string;
  durationMinutes: number;
};

/**
 * A technology selected for this session. Deliberately structured so
 * each entry can gain per-technology fields later (body area, custom
 * duration override, intensity, technology-specific settings, notes)
 * without redesigning this component or migrating the database again
 * — Appointment.technologies is already a JSON array of these
 * objects, so new optional fields just start appearing in new rows.
 */
type TechSelection = {
  name: string;
  minutes: number;
  bodyArea?: string;
  intensity?: string;
  notes?: string;
};

const TECHNOLOGIES: { name: string; minutes: number; label: string }[] = [
  { name: "Exilis Elite™", minutes: 50, label: "45–50 min" },
  { name: "EMS™", minutes: 30, label: "30 min" },
  { name: "Endospheres™", minutes: 30, label: "30 min" },
  { name: "Carboxy™", minutes: 30, label: "30 min" },
  { name: "Lymphatic Drainage™", minutes: 30, label: "30 min" },
  { name: "RF + Cavitation™", minutes: 45, label: "40–50 min" },
];

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00",
];

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

type Step = 1 | 2 | 3 | 4;

export default function AppointmentScheduler({ clients }: { clients: ClientOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>(1);

  const [clientId, setClientId] = useState("");
  const [context, setContext] = useState<SessionContext | null>(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const [systemOverride, setSystemOverride] = useState("");
  const [sessionOverride, setSessionOverride] = useState<number | "">("");

  const [selectedTechs, setSelectedTechs] = useState<TechSelection[]>([]);
  const [notes, setNotes] = useState("");
  const [locationType, setLocationType] = useState<"HOME" | "STUDIO">("HOME");

  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);
  const [dateMode, setDateMode] = useState<"today" | "tomorrow" | "custom">("today");
  const [customDate, setCustomDate] = useState(dateKey(today));
  const [time, setTime] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [scheduled, setScheduled] = useState<{ clientId: string } | null>(null);

  function handleClientChange(id: string) {
    setClientId(id);
    setContext(null);
    setSystemOverride("");
    setSessionOverride("");
    if (!id) return;
    setLoadingContext(true);
    startTransition(async () => {
      const ctx = await getClientSessionContext(id);
      setContext(ctx);
      setLoadingContext(false);
    });
  }

  function toggleTech(tech: { name: string; minutes: number }) {
    setSelectedTechs((prev) =>
      prev.some((t) => t.name === tech.name)
        ? prev.filter((t) => t.name !== tech.name)
        : [...prev, { name: tech.name, minutes: tech.minutes }]
    );
  }

  const estimatedDuration = selectedTechs.reduce((sum, t) => sum + t.minutes, 0);

  const effectiveSystem = systemOverride.trim() || context?.system || null;
  const effectiveSession = sessionOverride !== "" ? sessionOverride : context?.currentSession ?? 1;

  function selectedDate(): Date {
    if (dateMode === "today") return today;
    if (dateMode === "tomorrow") return tomorrow;
    return new Date(customDate + "T00:00:00");
  }

  function handleSchedule() {
    setError("");
    if (!clientId) {
      setError("Select a client first.");
      return;
    }
    if (!time) {
      setError("Choose a time for this session.");
      return;
    }

    const [h, m] = time.split(":").map(Number);
    const startsAt = selectedDate();
    startsAt.setHours(h, m, 0, 0);

    const title = effectiveSystem ? `Session ${effectiveSession} — ${effectiveSystem}` : `Session ${effectiveSession}`;

    const formData = new FormData();
    formData.set("clientId", clientId);
    formData.set("title", title);
    formData.set("startsAt", startsAt.toISOString());
    formData.set("locationType", locationType);
    if (notes) formData.set("notes", notes);
    if (selectedTechs.length > 0) formData.set("technologies", JSON.stringify(selectedTechs));    if (estimatedDuration > 0) formData.set("estimatedMinutes", String(estimatedDuration));

    startTransition(async () => {
      const result = await createAppointment(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setScheduled({ clientId });
      router.refresh();
    });
  }

  function resetAll() {
    setScheduled(null);
    setStep(1);
    setClientId("");
    setContext(null);
    setSystemOverride("");
    setSessionOverride("");
    setSelectedTechs([]);
    setNotes("");
    setTime(null);
    setDateMode("today");
  }

  // ---------- Step 4: Confirmation ----------
  if (scheduled) {
    return (
      <div className="sched-success">
        <span className="sched-success-check">✓</span>
        <h3>Session Scheduled</h3>
        <p>Session {effectiveSession} has been successfully scheduled.</p>
        <div className="sched-confirm-details">
          <div>
            <span>Client</span>
            <strong>
              {context?.firstName} {context?.lastName}
            </strong>
          </div>
          <div>
            <span>Date</span>
            <strong>{selectedDate().toLocaleDateString()}</strong>
          </div>
          <div>
            <span>Time</span>
            <strong>{time ? fmtTime(time) : "—"}</strong>
          </div>
          <div>
            <span>Est. Duration</span>
            <strong>{estimatedDuration || context?.durationMinutes || 75} min</strong>
          </div>
          {selectedTechs.length > 0 && (
            <div>
              <span>Technologies</span>
              <strong>{selectedTechs.map((t) => t.name).join(", ")}</strong>
            </div>
          )}
        </div>
        <div className="sched-success-actions">
          <a href={`/hub/clients/${scheduled.clientId}?tab=blueprint`} className="sched-cta">
            View Appointment →
          </a>
          <button type="button" className="sched-secondary-btn" onClick={resetAll}>
            Schedule Another
          </button>
          <a href="/hub/dashboard" className="sched-text-link">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="sched-form">
      {/* ---------- Step 1: Client + Summary ---------- */}
      <div className="sched-section">
        <label className="sched-label" htmlFor="client-select">
          Client
        </label>
        <select id="client-select" value={clientId} onChange={(e) => handleClientChange(e.target.value)} className="sched-select">
          <option value="">Select client…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName}
            </option>
          ))}
        </select>
      </div>

      {loadingContext && <p className="sched-loading">Loading client summary…</p>}

      {context && (
        <div className="sched-summary-card">
          <h3>
            {context.firstName} {context.lastName}
          </h3>
          <input
            type="text"
            value={systemOverride}
            onChange={(e) => setSystemOverride(e.target.value)}
            placeholder={context.system ?? "Enter system (e.g. ExiLipo Signature™)"}
            className="sched-inline-input sched-system-input"
          />
          <p className="sched-session-line">
            Session{" "}
            <input
              type="number"
              min={1}
              value={sessionOverride === "" ? context.currentSession : sessionOverride}
              onChange={(e) => setSessionOverride(e.target.value === "" ? "" : Number(e.target.value))}
              className="sched-inline-input sched-session-input"
            />{" "}
            {context.totalSessions !== null ? `of ${context.totalSessions}` : "· plan not set yet"}
          </p>
          {context.totalSessions !== null && (
            <>
              <div className="sched-progress-track">
                <div className="sched-progress-fill" style={{ width: `${Math.min(context.progressPercent ?? 0, 100)}%` }} />
              </div>
              <p className="sched-progress-label">{context.progressPercent}% Complete</p>
            </>
          )}
          <div className="sched-summary-meta">
            <div>
              <span>Specialist</span>
              <strong>{context.specialistName}</strong>
            </div>
            <div>
              <span>Estimated Duration</span>
              <strong>{estimatedDuration || context.durationMinutes} min</strong>
            </div>
          </div>
        </div>
      )}

      {context && step === 1 && (
        <button type="button" className="sched-cta sched-cta-block" onClick={() => setStep(2)}>
          Continue to Session Setup →
        </button>
      )}

      {/* ---------- Step 2: Today's Tech (technologies + duration + session notes, all in one operational section) ---------- */}
      {context && step >= 2 && (
        <>
          <div className="sched-section">
            <h4 className="sched-subheading">Today's Tech</h4>
            <p className="sched-hint">Select every technology included in today's visit.</p>
            <ul className="sched-tech-list">
              {TECHNOLOGIES.map((tech) => (
                <li key={tech.name}>
                  <label className="sched-tech-row">
                    <input
                      type="checkbox"
                      checked={selectedTechs.some((t) => t.name === tech.name)}
                      onChange={() => toggleTech(tech)}
                      className="sched-checkbox"
                    />
                    <span className="sched-tech-name">{tech.name}</span>
                    <span className="sched-tech-time">{tech.label}</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="sched-duration-summary">
              <span>Estimated Duration</span>
              <strong>{estimatedDuration || 0} min</strong>
              <span className="sched-tech-count">{selectedTechs.length} selected</span>
            </div>
            <label className="sched-label">Location</label>
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <button
                type="button"
                className={locationType === "HOME" ? "sched-cta" : "sched-secondary-btn"}
                onClick={() => setLocationType("HOME")}
              >
                🏡 At Client's Home
              </button>
              <button
                type="button"
                className={locationType === "STUDIO" ? "sched-cta" : "sched-secondary-btn"}
                onClick={() => setLocationType("STUDIO")}
              >
                🏢 Studio Location
              </button>
            </div>
            <label className="sched-label sched-notes-label" htmlFor="session-notes">
              Session Notes (optional)
            </label>
            <textarea
              id="session-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="sched-textarea"
              placeholder="Add relevant notes about today's session…"
            />
          </div>

          {step === 2 && (
            <button type="button" className="sched-cta sched-cta-block" onClick={() => setStep(3)}>
              Continue to Schedule →
            </button>
          )}
        </>
      )}

      {/* ---------- Step 3: Date + Time ---------- */}
      {context && step >= 3 && (
        <>
          <div className="sched-section">
            <h4 className="sched-subheading">Date</h4>
            <div className="sched-date-pills">
              <button type="button" className={dateMode === "today" ? "sched-pill active" : "sched-pill"} onClick={() => setDateMode("today")}>
                Today
              </button>
              <button type="button" className={dateMode === "tomorrow" ? "sched-pill active" : "sched-pill"} onClick={() => setDateMode("tomorrow")}>
                Tomorrow
              </button>
              <button type="button" className={dateMode === "custom" ? "sched-pill active" : "sched-pill"} onClick={() => setDateMode("custom")}>
                Choose another date
              </button>
            </div>
            {dateMode === "custom" && (
              <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="sched-date-input" />
            )}
          </div>

          <div className="sched-section">
            <h4 className="sched-subheading">Time</h4>
            <div className="sched-time-chips">
              {TIME_SLOTS.map((t) => (
                <button key={t} type="button" className={time === t ? "sched-chip active" : "sched-chip"} onClick={() => setTime(t)}>
                  {fmtTime(t)}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="sched-error">{error}</p>}

          <button type="button" className="sched-cta sched-cta-block" disabled={isPending} onClick={handleSchedule}>
            {isPending ? "Scheduling…" : "Confirm & Schedule Session →"}
          </button>
        </>
      )}
    </div>
  );
}
