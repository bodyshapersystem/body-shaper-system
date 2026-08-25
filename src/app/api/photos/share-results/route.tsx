import { ImageResponse } from "next/og";
import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getMeasurementCallouts } from "@/lib/progress-photo-callouts";
import { loadOgFontsNode } from "@/lib/og-fonts";
import { sparkleSvg } from "@/lib/og-sparkle";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // fetch(file://) is never supported here; fs.readFileSync is the real fix

const MEASUREMENT_KEYS = [
  "waistCm", "lowerAbdomenCm", "hipsCm", "rightThighCm", "leftThighCm",
  "rightArmCm", "leftArmCm", "chestCm", "neckCm", "shoulderCm",
] as const;

export async function GET() {
  const { serif: serifFont, serifItalic: serifItalicFont, sans: sansFont } = loadOgFontsNode();

  const client = await getCurrentPortalClient();
  if (!client) return new Response("Unauthorized", { status: 401 });

  const bodyMeasurements = await prisma.bodyMeasurement.findMany({ where: { clientId: client.id }, orderBy: { measuredAt: "asc" } });
  if (bodyMeasurements.length < 2) return new Response("Not enough measurements yet", { status: 404 });

  const callouts = getMeasurementCallouts(
    Object.fromEntries(MEASUREMENT_KEYS.map((k) => [k, bodyMeasurements[0][k] as number | null])),
    Object.fromEntries(MEASUREMENT_KEYS.map((k) => [k, bodyMeasurements[bodyMeasurements.length - 1][k] as number | null])),
    6
  );

  return new ImageResponse(
    (
      <div style={{ width: "1080px", height: "1920px", display: "flex", flexDirection: "column", background: "#F5EEE4", padding: "100px 80px", fontFamily: "Jost" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 50 }}>
          <span style={{ fontFamily: "Cormorant Garamond", fontStyle: "italic", fontSize: 32, color: "#2B2622" }}>body shaper system.</span>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <img src={sparkleSvg(40, "#C8A15A")} width={40} height={40} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <span style={{ fontFamily: "Cormorant Garamond", fontSize: 66, color: "#2B2622" }}>Congratulations!</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", textAlign: "center", marginBottom: 60 }}>
          <span style={{ fontFamily: "Jost", fontSize: 22, color: "rgba(43,38,34,0.65)" }}>
            The commitment, care, and teamwork behind your journey are showing.
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {callouts.map((c) => (
            <div
              key={c.label}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(199,158,147,0.08)", borderRadius: 18, padding: "26px 34px", border: "1px solid rgba(200,161,90,0.25)" }}
            >
              <span style={{ fontFamily: "Jost", fontSize: 26, color: "#6B5240", textTransform: "uppercase", letterSpacing: 1.5 }}>{c.label}</span>
              <span style={{ fontFamily: "Cormorant Garamond", fontSize: 40, color: "#2B2622" }}>
                {c.deltaCm > 0 ? "+" : ""}{c.deltaCm.toFixed(1)} cm
              </span>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "Jost", fontSize: 20, color: "#C79E93" }}>www.bodyshapersystem.com</span>
          <span style={{ fontFamily: "Jost", fontSize: 18, color: "rgba(43,38,34,0.5)" }}>@bodyshapersystem</span>
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
