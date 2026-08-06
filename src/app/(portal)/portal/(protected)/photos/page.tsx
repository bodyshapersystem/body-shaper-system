import { getCurrentPortalClient } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBusinessTimezone, formatDateInTimezone } from "@/lib/format-datetime";
import { getClientPhotoSignedUrl } from "./actions";

export const dynamic = "force-dynamic";

const SLOT_LABELS: Record<string, string> = {
  FRONT: "Front",
  LEFT: "Left",
  RIGHT: "Right",
  BACK: "Back",
  DETAIL: "Detail",
};

const SESSION_SIZE = 4;

export default async function ProgressPhotosPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const [photos, timezone] = await Promise.all([
    // Real sessions are groups of 4 photos in upload order — not by
    // calendar date. A client can shoot two full sessions (8 photos)
    // in the same sitting/day, and they still need to read as two
    // separate before/after sessions, never merged into one.
    prisma.photo.findMany({
      where: { clientId: client.id, visibility: "CLIENT_VISIBLE" },
      orderBy: { uploadedAt: "asc" },
    }),
    getBusinessTimezone(),
  ]);

  // Chunk into sequential groups of 4 — the current in-progress
  // session (if not yet a full 4) is always the last chunk.
  const sessions: (typeof photos)[] = [];
  for (let i = 0; i < photos.length; i += SESSION_SIZE) {
    sessions.push(photos.slice(i, i + SESSION_SIZE));
  }

  const sessionsWithUrls = await Promise.all(
    sessions.map(async (sessionPhotos, index) => {
      const withUrls = await Promise.all(
        sessionPhotos.map(async (photo) => ({
          photo,
          url: await getClientPhotoSignedUrl(photo.id),
        }))
      );
      const dateLabel = formatDateInTimezone(sessionPhotos[0].takenAt ?? sessionPhotos[0].uploadedAt, timezone, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return { sessionNumber: index + 1, dateLabel, photos: withUrls, isComplete: sessionPhotos.length === SESSION_SIZE };
    })
  );

  // Automatic "best" before/after: same angle (Front, preferred) from
  // the earliest session vs the latest session — never two different
  // angles compared against each other.
  const firstSession = sessionsWithUrls[0];
  const latestSession = sessionsWithUrls[sessionsWithUrls.length - 1];
  const pickAngle = (session: typeof firstSession) =>
    session?.photos.find((p) => p.photo.type === "FRONT") ?? session?.photos[0] ?? null;
  const beforePhoto = firstSession ? pickAngle(firstSession) : null;
  const afterPhoto = latestSession && latestSession !== firstSession ? pickAngle(latestSession) : null;

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Visual Proof of Progress</p>
        <h1>progress photos.</h1>
        <p className="portal-page-sub">Track your transformation with before &amp; after comparisons.</p>
      </div>

      {sessionsWithUrls.length === 0 ? (
        <div className="simple-card">
          <p className="dash-empty">No progress photos yet — your specialist will capture these during your sessions.</p>
        </div>
      ) : (
        <>
          {beforePhoto && afterPhoto && (
            <div className="simple-card" style={{ marginBottom: 20 }}>
              <h3>Latest Comparison</h3>
              <div className="pp-compare" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="pp-photo">
                  {beforePhoto.url ? (
                    <img src={beforePhoto.url} alt="Before" style={{ width: "100%", borderRadius: 12, display: "block" }} />
                  ) : (
                    <span>Image unavailable</span>
                  )}
                  <p className="pay-history-meta" style={{ marginTop: 6 }}>Before — {firstSession.dateLabel}</p>
                </div>
                <div className="pp-photo">
                  {afterPhoto.url ? (
                    <img src={afterPhoto.url} alt="After" style={{ width: "100%", borderRadius: 12, display: "block" }} />
                  ) : (
                    <span>Image unavailable</span>
                  )}
                  <p className="pay-history-meta" style={{ marginTop: 6 }}>After — {latestSession.dateLabel}</p>
                </div>
              </div>
            </div>
          )}

          {sessionsWithUrls.map(({ sessionNumber, dateLabel, photos: sessionPhotos, isComplete }) => (
            <div className="simple-card" key={sessionNumber} style={{ marginBottom: 20 }}>
              <h3>
                Session {sessionNumber} — {dateLabel}
                {!isComplete ? " (in progress)" : ""}
              </h3>
              <div className="pp-compare">
                {(["FRONT", "LEFT", "RIGHT", "BACK"] as const).map((slotType) => {
                  const found = sessionPhotos.find(({ photo }) => photo.type === slotType);
                  return (
                    <div className="pp-photo" key={slotType}>
                      {found?.url ? (
                        <img src={found.url} alt={SLOT_LABELS[slotType]} style={{ width: "100%", borderRadius: 12, display: "block" }} />
                      ) : (
                        <div
                          style={{
                            aspectRatio: "3/4",
                            background: "rgba(0,0,0,0.05)",
                            borderRadius: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#a89e8f",
                            fontSize: 12,
                          }}
                        >
                          Not yet taken
                        </div>
                      )}
                      <p className="pay-history-meta" style={{ marginTop: 6 }}>{SLOT_LABELS[slotType]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
