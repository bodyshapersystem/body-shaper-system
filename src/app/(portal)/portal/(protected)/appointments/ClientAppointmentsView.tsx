"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestReschedule } from "./actions";
import { type AppointmentColorCategory } from "@/lib/appointment-categories";

type ClientEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  status: string;
  category: AppointmentColorCategory;
  locationType: "HOME" | "STUDIO";
  durationMinutes: number | null;
  technologies?: { name: string; number: number | null }[];
};

const TECH_THUMBS: Record<string, string> = {
  exilis: "/images/tech-thumbs/exilis.webp",
  endospheres: "/images/tech-thumbs/endospheres.webp",
  ems: "/images/tech-thumbs/ems.webp",
};
const techKeyOf = (n: string) => n.replace(/[™®]/g, "").replace(/elite/i, "").trim().toLowerCase();
const techLabel = (n: string) => n.replace(/[™®]/g, "").replace(/ Elite/i, "").trim();

type NextAppointmentDetail = {
  id: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
  durationMinutes: number | null;
  system: string | null;
  currentSessionNumber: number;
  totalSessions: number | null;
  locationType: "HOME" | "STUDIO";
  zone: string | null;
  arrivalWindowLabel: string;
  studioAddress: string | null;
  paymentStatus: "PAID" | "PENDING" | "PACKAGE";
  calendarUrl: string;
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default function ClientAppointmentsView({
  events,
  timezone,
  nextAppointment,
  completedCount,
  remaining,
  totalSessions,
  progressPercent,
  currentSystem,
}: {
  events: ClientEvent[];
  timezone: string;
  nextAppointment: NextAppointmentDetail | null;
  completedCount: number;
  remaining: number | null;
  totalSessions: number | null;
  progressPercent: number | null;
  currentSystem: string | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"list" | "week" | "month">("list");
  const [rescheduling, setRescheduling] = useState(false);
  const [note, setNote] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [requested, setRequested] = useState(false);

  function fmtDate(iso: string) {
    return new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short", month: "short", day: "numeric" }).format(new Date(iso));
  }
  function fmtTime(iso: string) {
    return new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
  }

  async function handleRequestReschedule() {
    if (!nextAppointment) return;
    setIsPending(true);
    const result = await requestReschedule(nextAppointment.id, note);
    setIsPending(false);
    if (result?.success) {
      setRequested(true);
      setRescheduling(false);
      router.refresh();
    }
  }

  const upcoming = events.filter((e) => new Date(e.startsAt) >= new Date() && e.status === "SCHEDULED");
  const past = events.filter((e) => !(new Date(e.startsAt) >= new Date() && e.status === "SCHEDULED"));

  return (
    <div className="cap-layout">
      <div className="cap-main">
        <div className="cap-view-tabs">
          <button type="button" className={`cap-view-tab ${tab === "week" ? "cap-view-tab-active" : ""}`} onClick={() => setTab("week")}>week</button>
          <button type="button" className={`cap-view-tab ${tab === "month" ? "cap-view-tab-active" : ""}`} onClick={() => setTab("month")}>month</button>
          <button type="button" className={`cap-view-tab ${tab === "list" ? "cap-view-tab-active" : ""}`} onClick={() => setTab("list")}>list</button>
        </div>

        {tab === "list" && (
          <div className="stl">
            <p className="stl-label">upcoming</p>
            {upcoming.length === 0 && <div className="stl-empty">No upcoming sessions yet — <Link href="/portal/dashboard">book your next one</Link>.</div>}
            {upcoming.map((e, i) => (
              <SessionItem key={e.id} e={e} timezone={timezone} upcoming index={i} />
            ))}
            {past.length > 0 && (
              <>
                <p className="stl-label stl-label-past">completed sessions · {past.filter((e) => e.status === "COMPLETED").length}</p>
                <div className="stl-timeline">
                  {[...past].reverse().map((e, i) => (
                    <SessionItem key={e.id} e={e} timezone={timezone} index={i} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab === "week" && <ClientWeekView events={upcoming} timezone={timezone} />}
        {tab === "month" && <ClientMonthView events={events} timezone={timezone} />}
      </div>

      <div className="cap-side">
        {nextAppointment ? (
          <div className="cap-next-card cap-next-card-marble">
            <p className="cap-next-eyebrow">next appointment</p>
            <h3 className="cap-next-title">{nextAppointment.title}</h3>
            <div className="cap-next-row"><span>Date</span><strong>{nextAppointment.dateLabel}</strong></div>
            <div className="cap-next-row"><span>Time</span><strong>{nextAppointment.timeLabel}</strong></div>
            {nextAppointment.durationMinutes && <div className="cap-next-row"><span>Duration</span><strong>{nextAppointment.durationMinutes} min</strong></div>}
            {nextAppointment.system && <div className="cap-next-row"><span>System</span><strong>{nextAppointment.system}</strong></div>}
            {nextAppointment.totalSessions !== null && (
              <div className="cap-next-row"><span>Session</span><strong>{nextAppointment.currentSessionNumber} of {nextAppointment.totalSessions}</strong></div>
            )}

            <div className="cap-next-divider" />

            {nextAppointment.locationType === "HOME" ? (
              <>
                <div className="cap-next-row"><span>Location</span><strong>🏡 At Your Home</strong></div>
                {nextAppointment.zone && <div className="cap-next-row"><span>Service Zone</span><strong>{nextAppointment.zone}</strong></div>}
                <div className="cap-next-row"><span>Arrival Window</span><strong>{nextAppointment.arrivalWindowLabel}</strong></div>
              </>
            ) : (
              <>
                <div className="cap-next-row"><span>Location</span><strong>🏢 Studio Location</strong></div>
                {nextAppointment.studioAddress && <div className="cap-next-row"><span>Address</span><strong>{nextAppointment.studioAddress}</strong></div>}
                <div className="cap-next-row"><span>Parking</span><strong>Available</strong></div>
              </>
            )}
            <Link href="/portal/appointments/preparation" className="cap-prep-link">View Instructions →</Link>

            <div className="cap-next-divider" />
            <div className="cap-next-row">
              <span>Payment Status</span>
              <strong>
                {nextAppointment.paymentStatus === "PACKAGE" ? "Package Session" : nextAppointment.paymentStatus === "PENDING" ? "Pending" : "Paid"}
              </strong>
            </div>

            <a href={nextAppointment.calendarUrl} target="_blank" rel="noopener noreferrer" className="cap-gcal-btn">
              ➕ Add to Google Calendar
            </a>

            {!requested ? (
              <>
                <button type="button" className="cap-primary-btn" onClick={() => setRescheduling((v) => !v)}>
                  Reschedule Appointment
                </button>
                {rescheduling && (
                  <div style={{ marginTop: 8 }}>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Optional: let your specialist know your preferred new time…"
                      rows={2}
                      className="sched-textarea"
                      style={{ marginBottom: 8 }}
                    />
                    <button type="button" className="cap-primary-btn" onClick={handleRequestReschedule} disabled={isPending}>
                      {isPending ? "Sending…" : "Send Request"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="pay-history-meta" style={{ marginTop: 10 }}>Your reschedule request has been sent to your specialist.</p>
            )}
            <Link href="/portal/messages" className="cap-secondary-btn">Contact Your Specialist</Link>

            <div className="cap-info-bar">
              {nextAppointment.locationType === "HOME" ? (
                <>🏡 At Your Home — We bring everything to you.</>
              ) : (
                <>🏢 Studio Location — Visit us at our Miami studio.</>
              )}
            </div>
          </div>
        ) : (
          <div className="cap-next-card cap-next-card-marble">
            <p className="cap-next-eyebrow">next appointment</p>
            <div className="module-empty">No upcoming appointment scheduled yet.</div>
          </div>
        )}

        <div className="cap-consistency-card">
          <p className="cap-consistency-title">Consistency is your results.</p>
          <div className="cap-next-row"><span>Completed Sessions</span><strong>{completedCount}</strong></div>
          <div className="cap-next-row"><span>Remaining Sessions</span><strong>{remaining ?? "—"}</strong></div>
          {currentSystem && <div className="cap-next-row"><span>Current System</span><strong>{currentSystem}</strong></div>}
          <div className="cap-next-row"><span>Progress</span><strong>{progressPercent !== null ? `${progressPercent}%` : "—"}</strong></div>
          <Link href="/portal/blueprint" className="cap-secondary-btn">View My Blueprint™</Link>
        </div>
      </div>
    </div>
  );
}

function ClientWeekView({ events, timezone }: { events: ClientEvent[]; timezone: string }) {
  const weekStart = startOfWeek(new Date());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  function dateKeyInZone(iso: string) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date(iso));
  }
  function timeInZone(iso: string) {
    return new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
  }

  return (
    <div className="cap-week-grid">
      {days.map((d, i) => {
        const key = d.toISOString().slice(0, 10);
        const dayEvents = events.filter((e) => dateKeyInZone(e.startsAt) === key);
        return (
          <div key={i} className="cap-week-col">
            <div className="cap-week-daylabel">{DAY_LABELS[i]} {d.getDate()}</div>
            {dayEvents.map((e) => (
              <div key={e.id} className={`cap-week-chip wk-event-${e.category}`}>
                {timeInZone(e.startsAt)} — {e.title}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function ClientMonthView({ events, timezone }: { events: ClientEvent[]; timezone: string }) {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const startWeekday = (monthStart.getDay() + 6) % 7;
  const gridStart = new Date(monthStart);
  gridStart.setDate(gridStart.getDate() - startWeekday);
  const gridDays = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  function dateKeyInZone(iso: string) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date(iso));
  }

  return (
    <div className="apt-month-grid">
      {DAY_LABELS.map((label) => (
        <div key={label} className="apt-month-headcell">{label}</div>
      ))}
      {gridDays.map((d, i) => {
        const key = d.toISOString().slice(0, 10);
        const dayEvents = events.filter((e) => dateKeyInZone(e.startsAt) === key);
        const inMonth = d.getMonth() === monthStart.getMonth();
        const isToday = d.toDateString() === today.toDateString();
        return (
          <div key={i} className={`apt-month-cell ${!inMonth ? "apt-month-cell-outside" : ""} ${isToday ? "apt-month-cell-today" : ""}`}>
            <span className="apt-month-daynum">{d.getDate()}</span>
            <div className="apt-month-chips">
              {dayEvents.map((e) => (
                <span key={e.id} className={`apt-month-chip wk-event-${e.category}`}>{e.title}</span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SessionItem({ e, timezone, upcoming = false, index }: { e: ClientEvent; timezone: string; upcoming?: boolean; index: number }) {
  const d = new Date(e.startsAt);
  const part = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { timeZone: timezone, ...o }).format(d);
  const techs = e.technologies ?? [];
  return (
    <article className={upcoming ? "stl-item stl-upcoming" : `stl-item stl-${e.status.toLowerCase()}`} style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}>
      <div className="stl-date">
        <span className="stl-wd">{part({ weekday: "short" })}</span>
        <strong>{part({ day: "numeric" })}</strong>
        <span className="stl-mo">{part({ month: "short" })}</span>
      </div>
      <div className="stl-body">
        {techs.length > 0 ? (
          <div className="stl-techs">
            {techs.map((t) => {
              const thumb = TECH_THUMBS[techKeyOf(t.name)];
              return (
                <span key={t.name} className="stl-tech">
                  {thumb ? <img src={thumb} alt="" /> : <span className="stl-tech-dot" />}
                  {techLabel(t.name)}
                  {t.number ? <b>#{t.number}</b> : null}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="stl-title">{e.title.replace(/^Session \d+ — /, "")}</p>
        )}
        <p className="stl-meta">
          {part({ hour: "numeric", minute: "2-digit" })} · {e.locationType === "HOME" ? "at your home" : "studio"}
          {upcoming || e.status === "COMPLETED" ? "" : ` · ${e.status.toLowerCase().replace("_", " ")}`}
        </p>
      </div>
      {!upcoming && e.status === "COMPLETED" && <span className="stl-check" aria-label="completed">✓</span>}
      {upcoming && <span className="stl-soon">booked</span>}
    </article>
  );
}
