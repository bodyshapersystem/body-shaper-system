"use client";

import { useState, useTransition } from "react";
import { updateTodayTracker } from "./actions";
import { computeDailyCompletionPercent, computeRecoveryScore, getCompletedCategories, type TrackerDay } from "@/lib/daily-tracker-scoring";
import { DropIcon, ShoeIcon, MoonIcon, GarmentIcon, FlameIcon, PencilIcon, SmileIcon, ClockIcon } from "@/components/DTJIcons";

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

export type UpNextItem = { label: string; timeLabel: string };

const MOOD_OPTIONS = [
  { key: "GREAT", label: "Great" },
  { key: "OKAY", label: "Okay" },
  { key: "BLOATED", label: "Bloated" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "good morning";
  if (h < 18) return "good afternoon";
  return "good evening";
}

export default function TodayView({
  firstName,
  todayTracker,
  days,
  streak,
  upNext,
}: {
  firstName: string;
  todayTracker: TodayTracker;
  days: TrackerDay[];
  streak: number;
  upNext: UpNextItem[];
}) {
  const [, startTransition] = useTransition();
  const [water, setWater] = useState(todayTracker?.waterGlasses ?? 0);
  const [steps, setSteps] = useState(todayTracker?.steps ?? 0);
  const [sleepHours, setSleepHours] = useState(todayTracker?.sleepHours ?? "");
  const [sleepQuality, setSleepQuality] = useState(todayTracker?.sleepQuality ?? "");
  const [compressionWorn, setCompressionWorn] = useState<boolean | null>(todayTracker?.compressionWorn ?? null);
  const [mood, setMood] = useState(todayTracker?.moodCheckIn ?? "");
  const [dailyNote, setDailyNote] = useState(todayTracker?.dailyNote ?? "");
  const [openCard, setOpenCard] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

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

  const todayDay: TrackerDay = {
    date: new Date().toISOString(),
    waterGlasses: water,
    steps: steps || null,
    sleepHours: sleepHours === "" ? null : Number(sleepHours),
    compressionWorn,
    moodCheckIn: mood || null,
    symptoms: todayTracker?.symptoms ?? [],
    weightLbs: todayTracker?.weightLbs ?? null,
  };
  const completionPercent = computeDailyCompletionPercent(todayDay);
  const recoveryScore = computeRecoveryScore(todayDay);
  const completed = getCompletedCategories(todayDay);
  const habitsDoneCount = Object.values(completed).filter(Boolean).length;
  const allDone = habitsDoneCount === 7;
  const recoveryMessage = recoveryScore >= 70 ? "your body is responding" : "keep it up";

  return (
    <div className="dtj-today">
      <p className="dtj-greeting">
        {greeting()}, {firstName}. you're doing amazing. <span className="dtj-heart">♡</span>
      </p>

      <div className="dtj-hero-row">
        <div className="dtj-score-ring-v2" style={{ background: `conic-gradient(var(--rose) ${recoveryScore * 3.6}deg, #EFE6DA 0)` }}>
          <div className="dtj-score-ring-inner-v2">
            <span className="dtj-score-sparkle">✦</span>
            <p className="dtj-ring-label">RECOVERY SCORE</p>
            <strong>{recoveryScore}%</strong>
            <p className="dtj-ring-message">{recoveryMessage}</p>
          </div>
        </div>
        <div className="dtj-streak-box-v2">
          <span className="dtj-streak-icon-circle"><FlameIcon /></span>
          <p className="dtj-streak-days">{streak} day streak</p>
          <div className="dtj-streak-divider" />
          <p className="dtj-streak-completed">{habitsDoneCount} / 7 completed</p>
          <div className="dtj-streak-progress"><div className="dtj-streak-progress-fill" style={{ width: `${(habitsDoneCount / 7) * 100}%` }} /></div>
        </div>
      </div>

      <div className="dtj-score-trend-card-v2">
        <p className="dtj-mini-label">today's score</p>
        <strong className="dtj-score-trend-num">{completionPercent}</strong>
        <p className="dtj-mini-sub">{completionPercent >= 70 ? "great progress!" : "keep building momentum."}</p>
        <svg viewBox="0 0 90 90" className="dtj-branch-illustration">
          <path d="M8 82C24 66 30 46 34 24" fill="none" stroke="#C8A15A" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
          <path d="M18 66c4-8 10-10 16-9" fill="none" stroke="#C8A15A" strokeWidth="0.8" opacity="0.6" />
          <ellipse cx="35" cy="55" rx="6" ry="2.6" fill="none" stroke="#C8A15A" strokeWidth="0.8" transform="rotate(-35 35 55)" opacity="0.6" />
          <path d="M24 50c5-6 11-7 17-5" fill="none" stroke="#C8A15A" strokeWidth="0.8" opacity="0.6" />
          <ellipse cx="42" cy="42" rx="6" ry="2.6" fill="none" stroke="#C8A15A" strokeWidth="0.8" transform="rotate(-35 42 42)" opacity="0.6" />
          <path d="M30 34c5-4 11-4 16-1" fill="none" stroke="#C8A15A" strokeWidth="0.8" opacity="0.6" />
          <ellipse cx="47" cy="29" rx="6" ry="2.6" fill="none" stroke="#C8A15A" strokeWidth="0.8" transform="rotate(-30 47 29)" opacity="0.6" />
          <path d="M34 24c3-5 7-8 12-9" fill="none" stroke="#C8A15A" strokeWidth="0.8" opacity="0.6" />
          <ellipse cx="49" cy="14" rx="6" ry="2.6" fill="none" stroke="#C8A15A" strokeWidth="0.8" transform="rotate(-15 49 14)" opacity="0.6" />
        </svg>
      </div>

      {upNext.length > 0 && (
        <div className="dtj-upnext-card">
          <p className="dtj-mini-label">up next</p>
          {upNext.map((item, i) => (
            <p key={i} className="dtj-upnext-row"><ClockIcon /> {item.label} · {item.timeLabel}</p>
          ))}
        </div>
      )}

      <div className="dtj-mini-grid">
        <button type="button" className="dtj-mini-card-v2" onClick={() => setOpenCard(openCard === "hydration" ? null : "hydration")}>
          <span className="dtj-mini-icon-circle"><DropIcon /></span>
          <p className="dtj-mini-title-v2">HYDRATION</p>
          <p className="dtj-mini-value-v2">{water} / 8</p>
          <p className="dtj-mini-sub-v2">glasses</p>
          <div className="dtj-mini-dots">
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} className={`dtj-dot ${i < water ? "dtj-dot-filled" : ""}`} />
            ))}
          </div>
        </button>

        <button type="button" className="dtj-mini-card-v2" onClick={() => setOpenCard(openCard === "movement" ? null : "movement")}>
          <span className="dtj-mini-icon-circle"><ShoeIcon /></span>
          <p className="dtj-mini-title-v2">MOVEMENT</p>
          <p className="dtj-mini-value-v2">{steps ? steps.toLocaleString() : "—"}</p>
          <p className="dtj-mini-sub-v2">/ {(todayTracker?.stepsGoal ?? 8000).toLocaleString()} steps</p>
          <div className="dtj-mini-bar"><div className="dtj-mini-bar-fill" style={{ width: `${Math.min((steps / (todayTracker?.stepsGoal ?? 8000)) * 100, 100)}%` }} /></div>
        </button>

        <button type="button" className="dtj-mini-card-v2" onClick={() => setOpenCard(openCard === "sleep" ? null : "sleep")}>
          <span className="dtj-mini-icon-circle"><MoonIcon /></span>
          <p className="dtj-mini-title-v2">SLEEP</p>
          <p className="dtj-mini-value-v2">{sleepHours || "—"}h</p>
          <p className="dtj-mini-sub-v2">{sleepQuality || "not logged"}</p>
        </button>

        <button type="button" className="dtj-mini-card-v2" onClick={() => { const next = compressionWorn !== true; setCompressionWorn(next); save({ compressionWorn: next }); }}>
          <span className="dtj-mini-icon-circle"><GarmentIcon /></span>
          <p className="dtj-mini-title-v2">COMPRESSION</p>
          <p className="dtj-mini-value-v2">{compressionWorn === true ? "Yes" : compressionWorn === false ? "No" : "—"}</p>
          <p className="dtj-mini-sub-v2">{compressionWorn === true ? "✓ worn today" : "tap to log"}</p>
        </button>

        <button type="button" className="dtj-mini-card-v2" onClick={() => setOpenCard(openCard === "mood" ? null : "mood")}>
          <span className="dtj-mini-icon-circle"><SmileIcon /></span>
          <p className="dtj-mini-title-v2">MOOD</p>
          <p className="dtj-mini-value-v2">{MOOD_OPTIONS.find((m) => m.key === mood)?.label ?? "—"}</p>
          <p className="dtj-mini-sub-v2">how you're feeling</p>
        </button>

        <button type="button" className="dtj-mini-card-v2" onClick={() => { setOpenCard(openCard === "note" ? null : "note"); setNoteDraft(dailyNote ?? ""); }}>
          <span className="dtj-mini-icon-circle"><PencilIcon /></span>
          <p className="dtj-mini-title-v2">NOTES</p>
          <p className="dtj-mini-value-v2">{dailyNote ? "Added" : "Quick note"}</p>
          <p className="dtj-mini-sub-v2">{dailyNote ? "tap to edit" : "add today"}</p>
        </button>
      </div>

      {openCard === "hydration" && (
        <div className="dtj-editor">
          <div className="dtj-water-btn-row">
            <button type="button" className="dtj-round-btn" onClick={() => adjustWater(-1)}>–</button>
            <span className="dtj-editor-inline-label">{water} / 8 glasses</span>
            <button type="button" className="dtj-round-btn" onClick={() => adjustWater(1)}>+</button>
          </div>
        </div>
      )}

      {openCard === "movement" && (
        <div className="dtj-editor">
          <input
            type="number"
            value={steps || ""}
            onChange={(e) => setSteps(Number(e.target.value) || 0)}
            onBlur={() => save({ steps })}
            placeholder="Enter today's steps"
            className="dtj-editor-input"
            autoFocus
          />
        </div>
      )}

      {openCard === "sleep" && (
        <div className="dtj-editor">
          <input
            type="number"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
            onBlur={() => save({ sleepHours: sleepHours === "" ? null : Number(sleepHours) })}
            placeholder="Hours slept"
            className="dtj-editor-input"
            autoFocus
          />
          <div className="dtj-pill-row">
            {["Poor", "Fair", "Good", "Excellent"].map((q) => (
              <button
                key={q}
                type="button"
                className={`dtj-pill ${sleepQuality === q ? "dtj-pill-active" : ""}`}
                onClick={() => { setSleepQuality(q); save({ sleepQuality: q }); }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {openCard === "mood" && (
        <div className="dtj-editor">
          <div className="dtj-pill-row">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.key}
                type="button"
                className={`dtj-pill ${mood === m.key ? "dtj-pill-active" : ""}`}
                onClick={() => { setMood(m.key); save({ moodCheckIn: m.key }); setOpenCard(null); }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {openCard === "note" && (
        <div className="dtj-editor">
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Share your highlights, wins, or anything on your mind…"
            className="dtj-editor-textarea"
            rows={3}
            autoFocus
          />
          <button
            type="button"
            className="dtj-editor-save"
            onClick={() => { setDailyNote(noteDraft); save({ dailyNote: noteDraft }); setOpenCard(null); }}
          >
            Save
          </button>
        </div>
      )}

      {allDone && <p className="dtj-celebration">today is complete. ✦</p>}

      <p className="dtj-footer-tag">small steps. one system.<br />bodyshapersystem.com</p>
    </div>
  );
}
