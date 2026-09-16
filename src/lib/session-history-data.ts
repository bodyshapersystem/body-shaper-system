import { prisma } from "@/lib/prisma";

/**
 * Real, shared Session History query — every logged session for a
 * client with its real technology/areas/objectives and frozen
 * Blueprint Alignment™ snapshot, most recent first. Used by both the
 * Hub (owner permission) and the client portal (portal client
 * session) so there is exactly one query, never two copies of this
 * data fetched differently in two places.
 *
 * Only counts appointments that actually happened (status COMPLETED).
 * Before this, the query only checked `technologies != null`, with no
 * status filter at all — so an appointment that had a session logged
 * against it and was LATER cancelled (technologies stays set;
 * cancelAppointment() only flips status to CANCELLED, it doesn't
 * clear technologies) still counted as a real session in every count
 * that reads this list (Session History's numbering, the portal's
 * "latest session" card, totalCount everywhere). Emmy caught this
 * directly: a cancelled appointment obviously didn't happen and must
 * never silently inflate a client's session count. CANCELLED and
 * NO_SHOW are both excluded from the real session list on the same
 * principle — neither one happened — while cancellationCount is
 * still surfaced separately (see below) so a client who cancels
 * repeatedly is still visible as a pattern, just never counted as
 * sessions themselves.
 */
export async function getSessionHistoryData(clientId: string) {
  const appointments = await prisma.appointment.findMany({
    where: { clientId },
    orderBy: { startsAt: "desc" },
  });
  const sessionsOnly = appointments.filter((a) => a.technologies != null && a.status === "COMPLETED");
  const cancellationCount = appointments.filter((a) => a.status === "CANCELLED").length;

  return {
    sessions: sessionsOnly.map((a) => ({
      id: a.id,
      startsAt: a.startsAt.toISOString(),
      status: a.status,
      technologies: a.technologies as { name: string; areas?: string[]; objectives?: string[] }[] | null,
      blueprintAlignment: a.blueprintAlignment as { matched: string[]; unmatched: string[] } | null,
      notes: a.notes,
    })),
    cancellationCount,
  };
}
