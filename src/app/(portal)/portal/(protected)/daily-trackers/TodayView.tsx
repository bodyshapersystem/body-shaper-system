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

  const last7 = days.slice(-7);
  const trendPoints = last7.map((d) => computeDailyCompletionPercent(d));
  const maxTrend = Math.max(...trendPoints, 1);

  return (
    <div className="dtj-today">
      <p className="dtj-greeting">
        {greeting()}, {firstName}. you're doing amazing. <span className="dtj-heart">♡</span>
      </p>

      <div className="dtj-hero-row">
        <div className="dtj-score-ring" style={{ background: `conic-gradient(#C79E93 ${recoveryScore * 3.6}deg, rgba(0,0,0,0.06) 0)` }}>
          <div className="dtj-score-ring-inner">
            <span className="dtj-score-sparkle">✦</span>
            <strong>{recoveryScore}%</strong>
            <span>recovery score™</span>
          </div>
        </div>
        <div className="dtj-streak-box">
          <p className="dtj-streak-line"><FlameIcon /> {streak} day streak</p>
          <p className="dtj-streak-line dtj-streak-count">{habitsDoneCount} / 7 completed</p>
          <p className="dtj-streak-sub">consistency is building</p>
        </div>
      </div>
      <p className="dtj-recovery-message">{recoveryMessage}</p>

      <div className="dtj-score-trend-card">
        <p className="dtj-mini-label">today's score</p>
        <div className="dtj-score-trend-row">
          <strong className="dtj-score-trend-num">{completionPercent}</strong>
          <svg viewBox="0 0 100 30" className="dtj-sparkline" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="#C79E93"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={trendPoints.map((v, i) => `${(i / Math.max(trendPoints.length - 1, 1)) * 100},${30 - (v / maxTrend) * 26}`).join(" ")}
            />
          </svg>
        </div>
        <p className="dtj-mini-sub">{completionPercent >= 70 ? "great progress!" : "keep building momentum."}</p>
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
        <button type="button" className="dtj-mini-card" onClick={() => setOpenCard(openCard === "hydration" ? null : "hydration")}>
          <span className="dtj-mini-icon"><DropIcon /></span>
          <p className="dtj-mini-title">Hydration</p>
          <p className="dtj-mini-value">{water} / 8</p>
          <p className="dtj-mini-sub-small">glasses</p>
          <div className="dtj-mini-dots">
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} className={`dtj-dot ${i < water ? "dtj-dot-filled" : ""}`} />
            ))}
          </div>
        </button>

        <button type="button" className="dtj-mini-card" onClick={() => setOpenCard(openCard === "movement" ? null : "movement")}>
          <span className="dtj-mini-icon"><ShoeIcon /></span>
          <p className="dtj-mini-title">Movement</p>
          <p className="dtj-mini-value">{steps ? steps.toLocaleString() : "—"}</p>
          <p className="dtj-mini-sub-small">/ {(todayTracker?.stepsGoal ?? 8000).toLocaleString()} steps</p>
          <div className="dtj-mini-bar"><div className="dtj-mini-bar-fill" style={{ width: `${Math.min((steps / (todayTracker?.stepsGoal ?? 8000)) * 100, 100)}%` }} /></div>
        </button>

        <button type="button" className="dtj-mini-card" onClick={() => setOpenCard(openCard === "sleep" ? null : "sleep")}>
          <span className="dtj-mini-icon"><MoonIcon /></span>
          <p className="dtj-mini-title">Sleep</p>
          <p className="dtj-mini-value">{sleepHours || "—"}h</p>
          <p className="dtj-mini-sub-small">{sleepQuality || "not logged"}</p>
        </button>

        <button type="button" className="dtj-mini-card" onClick={() => { const next = compressionWorn !== true; setCompressionWorn(next); save({ compressionWorn: next }); }}>
          <span className="dtj-mini-icon"><GarmentIcon /></span>
          <p className="dtj-mini-title">Compression</p>
          <p className="dtj-mini-value">{compressionWorn === true ? "Yes" : compressionWorn === false ? "No" : "—"}</p>
          <p className="dtj-mini-sub-small">{compressionWorn === true ? "worn today" : "tap to log"}</p>
        </button>

        <button type="button" className="dtj-mini-card" onClick={() => setOpenCard(openCard === "mood" ? null : "mood")}>
          <span className="dtj-mini-icon"><SmileIcon /></span>
          <p className="dtj-mini-title">Mood</p>
          <p className="dtj-mini-value">{MOOD_OPTIONS.find((m) => m.key === mood)?.label ?? "—"}</p>
          <p className="dtj-mini-sub-small">how you're feeling</p>
        </button>

        <button type="button" className="dtj-mini-card" onClick={() => { setOpenCard(openCard === "note" ? null : "note"); setNoteDraft(dailyNote ?? ""); }}>
          <span className="dtj-mini-icon"><PencilIcon /></span>
          <p className="dtj-mini-title">Notes</p>
          <p className="dtj-mini-value">{dailyNote ? "Added" : "Quick note"}</p>
          <p className="dtj-mini-sub-small">{dailyNote ? "tap to edit" : "add today"}</p>
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
