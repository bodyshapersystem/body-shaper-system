import { ImageResponse } from "next/og";
import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getPositiveCompositionChanges, getCompositionClosingPhrase } from "@/lib/progress-celebration";
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
  const measurementId = searchParams.get("measurementId");
  if (!measurementId) return new Response("Missing measurementId", { status: 400 });

  const latest = await prisma.measurement.findUnique({ where: { id: measurementId } });
  if (!latest || latest.clientId !== client.id) return new Response("Not found", { status: 404 });

  const previous = await prisma.measurement.findFirst({
    where: { clientId: client.id, scanDate: { lt: latest.scanDate } },
    orderBy: { scanDate: "desc" },
  });

  const assessment = await prisma.blueprintAssessment.findFirst({
    where: { clientId: client.id },
    orderBy: { version: "desc" },
    select: { treatmentInterests: true },
  });

  const changes = getPositiveCompositionChanges(latest, previous, assessment?.treatmentInterests ?? "", "lb");
  const closing = getCompositionClosingPhrase(changes);

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
          <span style={{ fontFamily: "Cormorant Garamond", fontSize: 68, color: "#F1EBE1" }}>Congratulations! ✧</span>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 60 }}>
          <span style={{ fontFamily: "Jost", fontSize: 24, color: "rgba(241,235,225,0.7)" }}>
            {changes.length} key marker{changes.length === 1 ? "" : "s"} improved since your last scan.
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          {changes.slice(0, 5).map((c) => (
            <div
              key={c.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 30,
                background: "rgba(241,235,225,0.05)",
                borderRadius: 20,
                padding: "28px 34px",
              }}
            >
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  background: "rgba(199,158,147,0.2)",
                  color: "#C79E93",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                }}
              >
                {c.direction === "up" ? "↑" : "↓"}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontFamily: "Cormorant Garamond", fontSize: 40, color: "#F1EBE1" }}>{c.label}</span>
                <span style={{ fontFamily: "Cormorant Garamond", fontStyle: "italic", fontSize: 26, color: "rgba(241,235,225,0.6)" }}>
                  {c.deltaText}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 26, color: "#C8A15A" }}>✦</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 50 }}>
          {closing.split("\n").map((line, i) => (
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
