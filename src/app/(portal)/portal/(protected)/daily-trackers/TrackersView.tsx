"use client";

import { useState, useTransition } from "react";
import { updateTodayTracker, requestNextSession } from "./actions";
import { computeDailyCompletionPercent, computeRecoveryScore, getCompletedCategories, type TrackerDay, type Achievement } from "@/lib/daily-tracker-scoring";

type TodayTracker = {
  waterGlasses: number;
  steps: number | null;
  stepsGoal: number;
  sleepHours: number | null;
  sleepQuality: string | null;
  compressionWorn: boolean | null;
  compressionHours: number | null;
  moodCheckIn: string | null;
  moodNote: string | null;
  symptoms: string[];
  dailyNote: string | null;
  weightLbs: number | null;
} | null;

const SYMPTOM_OPTIONS = ["Bloating", "Water Retention", "Constipation", "Menstrual Cycle", "Low Energy", "Cravings"];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function TrackersView({
  firstName,
  todayTracker,
  days,
  streak,
  achievements,
  weightHistory,
}: {
  firstName: string;
  todayTracker: TodayTracker;
  days: TrackerDay[];
  streak: number;
  achievements: Achievement[];
  weightHistory: { date: string; weightLbs: number }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [water, setWater] = useState(todayTracker?.waterGlasses ?? 0);
  const [steps, setSteps] = useState(todayTracker?.steps ?? 0);
  const [sleepHours, setSleepHours] = useState(todayTracker?.sleepHours ?? "");
  const [sleepQuality, setSleepQuality] = useState(todayTracker?.sleepQuality ?? "");
  const [compressionWorn, setCompressionWorn] = useState<boolean | null>(todayTracker?.compressionWorn ?? null);
  const [compressionHours, setCompressionHours] = useState(todayTracker?.compressionHours ?? "");
  const [mood, setMood] = useState(todayTracker?.moodCheckIn ?? "");
  const [moodNote, setMoodNote] = useState(todayTracker?.moodNote ?? "");
  const [symptoms, setSymptoms] = useState<string[]>(todayTracker?.symptoms ?? []);
  const [dailyNote, setDailyNote] = useState(todayTracker?.dailyNote ?? "");
  const [weightInput, setWeightInput] = useState("");
  const [showWeightHistory, setShowWeightHistory] = useState(false);
  const [showRecoveryInfo, setShowRecoveryInfo] = useState(false);
  const [showBookSession, setShowBookSession] = useState(false);
  const [bookingNote, setBookingNote] = useState("");
  const [bookingSent, setBookingSent] = useState(false);

  function save(fields: Record<string, unknown>) {
    startTransition(async () => {
      await updateTodayTracker(fields);
    });
  }

  function adjustWater(delta: number) {
    const next = Math.max(0, Math.min(8, water + delta));
    setWater(next);
    save({ waterGlasses: next });
  }

  function toggleSymptom(s: string) {
    const next = symptoms.includes(s) ? symptoms.filter((x) => x !== s) : [...symptoms, s];
    setSymptoms(next);
    save({ symptoms: next });
  }

  const todayDay: TrackerDay = {
    date: new Date().toISOString(),
    waterGlasses: water,
    steps: steps || null,
    sleepHours: sleepHours === "" ? null : Number(sleepHours),
    compressionWorn,
    moodCheckIn: mood || null,
    symptoms,
    weightLbs: todayTracker?.weightLbs ?? null,
  };
  const completionPercent = computeDailyCompletionPercent(todayDay);
  const recoveryScore = computeRecoveryScore(todayDay);
  const completed = getCompletedCategories(todayDay);
  const habitsDoneCount = Object.values(completed).filter(Boolean).length;

  async function handleBookSession() {
    const result = await requestNextSession(bookingNote);
    if (result?.success) setBookingSent(true);
  }

  return (
    <>
      {/* ---------- Hero ---------- */}
      <div className="trk-hero">
        <p className="trk-hero-eyebrow">small actions.</p>
        <h1 className="trk-hero-title">Daily Trackers™</h1>
        <p className="trk-hero-sub">Remarkable results.</p>
        <p className="trk-hero-support">Every habit you complete helps optimize your personalized system.</p>
      </div>

      {/* ---------- Summary Bar ---------- */}
      <div className="trk-summary-bar">
        <div>
          <p className="trk-summary-label">Today</p>
          <p className="trk-summary-value">{new Date().toLocaleDateString(undefined, { month: "long", day: "numeric" })}</p>
        </div>
        <div>
          <p className="trk-summary-label">🔥 Streak</p>
          <p className="trk-summary-value">{streak} Day{streak === 1 ? "" : "s"}</p>
        </div>
        <div>
          <p className="trk-summary-label">Today's Score</p>
          <p className="trk-summary-value">{completionPercent}%</p>
        </div>
        <div>
          <p className="trk-summary-label">Completed</p>
          <p className="trk-summary-value">{habitsDoneCount} / 7</p>
        </div>
      </div>

      <div className="trk-grid">
        {/* Hydration */}
        <div className="trk-card">
          <h3 className="trk-card-title">Hydration</h3>
          <div className="trk-water-circles">
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} className={`trk-water-dot ${i < water ? "trk-water-dot-filled" : ""}`} />
            ))}
          </div>
          <p className="pay-history-meta">{water} / 8 glasses today</p>
          <div className="trk-water-btns">
            <button type="button" className="trk-round-btn" onClick={() => adjustWater(-1)} disabled={isPending}>–</button>
            <button type="button" className="trk-round-btn" onClick={() => adjustWater(1)} disabled={isPending}>+</button>
          </div>
        </div>

        {/* Movement */}
        <div className="trk-card">
          <h3 className="trk-card-title">Movement</h3>
          <div className="trk-progress-circle" style={{ background: `conic-gradient(#6B4E3D ${Math.min((steps / (todayTracker?.stepsGoal ?? 8000)) * 100, 100)}%, rgba(0,0,0,0.06) 0)` }}>
            <div className="trk-progress-circle-inner">
              <strong>{steps.toLocaleString()}</strong>
              <span>steps</span>
            </div>
          </div>
          <p className="pay-history-meta">Goal: {(todayTracker?.stepsGoal ?? 8000).toLocaleString()}</p>
          <input
            type="number"
            value={steps || ""}
            onChange={(e) => setSteps(Number(e.target.value) || 0)}
            onBlur={() => save({ steps })}
            placeholder="Enter today's steps"
            className="sched-select"
          />
        </div>

        {/* Sleep */}
        <div className="trk-card">
          <h3 className="trk-card-title">Sleep</h3>
          <div className="trk-progress-circle" style={{ background: `conic-gradient(#6B4E3D ${Math.min(((Number(sleepHours) || 0) / 9) * 100, 100)}%, rgba(0,0,0,0.06) 0)` }}>
            <div className="trk-progress-circle-inner">
              <strong>{sleepHours || "—"}h</strong>
              <span>{sleepQuality || "Not logged"}</span>
            </div>
          </div>
          <input
            type="number"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
            onBlur={() => save({ sleepHours: sleepHours === "" ? null : Number(sleepHours) })}
            placeholder="Hours slept"
            className="sched-select"
            style={{ marginBottom: 8 }}
          />
          <select
            value={sleepQuality}
            onChange={(e) => {
              setSleepQuality(e.target.value);
              save({ sleepQuality: e.target.value });
            }}
            className="sched-select"
          >
            <option value="">Quality…</option>
            <option value="Poor">Poor</option>
            <option value="Fair">Fair</option>
            <option value="Good">Good</option>
            <option value="Excellent">Excellent</option>
          </select>
        </div>

        {/* Compression */}
        <div className="trk-card">
          <h3 className="trk-card-title">Compression Garment</h3>
          <p className="pay-history-meta" style={{ marginBottom: 10 }}>Did you wear your compression garment today?</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button
              type="button"
              className={compressionWorn === true ? "cap-view-tab-active cap-view-tab" : "cap-view-tab"}
              onClick={() => { setCompressionWorn(true); save({ compressionWorn: true }); }}
            >
              Yes
            </button>
            <button
              type="button"
              className={compressionWorn === false ? "cap-view-tab-active cap-view-tab" : "cap-view-tab"}
              onClick={() => { setCompressionWorn(false); save({ compressionWorn: false }); }}
            >
              No
            </button>
          </div>
          {compressionWorn && (
            <input
              type="number"
              step="0.5"
              value={compressionHours}
              onChange={(e) => setCompressionHours(e.target.value)}
              onBlur={() => save({ compressionHours: compressionHours === "" ? null : Number(compressionHours) })}
              placeholder="Hours worn"
              className="sched-select"
            />
          )}
        </div>

        {/* Nutrition / mood */}
        <div className="trk-card">
          <h3 className="trk-card-title">How did you feel today?</h3>
          <div className="trk-mood-row">
            {[
              { key: "GREAT", emoji: "😊", label: "Great" },
              { key: "OKAY", emoji: "🙂", label: "Okay" },
              { key: "BLOATED", emoji: "😣", label: "Bloated" },
            ].map((m) => (
              <button
                key={m.key}
                type="button"
                className={`trk-mood-btn ${mood === m.key ? "trk-mood-btn-active" : ""}`}
                onClick={() => { setMood(m.key); save({ moodCheckIn: m.key }); }}
              >
                <span style={{ fontSize: 22 }}>{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
          <textarea
            value={moodNote}
            onChange={(e) => setMoodNote(e.target.value)}
            onBlur={() => save({ moodNote })}
            placeholder="Optional note…"
            rows={2}
            className="sched-textarea"
            style={{ marginTop: 10 }}
          />
        </div>

        {/* Symptoms */}
        <div className="trk-card">
          <h3 className="trk-card-title">Symptoms</h3>
          <div className="trk-symptom-list">
            {SYMPTOM_OPTIONS.map((s) => (
              <label key={s} className="trk-symptom-row">
                <input type="checkbox" checked={symptoms.includes(s)} onChange={() => toggleSymptom(s)} />
                {s}
              </label>
            ))}
          </div>
        </div>

        {/* Weight */}
        <div className="trk-card">
          <h3 className="trk-card-title">Weight</h3>
          <p className="trk-weight-value">{todayTracker?.weightLbs ? `${todayTracker.weightLbs} lbs` : "Not logged today"}</p>
          <input
            type="number"
            step="0.1"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder="Enter weight (lbs)"
            className="sched-select"
            style={{ marginBottom: 8 }}
          />
          <button
            type="button"
            className="cap-primary-btn"
            onClick={() => {
              if (!weightInput) return;
              save({ weightLbs: Number(weightInput) });
              setWeightInput("");
            }}
          >
            Save Weight
          </button>
          <button type="button" className="trk-link-btn" onClick={() => setShowWeightHistory(true)}>View Weight History</button>
        </div>

        {/* Daily Notes */}
        <div className="trk-card">
          <h3 className="trk-card-title">Daily Notes</h3>
          <p className="pay-history-meta" style={{ marginBottom: 8 }}>Energy, digestion, mood, stress, sleep, water intake…</p>
          <textarea
            value={dailyNote}
            onChange={(e) => setDailyNote(e.target.value)}
            onBlur={() => save({ dailyNote })}
            rows={3}
            className="sched-textarea"
            placeholder="How did you feel today?"
          />
        </div>
      </div>

      {/* ---------- Recovery Score ---------- */}
      <div className="trk-recovery-card">
        <p className="trk-recovery-label">Recovery Score™</p>
        <p className="trk-recovery-value">{recoveryScore}%</p>
        <p className="trk-recovery-tier">{recoveryScore >= 90 ? "Excellent Consistency" : recoveryScore >= 70 ? "Strong Consistency" : recoveryScore >= 40 ? "Building Consistency" : "Just Getting Started"}</p>
        <p className="pay-history-meta">Your daily habits are supporting your results.</p>
        <button type="button" className="trk-link-btn" onClick={() => setShowRecoveryInfo(true)}>How is this calculated?</button>
      </div>

      {/* ---------- Weekly Consistency + Today's Progress ---------- */}
      <div className="trk-two-col">
        <div className="trk-card">
          <h3 className="trk-card-title">Weekly Consistency</h3>
          <WeeklyDots days={days} />
        </div>
        <div className="trk-card" style={{ textAlign: "center" }}>
          <h3 className="trk-card-title">Today's Progress</h3>
          <div className="trk-progress-circle" style={{ margin: "0 auto 14px", background: `conic-gradient(#6B4E3D ${completionPercent}%, rgba(0,0,0,0.06) 0)` }}>
            <div className="trk-progress-circle-inner"><strong>{completionPercent}%</strong></div>
          </div>
          <ul className="trk-checklist">
            {(["hydration", "movement", "sleep", "compression", "nutrition", "symptoms", "weight"] as const).map((k) => (
              <li key={k}>{completed[k] ? "✅" : "⬜"} {k.charAt(0).toUpperCase() + k.slice(1)}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* ---------- Achievements ---------- */}
      <h3 className="dash-section-title" style={{ marginTop: 32 }}>Achievements</h3>
      <div className="trk-achievements-row">
        <div className="trk-achievement-grid" style={{ flex: 1 }}>
          {achievements.map((a) => (
            <div key={a.label} className={`trk-achievement-card ${a.earned ? "" : "trk-achievement-card-locked"}`}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <span>{a.label}</span>
            </div>
          ))}
        </div>
        <div className="trk-motivation-card">
          <p>✦</p>
          <p>consistency today, transformation tomorrow.</p>
        </div>
      </div>

      {/* ---------- Bottom CTA ---------- */}
      <div className="trk-cta-bar">
        <div>
          <h3>Ready to book your next session?</h3>
          <p>Our team will review your request and contact you with the best available options.</p>
        </div>
        {!bookingSent ? (
          <button type="button" className="apt-new-btn" onClick={() => setShowBookSession(true)}>Book My Next Session</button>
        ) : (
          <p style={{ color: "#F6F3EE", fontFamily: "var(--sans)", fontSize: 13 }}>Request sent — we'll be in touch!</p>
        )}
      </div>

      {showBookSession && (
        <div className="apd-overlay" onClick={() => setShowBookSession(false)}>
          <div className="onb-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="onb-step-title">Book My Next Session</h3>
            <p className="onb-step-sub">This sends a request to your specialist — they'll follow up with the best available times.</p>
            <textarea value={bookingNote} onChange={(e) => setBookingNote(e.target.value)} rows={3} className="sched-textarea" placeholder="Any preferred days/times? (optional)" style={{ marginBottom: 12 }} />
            <button type="button" className="onb-cta" style={{ border: "none", cursor: "pointer" }} onClick={handleBookSession}>Send Request</button>
          </div>
        </div>
      )}

      {showWeightHistory && (
        <div className="apd-overlay" onClick={() => setShowWeightHistory(false)}>
          <div className="onb-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="onb-step-title">Weight History</h3>
            {weightHistory.length === 0 ? (
              <p className="pay-history-meta">No weight entries yet.</p>
            ) : (
              <ul style={{ maxHeight: 300, overflowY: "auto" }}>
                {weightHistory.map((w) => (
                  <li key={w.date} className="apd-detail-row" style={{ color: "#2B2622" }}>
                    <span>{new Date(w.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                    <strong>{w.weightLbs} lbs</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {showRecoveryInfo && (
        <div className="apd-overlay" onClick={() => setShowRecoveryInfo(false)}>
          <div className="onb-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="onb-step-title">How is this calculated?</h3>
            <p className="onb-step-sub">
              Your Recovery Score™ is an adherence score, not a medical score — it reflects how many of your 7 daily
              habits (Hydration, Movement, Sleep, Compression, Nutrition, Symptoms, Weight) you logged today.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function WeeklyDots({ days }: { days: TrackerDay[] }) {
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - ((day + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const completedCount = weekDays.filter((d) => {
    const match = days.find((t) => new Date(t.date).toDateString() === d.toDateString());
    return match && Object.values(getCompletedCategories(match)).some(Boolean);
  }).length;

  return (
    <>
      <div className="trk-week-dots">
        {weekDays.map((d, i) => {
          const match = days.find((t) => new Date(t.date).toDateString() === d.toDateString());
          const isDone = match && Object.values(getCompletedCategories(match)).some(Boolean);
          return (
            <div key={i} className="trk-week-day">
              <span className={`trk-week-circle ${isDone ? "trk-week-circle-filled" : ""}`} />
              <span className="trk-week-label">{DAY_LABELS[i]}</span>
            </div>
          );
        })}
      </div>
      <p className="pay-history-meta" style={{ marginTop: 10 }}>{completedCount} / 7 days completed</p>
    </>
  );
}
