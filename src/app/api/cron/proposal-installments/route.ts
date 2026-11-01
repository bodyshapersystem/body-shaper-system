import { NextRequest, NextResponse } from "next/server";
import { chargeDueInstallments, proposalPaymentsStatus } from "@/lib/proposals/checkout";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Daily: charges client-proposal 2nd installments that are due on the day the
 * client chose. Protected by CRON_SECRET like the other crons.
 */
export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const gate = proposalPaymentsStatus();
  if (!gate.ok) return NextResponse.json({ skipped: gate.reason });
  const results = await chargeDueInstallments();
  return NextResponse.json({ ok: true, results });
}
