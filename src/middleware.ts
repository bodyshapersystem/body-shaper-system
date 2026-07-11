import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase Auth session cookie on every request. This
 * is required for SSR auth: Server Components can read cookies but
 * can't write them, so without this, a session nearing expiry would
 * never get refreshed and users would be logged out unexpectedly.
 * (This was flagged as a pending TODO in src/lib/supabase/server.ts —
 * closing it out now that real auth is live for both Hub and Portal.)
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // Touching the session is what triggers the refresh-if-needed logic.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Run on Hub and Portal routes only — no need to touch the
    // public marketing site's cookies on every page view.
    "/hub/:path*",
    "/portal/:path*",
  ],
};
