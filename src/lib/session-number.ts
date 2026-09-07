import { prisma } from "@/lib/prisma";

/**
 * Real, smart next-session-number calculation. The naive version
 * (completed Appointment count + 1) undercounts whenever a real
 * session has photos and/or measurements on file but no matching
 * Appointment record — a real, confirmed gap (Andrea Trujillo's
 * Sessions 1-2 had photos from before the team started logging every
 * session as an Appointment). This checks every real source of a
 * session number for this client — completed/past-due Appointments,
 * Photo.sessionNumber, BodyMeasurement.sessionNumber, and Measurement
 * (RENPHO).sessionNumber — and returns one past the highest real
 * number found, so the suggested number is actually correct instead
 * of requiring a manual override most of the time.
 */
export async function getNextSessionNumber(clientId: string): Promise<number> {
  const [completedCount, latestPhoto, latestBodyMeasurement, latestRenpho] = await Promise.all([
    prisma.appointment.count({
      where: { clientId, OR: [{ status: "COMPLETED" }, { status: "SCHEDULED", startsAt: { lt: new Date() } }] },
    }),
    prisma.photo.findFirst({ where: { clientId, sessionNumber: { not: null } }, orderBy: { sessionNumber: "desc" }, select: { sessionNumber: true } }),
    prisma.bodyMeasurement.findFirst({ where: { clientId, sessionNumber: { not: null } }, orderBy: { sessionNumber: "desc" }, select: { sessionNumber: true } }),
    prisma.measurement.findFirst({ where: { clientId, sessionNumber: { not: null } }, orderBy: { sessionNumber: "desc" }, select: { sessionNumber: true } }),
  ]);

  const highestKnownSession = Math.max(
    completedCount,
    latestPhoto?.sessionNumber ?? 0,
    latestBodyMeasurement?.sessionNumber ?? 0,
    latestRenpho?.sessionNumber ?? 0
  );

  return highestKnownSession + 1;
}
