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

export default async function ProgressPhotosPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const [photos, timezone] = await Promise.all([
    prisma.photo.findMany({
      where: { clientId: client.id, visibility: "CLIENT_VISIBLE" },
      orderBy: { takenAt: "asc" },
    }),
    getBusinessTimezone(),
  ]);

  // Group by calendar date (the real session date), oldest session
  // first — so "before" always reads above "after", never mixed.
  const groups = new Map<string, typeof photos>();
  for (const photo of photos) {
    const date = photo.takenAt ?? photo.uploadedAt;
    const key = formatDateInTimezone(date, timezone, { year: "numeric", month: "long", day: "numeric" });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(photo);
  }

  const orderedGroups = Array.from(groups.entries());

  const groupsWithUrls = await Promise.all(
    orderedGroups.map(async ([dateLabel, groupPhotos]) => {
      const withUrls = await Promise.all(
        groupPhotos.map(async (photo) => ({
          photo,
          url: await getClientPhotoSignedUrl(photo.id),
        }))
      );
      return { dateLabel, note: groupPhotos[0]?.notes ?? null, photos: withUrls };
    })
  );

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Visual Proof of Progress</p>
        <h1>progress photos.</h1>
        <p className="portal-page-sub">Track your transformation with before &amp; after comparisons.</p>
      </div>

      {groupsWithUrls.length === 0 ? (
        <div className="simple-card">
          <p className="dash-empty">No progress photos yet — your specialist will capture these during your sessions.</p>
        </div>
      ) : (
        groupsWithUrls.map(({ dateLabel, note, photos: groupPhotos }) => (
          <div className="simple-card" key={dateLabel} style={{ marginBottom: 20 }}>
            <h3>
              {dateLabel}
              {note ? ` — ${note}` : ""}
            </h3>
            <div className="pp-compare">
              {groupPhotos.map(({ photo, url }) => (
                <div className="pp-photo" key={photo.id}>
                  {url ? (
                    <img src={url} alt={SLOT_LABELS[photo.type] ?? photo.type} style={{ width: "100%", borderRadius: 12, display: "block" }} />
                  ) : (
                    <span>Image unavailable</span>
                  )}
                  <p className="pay-history-meta" style={{ marginTop: 6 }}>{SLOT_LABELS[photo.type] ?? photo.type}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
