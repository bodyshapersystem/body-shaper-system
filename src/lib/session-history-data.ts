import { prisma } from "@/lib/prisma";

/**
 * Real, shared Session History query — every logged session for a
 * client with its real technology/areas/objectives and frozen
 * Blueprint Alignment™ snapshot, most recent first. Used by both the
 * Hub (owner permission) and the client portal (portal client
 * session) so there is exactly one query, never two copies of this
 * data fetched differently in two places.
 */
export async function getSessionHistoryData(clientId: string) {
  const appointments = await prisma.appointment.findMany({
    where: { clientId },
    orderBy: { startsAt: "desc" },
  });
  const sessionsOnly = appointments.filter((a) => a.technologies != null);

  return sessionsOnly.map((a) => ({
    id: a.id,
    startsAt: a.startsAt.toISOString(),
    status: a.status,
    technologies: a.technologies as { name: string; areas?: string[]; objectives?: string[] }[] | null,
    blueprintAlignment: a.blueprintAlignment as { matched: string[]; unmatched: string[] } | null,
    notes: a.notes,
  }));
}
