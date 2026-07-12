import { NextResponse } from "next/server";

// TEMPORARY diagnostic route — masked check only. Delete once confirmed.
export async function GET() {
  const key = process.env.JOTFORM_API_KEY;
  if (!key) return NextResponse.json({ present: false });

  return NextResponse.json({
    present: true,
    length: key.length,
    startsWith: key.slice(0, 4),
    endsWith: key.slice(-4),
    hasWhitespace: key !== key.trim(),
  });
}
