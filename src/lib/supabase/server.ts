import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use in Server Components, Server Actions, and
 * Route Handlers. Reads/writes the session via Next.js cookies, so
 * auth state is available on the server without a client round-trip.
 *
 * Uses the public anon key + RLS — NOT the service_role key. For
 * privileged Hub-only operations that must bypass RLS (e.g. an Owner
 * viewing all leads regardless of row ownership), use
 * createSupabaseAdminClient() instead, and gate access to it behind
 * an explicit role check in the calling Server Action.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component (not an Action/Route
            // Handler) — safe to ignore if middleware refreshes
            // sessions, which we'll set up alongside real auth.
          }
        },
      },
    }
  );
}
