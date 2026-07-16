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
    <div className="bp-sheet-overlay" onClick={onClose}>
      <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bp-sheet-handle" />

        <div className="apd-header">
          <div className="cl-avatar" style={{ width: 52, height: 52, fontSize: 18 }}>
            {initials}
          </div>
          <div>
            <h3 className="apd-name">{event.clientName}</h3>
            <div className="apd-badges">
              <span className={`dash-status dash-status-${event.status.toLowerCase()}`}>{event.status}</span>
              {event.isVip && <span className="apd-badge">⭐ {event.tier}</span>}
              {event.isFirstAppt && <span className="apd-badge">📍 First Appointment</span>}
            </div>
          </div>
        </div>

        <div className="cl-summary-list" style={{ marginBottom: 20 }}>
          <div className="cl-summary-row"><span>Phone</span><span>{event.phone ?? "—"}</span></div>
          <div className="cl-summary-row"><span>Email</span><span>{event.email}</span></div>
          <div className="cl-summary-row"><span>Treatment</span><span>{event.title}</span></div>
          <div className="cl-summary-row"><span>Type</span><span>{CATEGORY_LABELS[event.category]}</span></div>
          {event.system && <div className="cl-summary-row"><span>Personalized System™</span><span>{event.system}</span></div>}
          <div className="cl-summary-row">
            <span>Date</span>
            <span>{startDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</span>
          </div>
          <div className="cl-summary-row"><span>Service Zone</span><span>{event.zone ? `📍 ${event.zone}` : "Not set"}</span></div>
          <div className="cl-summary-row">
            <span>Payment Status</span>
            <span>
              {event.paymentStatus === "PAID" ? "💳 Paid" : event.paymentStatus === "PENDING" ? "⚠️ Pending" : "—"}
            </span>
          </div>
          <div className="cl-summary-row">
            <span>Waiver</span>
            <span>{event.hasWaiver ? "Signed" : "📄 Missing"}</span>
          </div>
          {event.notes && <div className="cl-summary-row"><span>Notes</span><span>{event.notes}</span></div>}
        </div>

        {canManage && (
          <div className="apd-actions">
            <Link href={`/hub/clients/${event.clientId}?tab=messages`} className="dash-view-btn">
              Message Client
            </Link>
            <button type="button" className="dash-view-btn" onClick={handleComplete} disabled={isPending}>
              Mark as Completed
            </button>
            <button type="button" className="dash-view-btn" onClick={() => setRescheduling((v) => !v)}>
              Reschedule
            </button>
            {rescheduling && (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input type="datetime-local" value={newStart} onChange={(e) => setNewStart(e.target.value)} className="sched-select" />
                <button type="button" className="sched-cta" onClick={handleReschedule} disabled={isPending || !newStart}>
                  Save
                </button>
              </div>
            )}
            <Link href={`/hub/clients/${event.clientId}`} className="sched-cta" style={{ textAlign: "center" }}>
              Edit Appointment
            </Link>
            <button type="button" className="dash-view-btn" style={{ color: "#a33", borderColor: "rgba(163,51,51,0.3)" }} onClick={handleCancel} disabled={isPending}>
              Cancel Appointment
            </button>
            <button type="button" className="dash-view-btn" style={{ color: "#a33", borderColor: "rgba(163,51,51,0.3)" }} onClick={handleDelete} disabled={isPending}>
              Delete Permanently
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
