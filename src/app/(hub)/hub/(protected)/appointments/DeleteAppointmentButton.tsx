"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAppointmentPermanently } from "./actions";

export default function DeleteAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Permanently delete this appointment? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteAppointmentPermanently(appointmentId);
      router.refresh();
    });
  }

  return (
    <button type="button" className="sess-cancel-btn" style={{ color: "#a33" }} onClick={handleClick} disabled={isPending}>
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
