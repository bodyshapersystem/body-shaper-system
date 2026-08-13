import { prisma } from "@/lib/prisma";
import { getPhotoSignedUrl } from "./blueprint-actions";
import PhotoDeleteButton from "./PhotoDeleteButton";

const SLOT_LABELS: Record<string, string> = {
  FRONT: "Front",
  LEFT: "Left",
  RIGHT: "Right",
  BACK: "Back",
  DETAIL: "Detail",
};

const SESSION_SIZE = 4;

/**
 * Full photo history grouped by session — every photo this client
 * has ever had captured, not just the latest per angle (that's what
 * PhotoGallery above this already shows). Same grouping rule as the
 * client portal's Progress Photos page: if every one of this
 * client's photos has an explicit sessionNumber set, group by that;
 * otherwise fall back to chunks of 4 in upload order.
 */
export default async function PhotoSessionHistory({ clientId }: { clientId: string }) {
  const photos = await prisma.photo.findMany({
    where: { clientId },
    orderBy: { uploadedAt: "asc" },
  });

  if (photos.length === 0) return null;

  const hasExplicitSessions = photos.every((p) => p.sessionNumber != null);
  const sessions: (typeof photos)[] = [];
  if (hasExplicitSessions) {
    const bySession = new Map<number, typeof photos>();
    for (const p of photos) {
      const n = p.sessionNumber as number;
      if (!bySession.has(n)) bySession.set(n, []);
      bySession.get(n)!.push(p);
    }
    for (const n of Array.from(bySession.keys()).sort((a, b) => a - b)) {
      sessions.push(bySession.get(n)!);
    }
  } else {
    for (let i = 0; i < photos.length; i += SESSION_SIZE) {
      sessions.push(photos.slice(i, i + SESSION_SIZE));
    }
  }

  const sessionsWithUrls = await Promise.all(
    sessions.map(async (sessionPhotos, i) => ({
      sessionNumber: hasExplicitSessions ? sessionPhotos[0].sessionNumber! : i + 1,
      dateLabel: (sessionPhotos[0].takenAt ?? sessionPhotos[0].uploadedAt).toLocaleDateString(),
      photos: await Promise.all(
        sessionPhotos.map(async (p) => ({ ...p, url: await getPhotoSignedUrl(p.storagePath) }))
      ),
    }))
  );

  return (
    <div style={{ marginTop: 28 }}>
      <p className="pay-history-meta" style={{ textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
        Full Photo History ({sessionsWithUrls.length} session{sessionsWithUrls.length === 1 ? "" : "s"})
      </p>
      {[...sessionsWithUrls].reverse().map(({ sessionNumber, dateLabel, photos: sessionPhotos }) => (
        <div key={sessionNumber} style={{ marginBottom: 20, padding: 14, background: "var(--ivory)", borderRadius: 8, border: "1px solid var(--line)" }}>
          <p style={{ fontFamily: "var(--serif)", fontSize: 15, marginBottom: 10 }}>
            Session {sessionNumber} — {dateLabel}
          </p>
          <div className="bp-photo-gallery">
            {sessionPhotos.map((p) => (
              <div key={p.id} className="bp-photo-tile">
                <div className="bp-photo-tile-frame">
                  {p.url ? <img src={p.url} alt={SLOT_LABELS[p.type] ?? p.type} /> : <span className="bp-photo-tile-empty">?</span>}
                </div>
                <p className="bp-photo-tile-label">{SLOT_LABELS[p.type] ?? p.type}</p>
                <p className="pay-history-meta">
                  {p.visibility === "CLIENT_VISIBLE" ? "Client Visible" : "Internal Only"}
                </p>
                <PhotoDeleteButton photoId={p.id} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
