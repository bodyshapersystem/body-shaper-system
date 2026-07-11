import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in the browser ("use client" components).
 * Uses the public anon key — safe to expose, since Row Level Security
 * (RLS) policies in Supabase are what actually enforce access control,
 * not this key.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
