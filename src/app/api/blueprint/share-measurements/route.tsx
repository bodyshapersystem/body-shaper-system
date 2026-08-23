import { ImageResponse } from "next/og";
import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getPositiveMeasurementChanges, MEASUREMENTS_CLOSING_PHRASE } from "@/lib/progress-celebration";
import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

const serifFont = readFileSync(join(process.cwd(), "public/fonts/CormorantGaramond.ttf"));
const serifItalicFont = readFileSync(join(process.cwd(), "public/fonts/CormorantGaramond-Italic.ttf"));
const sansFont = readFileSync(join(process.cwd(), "public/fonts/Jost.ttf"));

export async function GET(request: Request) {
  const client = await getCurrentPortalClient();
  if (!client) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const bodyMeasurementId = searchParams.get("bodyMeasurementId");
  if (!bodyMeasurementId) return new Response("Missing bodyMeasurementId", { status: 400 });

  const latest = await prisma.bodyMeasurement.findUnique({ where: { id: bodyMeasurementId } });
  if (!latest || latest.clientId !== client.id) return new Response("Not found", { status: 404 });

  const previous = await prisma.bodyMeasurement.findFirst({
    where: { clientId: client.id, measuredAt: { lt: latest.measuredAt } },
    orderBy: { measuredAt: "desc" },
  });

  const changes = getPositiveMeasurementChanges(latest, previous, "cm");
  const topChanges = changes.slice(0, 5);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1920px",
          display: "flex",
          flexDirection: "column",
          background: "#1E1A16",
          color: "#F1EBE1",
          padding: "90px 70px",
          fontFamily: "Jost",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 50 }}>
          <span style={{ fontFamily: "Cormorant Garamond", fontStyle: "italic", fontSize: 34, color: "#F1EBE1" }}>body shaper system.</span>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 40, color: "#C79E93" }}>✦</span>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <span style={{ fontFamily: "Cormorant Garamond", fontSize: 60, color: "#F1EBE1" }}>CONGRATULATIONS! ✧</span>
        </div>

        <div style={{ display: "flex", justifyContent: "center", textAlign: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: "Jost", fontSize: 22, color: "rgba(241,235,225,0.7)" }}>
            Your measurements are moving in the right direction.
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 50 }}>
          <span style={{ fontFamily: "Jost", fontSize: 24, color: "#C8A15A" }}>
            {changes.length} measurement{changes.length === 1 ? "" : "s"} improved
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {topChanges.map((c) => (
            <div
              key={c.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(241,235,225,0.05)",
                borderRadius: 18,
                padding: "26px 34px",
              }}
            >
              <span style={{ fontFamily: "Jost", fontSize: 30, color: "rgba(241,235,225,0.7)", textTransform: "uppercase", letterSpacing: 2 }}>
                {c.label}
              </span>
              <span style={{ fontFamily: "Cormorant Garamond", fontSize: 42, color: "#F1EBE1" }}>{c.deltaText}</span>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 26, color: "#C8A15A" }}>✦</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 50 }}>
          {MEASUREMENTS_CLOSING_PHRASE.split("\n").map((line, i) => (
            <span key={i} style={{ fontFamily: "Cormorant Garamond", fontStyle: "italic", fontSize: 34, color: "#F1EBE1", textAlign: "center" }}>
              {line}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "Jost", fontSize: 20, color: "#C79E93" }}>www.bodyshapersystem.com</span>
          <span style={{ fontFamily: "Jost", fontSize: 20, color: "rgba(241,235,225,0.6)" }}>@bodyshapersystem</span>
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
