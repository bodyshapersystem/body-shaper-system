import { NextResponse } from "next/server";

// TEMPORARY — reveals the webhook secret so it can be pasted into
// Jotform's webhook URL config. Delete once configured.
export async function GET() {
  const secret = process.env.JOTFORM_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ present: false });
  return NextResponse.json({ present: true, value: secret });
}
