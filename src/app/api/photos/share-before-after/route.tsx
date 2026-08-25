import { ImageResponse } from "next/og";
import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getClientPhotoSignedUrl } from "@/app/(portal)/portal/(protected)/photos/actions";
import { getMeasurementCallouts } from "@/lib/progress-photo-callouts";
import { loadOgFonts } from "@/lib/og-fonts";

export const dynamic = "force-dynamic";

const MEASUREMENT_KEYS = [
  "waistCm", "lowerAbdomenCm", "hipsCm", "rightThighCm", "leftThighCm",
  "rightArmCm", "leftArmCm", "chestCm", "neckCm", "shoulderCm",
] as const;

export async function GET(request: Request) {
  const { serif: serifFont, serifItalic: serifItalicFont, sans: sansFont } = await loadOgFonts();

  const client = await getCurrentPortalClient();
  if (!client) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const angle = (searchParams.get("angle") ?? "FRONT").toUpperCase();

  const photos = await prisma.photo.findMany({ where: { clientId: client.id, visibility: "CLIENT_VISIBLE" }, orderBy: { uploadedAt: "asc" } });
  if (photos.length === 0) return new Response("No photos", { status: 404 });

  const hasExplicitSessions = photos.every((p) => p.sessionNumber != null);
  const sessions: (typeof photos)[] = [];
  if (hasExplicitSessions) {
    const bySession = new Map<number, typeof photos>();
    for (const p of photos) {
      const n = p.sessionNumber as number;
      if (!bySession.has(n)) bySession.set(n, []);
      bySession.get(n)!.push(p);
    }
    for (const n of Array.from(bySession.keys()).sort((a, b) => a - b)) sessions.push(bySession.get(n)!);
  } else {
    for (let i = 0; i < photos.length; i += 4) sessions.push(photos.slice(i, i + 4));
  }

  const firstSession = sessions[0];
  const beforePhoto = firstSession?.find((p) => p.type === angle) ?? firstSession?.[0];
  let afterPhoto = null;
  for (let i = sessions.length - 1; i >= 0; i--) {
    const found = sessions[i].find((p) => p.type === angle);
    if (found) {
      afterPhoto = found;
      break;
    }
  }
  if (!beforePhoto || !afterPhoto) return new Response("Not enough photos yet", { status: 404 });

  const [beforeUrl, afterUrl] = await Promise.all([getClientPhotoSignedUrl(beforePhoto.id), getClientPhotoSignedUrl(afterPhoto.id)]);
  if (!beforeUrl || !afterUrl) return new Response("Could not load photos", { status: 500 });

  const bodyMeasurements = await prisma.bodyMeasurement.findMany({ where: { clientId: client.id }, orderBy: { measuredAt: "asc" } });
  const callouts =
    bodyMeasurements.length >= 2
      ? getMeasurementCallouts(
          Object.fromEntries(MEASUREMENT_KEYS.map((k) => [k, bodyMeasurements[0][k] as number | null])),
          Object.fromEntries(MEASUREMENT_KEYS.map((k) => [k, bodyMeasurements[bodyMeasurements.length - 1][k] as number | null])),
          2
        )
      : [];

  return new ImageResponse(
    (
      <div style={{ width: "1080px", height: "1920px", display: "flex", flexDirection: "column", background: "#F5EEE4", padding: "70px 60px", fontFamily: "Jost" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
          <span style={{ fontFamily: "Cormorant Garamond", fontStyle: "italic", fontSize: 30, color: "#2B2622" }}>body shaper system.</span>
        </div>
        <div style={{ display: "flex", gap: 20, flex: 1 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <img src={beforeUrl} width={480} height={640} style={{ objectFit: "cover", borderRadius: 16 }} />
            <span style={{ fontFamily: "Jost", fontSize: 20, color: "#8B7362", textAlign: "center", marginTop: 16, letterSpacing: 1 }}>BEFORE</span>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <img src={afterUrl} width={480} height={640} style={{ objectFit: "cover", borderRadius: 16 }} />
            <span style={{ fontFamily: "Jost", fontSize: 20, color: "#8B7362", textAlign: "center", marginTop: 16, letterSpacing: 1 }}>AFTER</span>
          </div>
        </div>
        {callouts.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 50, marginTop: 40 }}>
            {callouts.map((c) => (
              <div key={c.label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontFamily: "Jost", fontSize: 16, color: "#8B7362", textTransform: "uppercase", letterSpacing: 1.5 }}>{c.label}</span>
                <span style={{ fontFamily: "Cormorant Garamond", fontSize: 44, color: "#6B5240", marginTop: 6 }}>
                  {c.deltaCm > 0 ? "+" : ""}{c.deltaCm.toFixed(1)} cm
                </span>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
          <span style={{ fontFamily: "Jost", fontSize: 18, color: "#C79E93" }}>bodyshapersystem.com</span>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: [
        { name: "Cormorant Garamond", data: serifFont, weight: 500, style: "normal" },
        { name: "Cormorant Garamond", data: serifItalicFont, weight: 400, style: "italic" },
        { name: "Jost", data: sansFont, weight: 400, style: "normal" },
      ],
    }
  );
}
