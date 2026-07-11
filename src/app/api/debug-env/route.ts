import { NextResponse } from "next/server";

// TEMPORARY diagnostic route — reveals only masked prefix/suffix of
// each env var (never the middle, where passwords/keys live) so we
// can debug malformed values without exposing secrets. Delete this
// file once diagnosis is done.

function mask(value: string | undefined, label: string) {
  if (!value) return { label, present: false };
  return {
    label,
    present: true,
    length: value.length,
    startsWith: value.slice(0, 20),
    endsWith: value.slice(-15),
    hasQuotes: value.startsWith('"') || value.startsWith("'") || value.endsWith('"') || value.endsWith("'"),
    hasWhitespace: value !== value.trim(),
  };
}

export async function GET() {
  return NextResponse.json({
    DATABASE_URL: mask(process.env.DATABASE_URL, "DATABASE_URL"),
    DIRECT_URL: mask(process.env.DIRECT_URL, "DIRECT_URL"),
    NEXT_PUBLIC_SUPABASE_URL: mask(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: mask(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    SUPABASE_SERVICE_ROLE_KEY: mask(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY"),
  });
}
