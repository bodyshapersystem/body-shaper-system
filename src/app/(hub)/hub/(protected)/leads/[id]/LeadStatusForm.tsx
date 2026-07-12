"use client";

import { useTransition } from "react";
import { updateLeadStatus } from "../actions";
import type { LeadStatus } from "@prisma/client";

const STATUSES: { value: LeadStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "CONSULTATION_SCHEDULED", label: "Consultation Scheduled" },
  { value: "PAYMENT_PENDING", label: "Proposal Sent" },
  { value: "PAYMENT_CONFIRMED", label: "Deposit Received" },
  { value: "LOST", label: "Lost" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function LeadStatusForm({ leadId, currentStatus }: { leadId: string; currentStatus: LeadStatus }) {
  const [isPending, startTransition] = useTransition();

  function handleSelect(newStatus: LeadStatus) {
    startTransition(() => {
      updateLeadStatus(leadId, newStatus);
    });
  }

  return (
    <div>
      <p className="sched-label" style={{ marginBottom: 10 }}>
        Lead Status
      </p>
      <div className="sched-date-pills">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            disabled={isPending}
            className={currentStatus === s.value ? "sched-pill active" : "sched-pill"}
            onClick={() => handleSelect(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
