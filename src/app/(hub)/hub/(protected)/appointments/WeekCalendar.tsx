"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  durationMinutes: number | null;
  therapistName: string | null;
  currentSessionNumber: number;
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOT_HOURS = Array.from({ length: 27 }, (_, i) => 8 + i * 0.5).filter((h) => h <= 21); // 8:00–21:00, 30-min

function fmtHour(h: number) {
  const hour = Math.floor(h);
  const min = h % 1 === 0 ? "00" : "30";
  const period = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${min} ${period}`;
}

export default function WeekCalendar({
  weekStartIso,
  events,
  timezone,
  canManage,
  zones,
  therapists,
  currentFilters,
  distinctSystems,
}: {
  weekStartIso: string;
  events: CalendarEvent[];
  timezone: string;
  canManage: boolean;
  zones: string[];
  therapists: { id: string; fullName: string }[];
  currentFilters: { zone?: string; status?: string; therapistId?: string; system?: string };
  distinctSystems: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    return new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", minute: "2-digit" }).format(new Date(iso)).toLowerCase();
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
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date(iso));
  }

  const prevWeek = new Date(weekStart);
  prevWeek.setDate(prevWeek.getDate() - 7);
  const nextWeek = new Date(weekStart);
  nextWeek.setDate(nextWeek.getDate() + 7);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/hub/appointments?${params.toString()}`);
  }

  return (
    <div>
      <div className="apt-toolbar">
        <div className="apt-toolbar-left">
          <Link href={`/hub/appointments?week=${prevWeek.toISOString().slice(0, 10)}`} className="apt-arrow-btn">
            ‹
          </Link>
          <Link href={`/hub/appointments?week=${nextWeek.toISOString().slice(0, 10)}`} className="apt-arrow-btn">
            ›
          </Link>
          <span className="apt-date-range">
            {days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – {days[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
        <div className="apt-toolbar-filters">
          <select className="apt-filter-select" value={currentFilters.therapistId ?? ""} onChange={(e) => updateFilter("therapistId", e.target.value)}>
            <option value="">all therapists</option>
            {therapists.map((t) => (
              <option key={t.id} value={t.id}>{t.fullName}</option>
            ))}
          </select>
          <select className="apt-filter-select" value={currentFilters.system ?? ""} onChange={(e) => updateFilter("system", e.target.value)}>
            <option value="">all systems</option>
            {distinctSystems.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select className="apt-filter-select" value={currentFilters.status ?? ""} onChange={(e) => updateFilter("status", e.target.value)}>
            <option value="">all status</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No-Show</option>
          </select>
          <select className="apt-filter-select" value={currentFilters.zone ?? ""} onChange={(e) => updateFilter("zone", e.target.value)}>
            <option value="">all zones</option>
            {zones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
        <div className="apt-view-tabs">
          <button type="button" className="apt-view-tab" disabled title="Day view coming soon">day</button>
          <button type="button" className="apt-view-tab apt-view-tab-active">week</button>
          <button type="button" className="apt-view-tab" disabled title="Month view coming soon">month</button>
        </div>
      </div>

      <div className="apt-zone-row">
        <span className="apt-zone-label">zone filter:</span>
        <button type="button" className={`apt-zone-pill ${!currentFilters.zone ? "apt-zone-pill-active" : ""}`} onClick={() => updateFilter("zone", "")}>
          all
        </button>
        {zones.map((z) => (
          <button
            key={z}
            type="button"
            className={`apt-zone-pill ${currentFilters.zone === z ? "apt-zone-pill-active" : ""}`}
            onClick={() => updateFilter("zone", z)}
          >
            {z.toLowerCase()}
          </button>
        ))}
      </div>

      <div className="wk-grid-wrap">
        <div className="wk-grid" style={{ gridTemplateColumns: `56px repeat(7, 1fr)` }}>
          <div className="wk-corner" />
          {days.map((d, i) => (
            <div key={i} className={`wk-day-head ${isToday(d) ? "wk-day-head-today" : ""}`}>
              <span className="wk-day-label">{DAY_LABELS[i]}</span>
              <span className="wk-day-num">{d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
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

      <div className="wk-legend-bottom">
        <span><i className="wk-dot wk-dot-combined" /> combined systems</span>
        <span><i className="wk-dot wk-dot-individual" /> individual treatments</span>
        <span><i className="wk-dot wk-dot-consultation" /> evaluations / blueprint</span>
        <span><i className="wk-dot wk-dot-blocked" /> blocked / unavailable</span>
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
