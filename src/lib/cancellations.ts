import type { Prisma } from "@prisma/client";

/**
 * A CANCELLED appointment counts against the client only when the client cancelled it (or the
 * owner sent the reschedule-limit notice). Reschedules (the old row of a moved appointment) and
 * changes made by Body Shaper never count.
 */
export const CLIENT_CANCELLATION_WHERE: Prisma.AppointmentWhereInput = {
  status: "CANCELLED",
  OR: [{ cancelReason: null }, { cancelReason: { notIn: ["RESCHEDULED", "BUSINESS"] } }],
  NOT: { notes: { contains: "[Rescheduled to " } },
};

export function isClientCancellation(a: { status: string; cancelReason?: string | null; notes?: string | null }) {
  if (a.status !== "CANCELLED") return false;
  if (a.cancelReason === "RESCHEDULED" || a.cancelReason === "BUSINESS") return false;
  if (a.notes?.includes("[Rescheduled to ")) return false;
  return true;
}
