"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateAppointment, cancelAppointment, deleteAppointmentPermanently } from "./actions";
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
    if (!confirm("Cancel this appointment?")) return;
    startTransition(async () => {
      await cancelAppointment(event.id);
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
      await updateAppointment(event.id, { startsAt: new Date(newStart).toISOString() });
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
              <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                <input type="datetime-local" value={newStart} onChange={(e) => setNewStart(e.target.value)} className="sched-select" />
                <button type="button" className="sched-cta" onClick={handleReschedule} disabled={isPending || !newStart}>
                  Save
                </button>
              </div>
            )}
            <Link href={`/hub/clients/${event.clientId}?tab=messages`} className="apd-btn-secondary">
              message client
            </Link>
            <button type="button" className="apd-btn-secondary" onClick={handleComplete} disabled={isPending}>
              mark as completed
            </button>
            <button type="button" className="apd-btn-danger" onClick={handleCancel} disabled={isPending}>
              cancel appointment
            </button>
            <button type="button" className="apd-btn-danger" onClick={handleDelete} disabled={isPending}>
              delete permanently
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
