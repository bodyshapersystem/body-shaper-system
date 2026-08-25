import { getCurrentPortalClient } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBusinessTimezone, formatDateInTimezone } from "@/lib/format-datetime";
import { getClientPhotoSignedUrl } from "./actions";
import { getMeasurementCallouts } from "@/lib/progress-photo-callouts";
import { getPositiveMeasurementChanges } from "@/lib/progress-celebration";
import ProgressPhotosView from "./ProgressPhotosView";

export const dynamic = "force-dynamic";

const MEASUREMENT_KEYS = [
  "waistCm", "lowerAbdomenCm", "hipsCm", "rightThighCm", "leftThighCm",
  "rightArmCm", "leftArmCm", "chestCm", "neckCm", "shoulderCm",
] as const;

function dayKey(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(date);
}

const SESSION_SIZE = 4;

export default async function ProgressPhotosPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const [photos, bodyMeasurements, timezone] = await Promise.all([
    prisma.photo.findMany({
      where: { clientId: client.id, visibility: "CLIENT_VISIBLE" },
      orderBy: { uploadedAt: "asc" },
    }),
    prisma.bodyMeasurement.findMany({ where: { clientId: client.id }, orderBy: { measuredAt: "asc" } }),
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
          url: await getClientPhotoSignedUrl(photo.id),
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
        rawMeasurement: matched,
      };
    })
  );

  const firstMeasurement = bodyMeasurements.length > 0 ? bodyMeasurements[0] : null;
  const latestMeasurement = bodyMeasurements.length > 0 ? bodyMeasurements[bodyMeasurements.length - 1] : null;
  const finalCallouts =
    firstMeasurement && latestMeasurement && firstMeasurement !== latestMeasurement
      ? getMeasurementCallouts(
          Object.fromEntries(MEASUREMENT_KEYS.map((k) => [k, firstMeasurement[k] as number | null])),
          Object.fromEntries(MEASUREMENT_KEYS.map((k) => [k, latestMeasurement[k] as number | null])),
          3
        )
      : [];

  // Real Congratulations trigger — only when a NEW session exists
  // (never already shown) AND there's confirmed positive progress
  // (real measurement improvement between the two most recent
  // measured sessions), matching the mandatory "confirmed progress,
  // not just an upload" rule.
  const latestSessionNumber = sessions.length > 0 ? sessions[sessions.length - 1].sessionNumber : null;
  const previousMeasured = bodyMeasurements.length >= 2 ? bodyMeasurements[bodyMeasurements.length - 2] : null;
  const latestMeasured = bodyMeasurements.length >= 1 ? bodyMeasurements[bodyMeasurements.length - 1] : null;
  const positiveChanges = previousMeasured && latestMeasured ? getPositiveMeasurementChanges(latestMeasured, previousMeasured, "cm") : [];
  const shouldCelebrate =
    latestSessionNumber != null &&
    client.lastCelebratedPhotoSessionNumber !== latestSessionNumber &&
    positiveChanges.length > 0;

  return (
    <div className="cat-body portal-page">
      <ProgressPhotosView
        sessions={sessions.map(({ rawMeasurement, ...s }) => s)}
        firstSessionNumber={sessions.length > 0 ? sessions[0].sessionNumber : null}
        latestSessionNumber={latestSessionNumber}
        finalCallouts={finalCallouts}
        celebration={
          shouldCelebrate
            ? {
                sessionNumber: latestSessionNumber!,
                changes: positiveChanges,
              }
            : null
        }
      />
    </div>
  );
}
