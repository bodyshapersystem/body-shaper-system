"use client";

import { useState, useEffect } from "react";
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
const HOURLY_SLOTS = Array.from({ length: 14 }, (_, i) => 8 + i); // 8:00–21:00, whole hours only (mobile / day view)

function fmtHour(h: number) {
  const hour = Math.floor(h);
  const min = h % 1 === 0 ? "00" : "30";
  const period = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${min} ${period}`;
}

function toDateParam(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function WeekCalendar({
  view,
  rangeStartIso,
  events,
  timezone,
  canManage,
  zones,
  therapists,
  currentFilters,
  distinctSystems,
}: {
  view: "day" | "week" | "month";
  rangeStartIso: string;
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
  const [isMobile, setIsMobile] = useState(false);
  const rangeStart = new Date(rangeStartIso);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 760);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const today = new Date();
  const isToday = (d: Date) => d.toDateString() === today.toDateString();

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

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/hub/appointments?${params.toString()}`);
  }

  function filterQuery() {
    const params = new URLSearchParams();
    if (currentFilters.zone) params.set("zone", currentFilters.zone);
    if (currentFilters.status) params.set("status", currentFilters.status);
    if (currentFilters.therapistId) params.set("therapistId", currentFilters.therapistId);
    if (currentFilters.system) params.set("system", currentFilters.system);
    return params.toString();
  }

  // ---------- Navigation targets, per view ----------
  let prevHref = "";
  let nextHref = "";
  let rangeLabel = "";
  const fq = filterQuery();
  const fqSuffix = fq ? `&${fq}` : "";

  if (view === "day") {
    const prev = new Date(rangeStart);
    prev.setDate(prev.getDate() - 1);
    const next = new Date(rangeStart);
    next.setDate(next.getDate() + 1);
    prevHref = `/hub/appointments?view=day&date=${toDateParam(prev)}${fqSuffix}`;
    nextHref = `/hub/appointments?view=day&date=${toDateParam(next)}${fqSuffix}`;
    rangeLabel = rangeStart.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  } else if (view === "month") {
    const prev = new Date(rangeStart.getFullYear(), rangeStart.getMonth() - 1, 1);
    const next = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 1, 1);
    prevHref = `/hub/appointments?view=month&month=${toDateParam(prev)}${fqSuffix}`;
    nextHref = `/hub/appointments?view=month&month=${toDateParam(next)}${fqSuffix}`;
    rangeLabel = rangeStart.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  } else {
    const prev = new Date(rangeStart);
    prev.setDate(prev.getDate() - 7);
    const next = new Date(rangeStart);
    next.setDate(next.getDate() + 7);
    const weekEnd = new Date(rangeStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    prevHref = `/hub/appointments?week=${toDateParam(prev)}${fqSuffix}`;
    nextHref = `/hub/appointments?week=${toDateParam(next)}${fqSuffix}`;
    rangeLabel = `${rangeStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
  }

  function viewTabHref(v: "day" | "week" | "month") {
    if (v === "day") return `/hub/appointments?view=day&date=${toDateParam(today)}${fqSuffix}`;
    if (v === "month") return `/hub/appointments?view=month&month=${toDateParam(today)}${fqSuffix}`;
    return `/hub/appointments${fq ? `?${fq}` : ""}`;
  }

  const toolbar = (
    <>
      <div className="apt-toolbar">
        <div className="apt-toolbar-left">
          <Link href={prevHref} className="apt-arrow-btn">‹</Link>
          <Link href={nextHref} className="apt-arrow-btn">›</Link>
          <span className="apt-date-range">{rangeLabel}</span>
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
          <Link href={viewTabHref("day")} className={`apt-view-tab ${view === "day" ? "apt-view-tab-active" : ""}`}>day</Link>
          <Link href={viewTabHref("week")} className={`apt-view-tab ${view === "week" ? "apt-view-tab-active" : ""}`}>week</Link>
          <Link href={viewTabHref("month")} className={`apt-view-tab ${view === "month" ? "apt-view-tab-active" : ""}`}>month</Link>
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
    </>
  );

  const legend = (
    <div className="wk-legend-bottom">
      <span><i className="wk-dot wk-dot-combined" /> combined systems</span>
      <span><i className="wk-dot wk-dot-individual" /> individual treatments</span>
      <span><i className="wk-dot wk-dot-consultation" /> evaluations / blueprint</span>
      <span><i className="wk-dot wk-dot-blocked" /> blocked / unavailable</span>
    </div>
  );

  const detailPanel = selected && (
    <AppointmentDetailPanel event={selected} canManage={canManage} onClose={() => setSelected(null)} />
  );

  // ---------- DAY VIEW ----------
  if (view === "day") {
    const dayKey = toDateParam(rangeStart);
    return (
      <div>
        {toolbar}
        <div className="wk-grid-wrap">
          <div className="apt-day-list">
            {HOURLY_SLOTS.map((h) => {
              const slotEvents = events.filter((e) => dateKeyInZone(e.startsAt) === dayKey && Math.floor(hourFractionInZone(e.startsAt)) === h);
              return (
                <div key={h} className="apt-day-row">
                  <div className="apt-day-row-label">{fmtHour(h)}</div>
                  <div className="apt-day-row-events">
                    {slotEvents.length === 0 && <span className="apt-day-row-empty">—</span>}
                    {slotEvents.map((e) => (
                      <button key={e.id} type="button" className={`apt-day-card wk-event-${e.category}`} onClick={() => setSelected(e)}>
                        <span className="wk-event-time">{timeInZone(e.startsAt)}</span>
                        <span className="wk-event-client">{e.firstName} {e.lastName[0]}.</span>
                        <span className="wk-event-treatment">{e.title}</span>
                        {e.zone && <span className="wk-event-zone">📍 {e.zone}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {legend}
        {detailPanel}
      </div>
    );
  }

  // ---------- MONTH VIEW ----------
  if (view === "month") {
    const monthStart = rangeStart;
    const firstGridDay = new Date(monthStart);
    const startWeekday = (firstGridDay.getDay() + 6) % 7; // Monday=0
    firstGridDay.setDate(firstGridDay.getDate() - startWeekday);
    const gridDays = Array.from({ length: 42 }, (_, i) => {
      const d = new Date(firstGridDay);
      d.setDate(d.getDate() + i);
      return d;
    });
    const inCurrentMonth = (d: Date) => d.getMonth() === monthStart.getMonth();

    return (
      <div>
        {toolbar}
        <div className="apt-month-grid">
          {DAY_LABELS.map((label) => (
            <div key={label} className="apt-month-headcell">{label}</div>
          ))}
          {gridDays.map((d, i) => {
            const key = toDateParam(d);
            const dayEvents = events.filter((e) => dateKeyInZone(e.startsAt) === key);
            return (
              <Link
                key={i}
                href={`/hub/appointments?view=day&date=${key}${fqSuffix}`}
                className={`apt-month-cell ${!inCurrentMonth(d) ? "apt-month-cell-outside" : ""} ${isToday(d) ? "apt-month-cell-today" : ""}`}
              >
                <span className="apt-month-daynum">{d.getDate()}</span>
                <div className="apt-month-chips">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span key={e.id} className={`apt-month-chip wk-event-${e.category}`}>
                      {timeInZone(e.startsAt)} {e.firstName}
                    </span>
                  ))}
                  {dayEvents.length > 3 && <span className="apt-month-more">+{dayEvents.length - 3} more</span>}
                </div>
              </Link>
            );
          })}
        </div>
        {legend}
      </div>
    );
  }

  // ---------- WEEK VIEW (default) ----------
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div>
      {toolbar}
      <div className="wk-grid-wrap">
        <div className={`wk-grid ${isMobile ? "wk-grid-mobile" : ""}`} style={{ gridTemplateColumns: `${isMobile ? "44px" : "56px"} repeat(7, 1fr)` }}>
          <div className="wk-corner" />
          {days.map((d, i) => (
            <div key={i} className={`wk-day-head ${isToday(d) ? "wk-day-head-today" : ""}`}>
              <span className="wk-day-label">{DAY_LABELS[i]}</span>
              <span className="wk-day-num">{d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
            </div>
          ))}

          {(isMobile ? HOURLY_SLOTS : SLOT_HOURS).map((h) => (
            <div key={`row-${h}`} className="wk-row-contents" style={{ display: "contents" }}>
              <div className="wk-hour-label">{isMobile || h % 1 === 0 ? fmtHour(h) : ""}</div>
              {days.map((d, i) => {
                const key = toDateParam(d);
                const slotEvents = events.filter((e) => {
                  if (dateKeyInZone(e.startsAt) !== key) return false;
                  const frac = hourFractionInZone(e.startsAt);
                  return isMobile ? Math.floor(frac) === h : Math.abs(frac - h) < 0.01;
                });
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
                        {!isMobile && <span className="wk-event-treatment">{e.title}</span>}
                        {!isMobile && e.zone && <span className="wk-event-zone">📍 {e.zone}</span>}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {legend}
      {detailPanel}
    </div>
  );
}
