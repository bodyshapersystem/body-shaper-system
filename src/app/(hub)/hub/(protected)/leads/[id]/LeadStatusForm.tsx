"use client";

import { useTransition } from "react";
import { updateLeadStatus } from "../actions";
import type { LeadStatus } from "@prisma/client";

const STATUSES: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CONSULTATION_SCHEDULED",
  "PAYMENT_PENDING",
  "PAYMENT_CONFIRMED",
  "LOST",
  "ARCHIVED",
];

export default function LeadStatusForm({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: LeadStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as LeadStatus;
    startTransition(() => {
      updateLeadStatus(leadId, newStatus);
    });
  }

  return (
    <div>
      <label htmlFor="status" style={{ display: "block", fontSize: 11, opacity: 0.6, marginBottom: 6 }}>
        Status
      </label>
      <select id="status" defaultValue={currentStatus} onChange={handleChange} disabled={isPending} style={{ padding: 10 }}>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </div>
  );
}
