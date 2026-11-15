import { NextRequest, NextResponse } from "next/server";
import { renphoConfigured, syncAllRenpho } from "@/lib/renpho";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Hourly: imports new RENPHO Health scans for every client linked to a
 * RENPHO profile (Client.renphoUserId). Skips quietly until RENPHO_EMAIL /
 * RENPHO_PASSWORD are set. Protected by CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!renphoConfigured()) return NextResponse.json({ ok: true, skipped: "RENPHO not configured" });
  try {
    const r = await syncAllRenpho();
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "sync failed" }, { status: 500 });
  }
}
