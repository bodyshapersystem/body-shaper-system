import { getPhotoSignedUrl } from "./blueprint-actions";
import PhotoDeleteButton from "./PhotoDeleteButton";

type PhotoRow = {
  id: string;
  storagePath: string;
  takenAt: Date | null;
  uploadedAt: Date;
  visibility: string;
};

const SLOT_LABELS: Record<string, string> = {
  FRONT: "Front",
  LEFT: "Left",
  RIGHT: "Right",
  BACK: "Back",
  DETAIL: "Detail",
};

export default async function PhotoGallery({
  photosByType,
  canManage,
}: {
  photosByType: { type: string; photos: PhotoRow[] }[];
  canManage: boolean;
}) {
  const tiles = await Promise.all(
    photosByType.map(async ({ type, photos }) => {
      const latest = photos[0];
      const url = latest ? await getPhotoSignedUrl(latest.storagePath) : null;
      return { type, latest, url };
    })
  );

  return (
    <div className="bp-photo-gallery">
      {tiles.map(({ type, latest, url }) => (
        <div key={type} className="bp-photo-tile">
          <div className="bp-photo-tile-frame">
            {url ? <img src={url} alt={SLOT_LABELS[type]} /> : <span className="bp-photo-tile-empty">+</span>}
          </div>
          <p className="bp-photo-tile-label">{SLOT_LABELS[type] ?? type}</p>
          {latest ? (
            <>
              <p className="pay-history-meta">
                {(latest.takenAt ?? latest.uploadedAt).toLocaleDateString()}
                {latest.visibility === "CLIENT_VISIBLE" ? " · Client Visible" : " · Internal Only"}
              </p>
              {canManage && <PhotoDeleteButton photoId={latest.id} />}
            </>
          ) : (
            <p className="pay-history-meta">Not captured yet</p>
          )}
        </div>
      ))}
    </div>
  );
}
