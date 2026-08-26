import { prisma } from "@/lib/prisma";
import { getBusinessTimezone, formatDateInTimezone } from "@/lib/format-datetime";
import { getFinalComparisonPair } from "@/lib/progress-photo-callouts";
import { getPositiveMeasurementChanges } from "@/lib/progress-celebration";

const MEASUREMENT_KEYS = [
  "waistCm", "lowerAbdomenCm", "hipsCm", "rightThighCm", "leftThighCm",
  "rightArmCm", "leftArmCm", "chestCm", "neckCm", "shoulderCm",
] as const;

const SESSION_SIZE = 4;

function dayKey(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(date);
}

/**
 * Real, shared data assembly for Progress Photos™ — used by both the
 * client-facing portal page and the Hub's read-only preview, so the
 * Hub always sees exactly the same real sessions/comparisons/callouts
 * a client would see, computed the same way in one place.
 */
export async function getProgressPhotosData(
  clientId: string,
  resolvePhotoUrl: (photoId: string) => Promise<string | null>,
  options?: { includeCelebration?: boolean; lastCelebratedPhotoSessionNumber?: number | null }
) {
  const [photos, bodyMeasurements, timezone] = await Promise.all([
    prisma.photo.findMany({
      where: { clientId, visibility: "CLIENT_VISIBLE" },
      orderBy: { uploadedAt: "asc" },
    }),
    prisma.bodyMeasurement.findMany({ where: { clientId }, orderBy: { measuredAt: "asc" } }),
    getBusinessTimezone(),
  ]);

  const hasExplicitSessions = photos.length > 0 && photos.every((p) => p.sessionNumber != null);
  const sessionGroups: (typeof photos)[] = [];
  if (hasExplicitSessions) {
    const bySession = new Map<number, typeof photos>();
    for (const p of photos) {
      const n = p.sessionNumber as number;
      if (!bySession.has(n)) bySession.set(n, []);
      bySession.get(n)!.push(p);
    }
    for (const n of Array.from(bySession.keys()).sort((a, b) => a - b)) {
      sessionGroups.push(bySession.get(n)!);
    }
  } else {
    for (let i = 0; i < photos.length; i += SESSION_SIZE) {
      sessionGroups.push(photos.slice(i, i + SESSION_SIZE));
    }
  }

  const sessions = await Promise.all(
    sessionGroups.map(async (sessionPhotos, index) => {
      const withUrls = await Promise.all(
        sessionPhotos.map(async (photo) => ({
          photo: { id: photo.id, type: photo.type },
          url: await resolvePhotoUrl(photo.id),
        }))
      );
      const refDate = sessionPhotos[0].takenAt ?? sessionPhotos[0].uploadedAt;
      const dateLabel = formatDateInTimezone(refDate, timezone, { year: "numeric", month: "long", day: "numeric" });
      const sessionDayKey = dayKey(refDate, timezone);
      const matched = bodyMeasurements.find((m) => dayKey(m.measuredAt, timezone) === sessionDayKey) ?? null;
      const measurements = matched
        ? Object.fromEntries(MEASUREMENT_KEYS.map((k) => [k, matched[k] as number | null]))
        : null;
      return {
        sessionNumber: index + 1,
        dateLabel,
        photos: withUrls,
        isComplete: sessionPhotos.length === SESSION_SIZE,
        measurements,
      };
    })
  );

  const firstMeasurement = bodyMeasurements.length > 0 ? bodyMeasurements[0] : null;
  const latestMeasurement = bodyMeasurements.length > 0 ? bodyMeasurements[bodyMeasurements.length - 1] : null;
  const finalCallouts =
    firstMeasurement && latestMeasurement && firstMeasurement !== latestMeasurement
      ? getFinalComparisonPair(
          Object.fromEntries(MEASUREMENT_KEYS.map((k) => [k, firstMeasurement[k] as number | null])),
          Object.fromEntries(MEASUREMENT_KEYS.map((k) => [k, latestMeasurement[k] as number | null]))
        )
      : [];

  const latestSessionNumber = sessions.length > 0 ? sessions[sessions.length - 1].sessionNumber : null;

  let celebration: { sessionNumber: number; changes: ReturnType<typeof getPositiveMeasurementChanges> } | null = null;
  if (options?.includeCelebration) {
    const previousMeasured = bodyMeasurements.length >= 2 ? bodyMeasurements[bodyMeasurements.length - 2] : null;
    const latestMeasured = bodyMeasurements.length >= 1 ? bodyMeasurements[bodyMeasurements.length - 1] : null;
    const positiveChanges = previousMeasured && latestMeasured ? getPositiveMeasurementChanges(latestMeasured, previousMeasured, "cm") : [];
    const shouldCelebrate =
      latestSessionNumber != null &&
      options.lastCelebratedPhotoSessionNumber !== latestSessionNumber &&
      positiveChanges.length > 0;
    celebration = shouldCelebrate ? { sessionNumber: latestSessionNumber!, changes: positiveChanges } : null;
  }

  return {
    sessions,
    firstSessionNumber: sessions.length > 0 ? sessions[0].sessionNumber : null,
    latestSessionNumber,
    finalCallouts,
    celebration,
  };
}
