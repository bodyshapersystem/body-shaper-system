"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveReminderPreference, saveQuietHours, REMINDER_CATEGORIES } from "./actions";

const DAY_CHIPS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

type Pref = {
  category: string;
  enabled: boolean;
  emailEnabled: boolean;
  reminderTimes: string[];
  relevantDays: string[];
};

function defaultPref(category: string): Pref {
  return { category, enabled: true, emailEnabled: true, reminderTimes: [], relevantDays: [] };
}

export default function ReminderCenterView({
  initialPreferences,
  initialQuietHoursStart,
  initialQuietHoursEnd,
}: {
  initialPreferences: Pref[];
  initialQuietHoursStart: string | null;
  initialQuietHoursEnd: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Record<string, Pref>>(() => {
    const map: Record<string, Pref> = {};
    for (const c of REMINDER_CATEGORIES) map[c.key] = defaultPref(c.key);
    for (const p of initialPreferences) map[p.category] = p;
    return map;
  });
  const [quietStart, setQuietStart] = useState(initialQuietHoursStart ?? "21:00");
  const [quietEnd, setQuietEnd] = useState(initialQuietHoursEnd ?? "08:00");
  const [newTime, setNewTime] = useState("09:00");

  function updatePref(category: string, patch: Partial<Pref>) {
    const next = { ...prefs[category], ...patch };
    setPrefs((p) => ({ ...p, [category]: next }));
    startTransition(async () => {
      await saveReminderPreference({
        category: next.category,
        enabled: next.enabled,
        emailEnabled: next.emailEnabled,
        reminderTimes: next.reminderTimes,
        relevantDays: next.relevantDays,
      });
      router.refresh();
    });
  }

  function toggleDay(category: string, day: string) {
    const curr = prefs[category].relevantDays;
    const next = curr.includes(day) ? curr.filter((d) => d !== day) : [...curr, day];
    updatePref(category, { relevantDays: next });
  }

  function addTime(category: string) {
    if (prefs[category].reminderTimes.includes(newTime)) return;
    updatePref(category, { reminderTimes: [...prefs[category].reminderTimes, newTime].sort() });
  }

  function removeTime(category: string, time: string) {
    updatePref(category, { reminderTimes: prefs[category].reminderTimes.filter((t) => t !== time) });
  }

  function handleSaveQuietHours() {
    startTransition(async () => {
      await saveQuietHours(quietStart, quietEnd);
    });
  }

  return (
    <div className="dtj-today">
      <p className="dtj-page-title">reminder center™</p>
      <p className="dtj-page-sub">your routine, gently kept on track.</p>

      <div className="rc-quiet-card">
        <p className="dtj-field-label">Quiet Hours</p>
        <p className="pay-history-meta" style={{ marginBottom: 10 }}>No non-essential reminders during this window.</p>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} className="dtj-editor-input" style={{ marginBottom: 0 }} />
          <span className="pay-history-meta">to</span>
          <input type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} className="dtj-editor-input" style={{ marginBottom: 0 }} />
          <button type="button" className="dtj-link-small" onClick={handleSaveQuietHours} disabled={isPending}>Save</button>
        </div>
      </div>

      <p className="dtj-field-label" style={{ marginTop: 20 }}>your reminders</p>

      {REMINDER_CATEGORIES.map(({ key, label }) => {
        const pref = prefs[key];
        const open = openCategory === key;
        const showDays = key === "COMPRESSION";
        const showTimes = key !== "PEPTIDE" && key !== "APPOINTMENTS";

        return (
          <div key={key} className="rc-category-card">
            <button type="button" className="rc-category-header" onClick={() => setOpenCategory(open ? null : key)}>
              <span>{label}</span>
              <span
                className={`dtj-toggle ${pref.enabled ? "dtj-toggle-on" : ""}`}
                onClick={(e) => { e.stopPropagation(); updatePref(key, { enabled: !pref.enabled }); }}
              >
                <span className="dtj-toggle-dot" />
              </span>
            </button>

            {open && pref.enabled && (
              <div className="rc-category-body">
                <label className="rc-checkbox-row">
                  <input type="checkbox" checked={pref.emailEnabled} onChange={(e) => updatePref(key, { emailEnabled: e.target.checked })} />
                  Email
                </label>

                {showTimes && (
                  <>
                    <p className="dtj-field-label">Reminder times</p>
                    <div className="dtj-pill-row" style={{ marginBottom: 8 }}>
                      {pref.reminderTimes.map((t) => (
                        <button key={t} type="button" className="dtj-pill dtj-pill-active" onClick={() => removeTime(key, t)}>
                          {t} ✕
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="dtj-editor-input" style={{ marginBottom: 0, width: 120 }} />
                      <button type="button" className="dtj-link-small" onClick={() => addTime(key)}>+ Add time</button>
                    </div>
                  </>
                )}

                {showDays && (
                  <>
                    <p className="dtj-field-label">Relevant days (leave blank for every day)</p>
                    <div className="dtj-pill-row">
                      {DAY_CHIPS.map((d) => (
                        <button key={d} type="button" className={`dtj-pill ${pref.relevantDays.includes(d) ? "dtj-pill-active" : ""}`} onClick={() => toggleDay(key, d)}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {(key === "PEPTIDE" || key === "APPOINTMENTS") && (
                  <p className="pay-history-meta">Timing for this reminder follows your real schedule — set in {key === "PEPTIDE" ? "Peptide Journey™" : "your appointments"}.</p>
                )}
              </div>
            )}
          </div>
        );
      })}

      <p className="dtj-footer-tag">small steps. one system.<br />bodyshapersystem.com</p>
    </div>
  );
}
