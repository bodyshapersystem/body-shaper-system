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
  totalSessions: number;
  progressPercent: number;
  specialistName: string;
  durationMinutes: number;
};

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00",
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

export default function AppointmentScheduler({ clients }: { clients: ClientOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [clientId, setClientId] = useState("");
  const [context, setContext] = useState<SessionContext | null>(null);
  const [loadingContext, setLoadingContext] = useState(false);

  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  const [dateMode, setDateMode] = useState<"today" | "tomorrow" | "custom">("today");
  const [customDate, setCustomDate] = useState(dateKey(today));
  const [time, setTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ appointmentClientId: string } | null>(null);
  const [systemOverride, setSystemOverride] = useState("");
  const [sessionOverride, setSessionOverride] = useState<number | "">("");

  function handleClientChange(id: string) {
    setClientId(id);
    setContext(null);
    setSuccess(null);
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

  function selectedDate(): Date {
    if (dateMode === "today") return today;
    if (dateMode === "tomorrow") return tomorrow;
    return new Date(customDate + "T00:00:00");
  }

  const effectiveSystem = systemOverride.trim() || context?.system || null;
  const effectiveSession = sessionOverride !== "" ? sessionOverride : context?.currentSession ?? 1;

  function handleSubmit() {
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
    if (notes) formData.set("notes", notes);

    startTransition(async () => {
      const result = await createAppointment(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSuccess({ appointmentClientId: clientId });
      setTime(null);
      setNotes("");
      router.refresh();
    });
  }

  if (success) {
    return (
      <div className="sched-success">
        <span className="sched-success-check">✓</span>
        <h3>Session Scheduled</h3>
        <p>Session {effectiveSession} has been added successfully.</p>
        <div className="sched-success-actions">
          <a href={`/hub/clients/${success.appointmentClientId}?tab=blueprint`} className="sched-cta">
            View Appointment →
          </a>
          <button
            type="button"
            className="sched-secondary-btn"
            onClick={() => {
              setSuccess(null);
              setClientId("");
              setContext(null);
              setSystemOverride("");
              setSessionOverride("");
            }}
          >
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
      <div className="sched-section">
        <label className="sched-label" htmlFor="client-select">
          Client
        </label>
        <select
          id="client-select"
          value={clientId}
          onChange={(e) => handleClientChange(e.target.value)}
          className="sched-select"
        >
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
        <>
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
              of {context.totalSessions}
            </p>
            <div className="sched-progress-track">
              <div className="sched-progress-fill" style={{ width: `${Math.min(context.progressPercent, 100)}%` }} />
            </div>
            <p className="sched-progress-label">{context.progressPercent}% Complete</p>
            <div className="sched-summary-meta">
              <div>
                <span>Specialist</span>
                <strong>{context.specialistName}</strong>
              </div>
              <div>
                <span>Estimated Duration</span>
                <strong>{context.durationMinutes} minutes</strong>
              </div>
            </div>
          </div>

          <div className="sched-section">
            <h4 className="sched-subheading">Today's Protocol</h4>
            <ul className="sched-protocol-list">
              <li>✓ {effectiveSystem ?? "Personalized treatment protocol"}</li>
            </ul>
          </div>

          <div className="sched-section">
            <h4 className="sched-subheading">Session Information</h4>
            <div className="sched-session-info">
              <div>
                <span>Current Phase</span>
                <strong>Foundation</strong>
              </div>
              <div>
                <span>Expected Milestone</span>
                <strong>Improved lymphatic activation and skin firmness.</strong>
              </div>
            </div>
          </div>
        </>
      )}

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

      <div className="sched-section">
        <label className="sched-label" htmlFor="clinical-notes">
          Clinical Notes (optional)
        </label>
        <textarea
          id="clinical-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="sched-textarea"
          placeholder="Add any relevant notes for this session…"
        />
      </div>

      {error && <p className="sched-error">{error}</p>}

      <button type="button" className="sched-cta sched-cta-block" disabled={isPending} onClick={handleSubmit}>
        {isPending ? "Scheduling…" : "Schedule Session →"}
      </button>
    </div>
  );
}
