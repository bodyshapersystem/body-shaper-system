import { NextResponse } from "next/server";

// TEMPORARY diagnostic route — reveals only masked info about
// RESEND_API_KEY (length, first/last few chars, whitespace/quote
// detection) to debug the "API key is invalid" error without
// exposing the secret. Delete once diagnosed.

export async function GET() {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    return NextResponse.json({ present: false });
  }

  return NextResponse.json({
    present: true,
    length: key.length,
    startsWith: key.slice(0, 6),
    endsWith: key.slice(-4),
    hasLeadingWhitespace: key !== key.trimStart(),
    hasTrailingWhitespace: key !== key.trimEnd(),
    hasQuotes: key.startsWith('"') || key.startsWith("'") || key.endsWith('"') || key.endsWith("'"),
    hasNewline: key.includes("\n") || key.includes("\r"),
    startsWithRe: key.startsWith("re_"),
  });
}
