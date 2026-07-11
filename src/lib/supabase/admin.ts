import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client — uses the SECRET service_role key, which
 * bypasses Row Level Security entirely.
 *
 * NEVER import this into any "use client" file or expose it to the
 * browser. Server-only (Server Actions / Route Handlers), and even
 * there, only for operations that genuinely need to bypass RLS —
 * e.g. an Owner-role Server Action reading across all clients'
 * records, or the Lead -> Client conversion flow creating a portal
 * account on the user's behalf. Every call site using this client
 * must do its own role/permission check first; this client does not
 * check anything on its own.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
