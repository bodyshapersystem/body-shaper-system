"use client";

import { useState } from "react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * A real month-grid date picker — prev/next month arrows, clickable
 * days — replacing the plain native <input type="date">. Modeled
 * after the friendlier calendar navigation in Visibook (per direction):
 * tap a day, move between months with arrows, no OS-native picker UI.
 */
export default function MiniCalendar({
  value,
  onChange,
}: {
  value: string; // "YYYY-MM-DD"
  onChange: (dateKey: string) => void;
}) {
  const selected = new Date(value + "T00:00:00");
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  function goPrevMonth() {
    const prev = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(prev.getFullYear());
    setViewMonth(prev.getMonth());
  }
  function goNextMonth() {
    const next = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  return (
    <div className="mini-cal">
      <div className="mini-cal-header">
        <button type="button" className="mini-cal-nav" onClick={goPrevMonth} aria-label="Previous month">
          ‹
        </button>
        <span className="mini-cal-title">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button type="button" className="mini-cal-nav" onClick={goNextMonth} aria-label="Next month">
          ›
        </button>
      </div>
      <div className="mini-cal-weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="mini-cal-grid">
        {cells.map((d, i) => {
          if (!d) return <span key={i} className="mini-cal-empty" />;
          const key = toDateKey(d);
          const isSelected = key === value;
          const isPast = d < today;
          const isToday = key === toDateKey(today);
          return (
            <button
              key={i}
              type="button"
              disabled={isPast}
              className={`mini-cal-day${isSelected ? " mini-cal-day-selected" : ""}${isToday ? " mini-cal-day-today" : ""}`}
              onClick={() => onChange(key)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
