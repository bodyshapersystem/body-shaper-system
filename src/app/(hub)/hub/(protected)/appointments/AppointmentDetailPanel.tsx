"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateAppointment, cancelAppointment, deleteAppointmentPermanently, rescheduleAppointment, cancelForRescheduleLimit } from "./actions";
import { formatTechList } from "@/lib/tech-count";
import { zoneShort } from "@/lib/tech-zones";
import SessionDoneEditor from "@/components/hub/SessionDoneEditor";
import { CATEGORY_LABELS } from "@/lib/appointment-categories";
import type { CalendarEvent } from "./WeekCalendar";

export default function AppointmentDetailPanel({
  event,
  canManage,
  onClose,
}: {
  event: CalendarEvent;
  canManage: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rescheduling, setRescheduling] = useState(false);
  const [newStart, setNewStart] = useState("");
  const [requestedBy, setRequestedBy] = useState<"business" | "client">("business");
  const [cancelling, setCancelling] = useState(false);
  const [cancelledBy, setCancelledBy] = useState<"business" | "client">("business");
  const [limitOpen, setLimitOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [editingCounts, setEditingCounts] = useState(false);

  const clientReschedules = event.rescheduleCount ?? 0;
  const scheduled = event.status === "SCHEDULED";

  const initials = `${event.firstName[0]}${event.lastName[0] ?? ""}`.toUpperCase();
  const startDate = new Date(event.startsAt);
  const endDate = event.endsAt ? new Date(event.endsAt) : null;
  const timeRange = endDate
    ? `${startDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase()} – ${endDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase()}`
    : startDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase();

  function handleComplete() {
    startTransition(async () => {
      await updateAppointment(event.id, { status: "COMPLETED" });
      router.refresh();
      onClose();
    });
  }

  function handleCancel() {
    startTransition(async () => {
      await cancelAppointment(event.id, cancelledBy);
      router.refresh();
      onClose();
    });
  }

  function handleRescheduleLimit() {
    startTransition(async () => {
      const r = await cancelForRescheduleLimit(event.id);
      if ("error" in r && r.error) return setMessage(r.error);
      router.refresh();
      onClose();
    });
  }

  function handleDelete() {
    if (!confirm("Permanently delete this appointment? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteAppointmentPermanently(event.id);
      router.refresh();
      onClose();
    });
  }

  function handleReschedule() {
    if (!newStart) return;
    startTransition(async () => {
      await rescheduleAppointment(event.id, new Date(newStart).toISOString(), requestedBy);
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="apd-overlay" onClick={onClose}>
      <div className="apd-panel apd-panel-marble" onClick={(e) => e.stopPropagation()}>
        <div className="apd-time-row">
          <span className="apd-time-range">{timeRange}</span>
          <button type="button" className="apd-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="apd-header">
          <div className="cl-avatar" style={{ width: 56, height: 56, fontSize: 18 }}>
            {initials}
          </div>
          <div>
            <div className="apd-name-row">
              <h3 className="apd-name">{event.clientName}</h3>
              <span className={`apd-status-pill apd-status-${event.status.toLowerCase()}`}>{event.status.toLowerCase()}</span>
            </div>
            <p className="apd-contact-line">{event.phone ?? "—"}</p>
            <p className="apd-contact-line">{event.email}</p>
          </div>
        </div>

        <div className="apd-detail-list">
          <div className="apd-detail-row"><span>system / treatment</span><strong>{event.title}</strong></div>
          <div className="apd-detail-row"><span>appointment type</span><strong>Mobile Appointment</strong></div>
          {event.technologies && event.technologies.length > 0 && (
            <div className="apd-detail-row">
              <span>technologies</span>
              <strong>
                {event.technologies.map((t) => `${formatTechList([t])}${t.zone ? ` · ${zoneShort(t.name, t.zone)}` : ""}`).join(" + ")}
                {canManage && (
                  <button type="button" className="apd-inline-link" onClick={() => setEditingCounts((v) => !v)} style={{ marginLeft: 8, background: "none", border: 0, textDecoration: "underline", cursor: "pointer", color: "inherit", font: "inherit", opacity: 0.7 }}>
                    edit what was done
                  </button>
                )}
              </strong>
            </div>
          )}
          {editingCounts && (
            <div className="apd-choice">
              <SessionDoneEditor appointmentId={event.id} initial={event.technologies ?? []} status={event.status} compact onDone={() => setEditingCounts(false)} />
            </div>
          )}
          {event.totalSessions !== null && (
            <div className="apd-detail-row"><span>session</span><strong>{event.currentSessionNumber} of {event.totalSessions}</strong></div>
          )}
          {event.durationMinutes && (
            <div className="apd-detail-row"><span>duration</span><strong>{event.durationMinutes} min</strong></div>
          )}
          <div className="apd-detail-row"><span>date</span><strong>{startDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</strong></div>
          <div className="apd-detail-row"><span>time</span><strong>{timeRange}</strong></div>
          <div className="apd-detail-row"><span>service zone</span><strong>{event.zone ?? "Not set"}</strong></div>
          <div className="apd-detail-row">
            <span>payment status</span>
            <strong className={event.paymentStatus === "PAID" ? "apd-paid" : event.paymentStatus === "PENDING" ? "apd-pending" : ""}>
              {event.paymentStatus === "PAID" ? "Paid" : event.paymentStatus === "PENDING" ? "Pending" : "—"}
            </strong>
          </div>
          {event.therapistName && <div className="apd-detail-row"><span>therapist</span><strong>{event.therapistName}</strong></div>}
          {event.notes && <div className="apd-detail-row apd-detail-row-notes"><span>notes</span><strong>{event.notes}</strong></div>}
        </div>

        {canManage && (
          <div className="apd-actions">
            <Link href={`/hub/clients/${event.clientId}`} className="apd-btn-primary">
              edit appointment
            </Link>
            <button type="button" className="apd-btn-secondary" onClick={() => setRescheduling((v) => !v)}>
              reschedule
            </button>
            {rescheduling && (
              <div className="apd-choice">
                <input type="datetime-local" value={newStart} onChange={(e) => setNewStart(e.target.value)} className="sched-select" />
                <p className="apd-choice-q">who asked for this change?</p>
                <label><input type="radio" checked={requestedBy === "business"} onChange={() => setRequestedBy("business")} /> me / Body Shaper — doesn&apos;t count for the client</label>
                <label><input type="radio" checked={requestedBy === "client"} onChange={() => setRequestedBy("client")} /> the client — counts as a client reschedule ({clientReschedules + 1} of 2)</label>
                {requestedBy === "client" && clientReschedules >= 2 && (
                  <p className="apd-choice-warn">This client already rescheduled this session {clientReschedules} times. You can still move it, or use “send reschedule-limit cancellation” below.</p>
                )}
                <button type="button" className="sched-cta" onClick={handleReschedule} disabled={isPending || !newStart}>
                  Save new time
                </button>
              </div>
            )}
            <Link href={`/hub/clients/${event.clientId}?tab=messages`} className="apd-btn-secondary">
              message client
            </Link>
            <button type="button" className="apd-btn-secondary" onClick={handleComplete} disabled={isPending}>
              mark as completed
            </button>
            {scheduled && (
              <button type="button" className="apd-btn-danger" onClick={() => setCancelling((v) => !v)} disabled={isPending}>
                cancel appointment
              </button>
            )}
            {cancelling && (
              <div className="apd-choice">
                <p className="apd-choice-q">who is cancelling?</p>
                <label><input type="radio" checked={cancelledBy === "business"} onChange={() => setCancelledBy("business")} /> me / Body Shaper — doesn&apos;t count, session not lost</label>
                <label><input type="radio" checked={cancelledBy === "client"} onChange={() => setCancelledBy("client")} /> the client — cancellation policy applies (first one is forgiven)</label>
                <button type="button" className="sched-cta" onClick={handleCancel} disabled={isPending}>
                  Confirm cancellation
                </button>
              </div>
            )}
            {scheduled && (
              <button type="button" className="apd-btn-danger" onClick={() => setLimitOpen((v) => !v)} disabled={isPending}>
                send reschedule-limit cancellation
              </button>
            )}
            {limitOpen && (
              <div className="apd-choice">
                <p className="apd-choice-q">client reschedules on this session: {clientReschedules}</p>
                <p>This cancels the appointment, marks the session as used, and emails {event.firstName} this message from Body Shaper System™:</p>
                <blockquote className="apd-choice-quote">
                  As outlined in our Appointment Policies, each session may be rescheduled up to two times. After {Math.max(clientReschedules + 1, 3)} reschedule attempts, your {event.title} session originally scheduled for{" "}
                  {startDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} has been cancelled and is considered used. If you have any questions, simply reply to this email or message us through your Client Portal.
                </blockquote>
                {message && <p className="apd-choice-warn">{message}</p>}
                <button type="button" className="sched-cta" onClick={handleRescheduleLimit} disabled={isPending}>
                  {isPending ? "Sending…" : "Cancel & send to client"}
                </button>
              </div>
            )}
            <button type="button" className="apd-btn-danger" onClick={handleDelete} disabled={isPending}>
              delete permanently
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
