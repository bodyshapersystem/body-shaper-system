"use client";

import { useState } from "react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type HistoryAppointment = {
  id: string;
  title: string;
  startsAt: string;
  status: string;
  technologies: { name: string; minutes: number; bodyArea?: string }[] | null;
};

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * Real mini-calendar of a specific client's actual appointment
 * history — every day with a real past appointment is marked, and
 * clicking a marked day shows exactly what was done that visit
 * (technologies, status), pulled straight from the Appointment
 * table. Never a placeholder/sample — if the client has no history
 * yet, the calendar shows no marks at all.
 */
export default function ClientAppointmentHistoryCalendar({ appointments }: { appointments: HistoryAppointment[] }) {
  const byDay = new Map<string, HistoryAppointment[]>();
  for (const a of appointments) {
    const key = toDateKey(new Date(a.startsAt));
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(a);
  }

  const mostRecent = appointments[0] ? new Date(appointments[0].startsAt) : new Date();
  const [viewYear, setViewYear] = useState(mostRecent.getFullYear());
  const [viewMonth, setViewMonth] = useState(mostRecent.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(appointments[0] ? toDateKey(new Date(appointments[0].startsAt)) : null);

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

  const selectedAppointments = selectedDay ? byDay.get(selectedDay) ?? [] : [];

  if (appointments.length === 0) {
    return <p className="pay-history-meta" style={{ marginTop: 10 }}>No past appointments on file yet for this client.</p>;
  }

  return (
    <div className="mini-cal" style={{ marginTop: 14 }}>
      <div className="mini-cal-header">
        <button type="button" className="mini-cal-nav" onClick={goPrevMonth} aria-label="Previous month">‹</button>
        <span className="mini-cal-title">{MONTHS[viewMonth]} {viewYear}</span>
        <button type="button" className="mini-cal-nav" onClick={goNextMonth} aria-label="Next month">›</button>
      </div>
      <div className="mini-cal-weekdays">
        {WEEKDAYS.map((w) => <span key={w}>{w}</span>)}
      </div>
      <div className="mini-cal-grid">
        {cells.map((d, i) => {
          if (!d) return <span key={i} className="mini-cal-empty" />;
          const key = toDateKey(d);
          const hasAppointment = byDay.has(key);
          const isSelected = key === selectedDay;
          const isToday = key === toDateKey(today);
          return (
            <button
              key={i}
              type="button"
              className={`mini-cal-day${isSelected ? " mini-cal-day-selected" : ""}${isToday ? " mini-cal-day-today" : ""}${hasAppointment ? " cah-day-marked" : ""}`}
              onClick={() => hasAppointment && setSelectedDay(key)}
              disabled={!hasAppointment}
            >
              {d.getDate()}
              {hasAppointment && <span className="cah-day-dot" />}
            </button>
          );
        })}
      </div>

      {selectedAppointments.length > 0 && (
        <div className="cah-day-detail">
          {selectedAppointments.map((a) => (
            <div key={a.id} className="cah-appt-row">
              <p className="cah-appt-title">{a.title}</p>
              <p className="pay-history-meta">
                {new Date(a.startsAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                {a.technologies && a.technologies.length > 0 ? ` · ${a.technologies.map((t) => t.name).join(", ")}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
