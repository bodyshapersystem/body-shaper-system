"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logPeptideDose, deletePeptideLog } from "./actions";

type PeptideLogEntry = {
  id: string;
  peptideName: string;
  administeredAt: string; // ISO
  dosage: string | null;
  notes: string | null;
};

export default function PeptideCalendar({ logs }: { logs: PeptideLogEntry[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [peptideName, setPeptideName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [dosage, setDosage] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await logPeptideDose({
        peptideName,
        administeredAt: `${date}T${time}:00`,
        dosage: dosage || undefined,
        notes: notes || undefined,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setPeptideName("");
      setDosage("");
      setNotes("");
      setOpen(false);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Remove this entry?")) return;
    startTransition(async () => {
      await deletePeptideLog(id);
      router.refresh();
    });
  }

  const grouped = new Map<string, PeptideLogEntry[]>();
  for (const log of logs) {
    const dayKey = new Date(log.administeredAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    if (!grouped.has(dayKey)) grouped.set(dayKey, []);
    grouped.get(dayKey)!.push(log);
  }

  return (
    <div className="trk-card trk-peptide-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 className="trk-card-title" style={{ marginBottom: 0 }}>💉 Peptide Calendar</h3>
        <button type="button" className="trk-peptide-add-btn" onClick={() => setOpen((v) => !v)}>
          {open ? "Cancel" : "+ Log a Dose"}
        </button>
      </div>
      <p className="pay-history-meta" style={{ marginBottom: 12 }}>
        Keep a real record of what you're taking, and when — this also counts toward your Blueprint Score™.
      </p>

      {open && (
        <form onSubmit={handleSubmit} className="trk-peptide-form">
          <input
            value={peptideName}
            onChange={(e) => setPeptideName(e.target.value)}
            placeholder="Which peptide? (e.g. Semaglutide, BPC-157)"
            required
            className="trk-peptide-input"
          />
          <div className="trk-peptide-form-row">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="trk-peptide-input" />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="trk-peptide-input" />
          </div>
          <input
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="Dosage (optional, e.g. 0.25mg)"
            className="trk-peptide-input"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="trk-peptide-input"
            rows={2}
          />
          {error && <p className="sched-error">{error}</p>}
          <button type="submit" className="trk-peptide-save-btn" disabled={isPending}>
            {isPending ? "Saving…" : "Save Entry"}
          </button>
        </form>
      )}

      {logs.length === 0 && !open && (
        <p className="pay-history-meta">No doses logged yet — tap "+ Log a Dose" to start your calendar.</p>
      )}

      {Array.from(grouped.entries()).map(([day, entries]) => (
        <div key={day} className="trk-peptide-day">
          <p className="trk-peptide-day-label">{day}</p>
          {entries.map((log) => (
            <div key={log.id} className="trk-peptide-entry">
              <div>
                <strong>{log.peptideName}</strong>
                {log.dosage && <span className="trk-peptide-dosage"> · {log.dosage}</span>}
                <p className="pay-history-meta">
                  {new Date(log.administeredAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  {log.notes ? ` — ${log.notes}` : ""}
                </p>
              </div>
              <button type="button" className="trk-peptide-delete" onClick={() => handleDelete(log.id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
