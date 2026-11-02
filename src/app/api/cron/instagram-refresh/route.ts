import { NextRequest, NextResponse } from "next/server";
import { refreshInstagramToken } from "@/lib/instagram";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await refreshInstagramToken());
}
