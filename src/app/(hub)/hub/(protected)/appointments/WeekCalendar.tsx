"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORY_LABELS, type AppointmentColorCategory } from "@/lib/appointment-categories";
import AppointmentDetailPanel from "./AppointmentDetailPanel";

export type CalendarEvent = {
  id: string;
  clientId: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  status: string;
  category: AppointmentColorCategory;
  clientName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  zone: string | null;
  system: string | null;
  totalSessions: number | null;
  notes: string | null;
  paymentStatus: string | null;
  hasWaiver: boolean;
  isFirstAppt: boolean;
  isVip: boolean;
  tier: string;
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOT_HOURS = Array.from({ length: 27 }, (_, i) => 8 + i * 0.5).filter((h) => h <= 21); // 8:00–21:00, 30-min

function fmtHour(h: number) {
  const hour = Math.floor(h);
  const min = h % 1 === 0 ? "00" : "30";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${min} ${period}`;
}

export default function WeekCalendar({
  weekStartIso,
  events,
  timezone,
  canManage,
}: {
  weekStartIso: string;
  events: CalendarEvent[];
  timezone: string;
  canManage: boolean;
}) {
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const weekStart = new Date(weekStartIso);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const today = new Date();
  const isToday = (d: Date) => d.toDateString() === today.toDateString();

  function dateKey(d: Date) {
    return d.toISOString().slice(0, 10);
  }

  function timeInZone(iso: string) {
    return new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
  }

  function hourFractionInZone(iso: string) {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(
      new Date(iso)
    );
    const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    return h + m / 60;
  }

  function dateKeyInZone(iso: string) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date(iso)); // en-CA = YYYY-MM-DD
  }

  const prevWeek = new Date(weekStart);
  prevWeek.setDate(prevWeek.getDate() - 7);
  const nextWeek = new Date(weekStart);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return (
    <div>
      <div className="wk-toolbar">
        <div className="wk-nav">
          <Link href={`/hub/appointments?week=${prevWeek.toISOString().slice(0, 10)}`} className="wk-nav-btn">
            ←
          </Link>
          <span className="wk-nav-label">
            {days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – {days[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
          <Link href={`/hub/appointments?week=${nextWeek.toISOString().slice(0, 10)}`} className="wk-nav-btn">
            →
          </Link>
        </div>
        <div className="wk-legend">
          <span><i className="wk-dot wk-dot-combined" /> Combined System</span>
          <span><i className="wk-dot wk-dot-individual" /> Individual</span>
          <span><i className="wk-dot wk-dot-consultation" /> Consultation / Blueprint</span>
        </div>
      </div>

      <div className="wk-grid-wrap">
        <div className="wk-grid" style={{ gridTemplateColumns: `56px repeat(7, 1fr)` }}>
          <div className="wk-corner" />
          {days.map((d, i) => (
            <div key={i} className={`wk-day-head ${isToday(d) ? "wk-day-head-today" : ""}`}>
              <span className="wk-day-label">{DAY_LABELS[i]}</span>
              <span className="wk-day-num">{d.getDate()}</span>
            </div>
          ))}

          {SLOT_HOURS.map((h) => (
            <div key={`row-${h}`} className="wk-row-contents" style={{ display: "contents" }}>
              <div className="wk-hour-label">{h % 1 === 0 ? fmtHour(h) : ""}</div>
              {days.map((d, i) => {
                const key = dateKey(d);
                const slotEvents = events.filter((e) => dateKeyInZone(e.startsAt) === key && Math.abs(hourFractionInZone(e.startsAt) - h) < 0.01);
                return (
                  <div key={`${key}-${h}`} className={`wk-cell ${isToday(d) ? "wk-cell-today" : ""}`}>
                    {slotEvents.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        className={`wk-event wk-event-${e.category}`}
                        onClick={() => setSelected(e)}
                      >
                        <span className="wk-event-time">{timeInZone(e.startsAt)}</span>
                        <span className="wk-event-client">{e.firstName} {e.lastName[0]}.</span>
                        <span className="wk-event-treatment">{e.title}</span>
                        {e.zone && <span className="wk-event-zone">📍 {e.zone}</span>}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <AppointmentDetailPanel
          event={selected}
          canManage={canManage}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
