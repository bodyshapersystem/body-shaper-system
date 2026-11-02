import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { igConfig, IG_SCOPES } from "@/lib/instagram";
export const runtime = "nodejs";

/** Starts Business Login for Instagram (owner only). */
export async function GET() {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "settings.manage")) return NextResponse.redirect(new URL("/hub/login", process.env.NEXT_PUBLIC_SITE_URL || "https://www.bodyshapersystem.com"));
  const cfg = igConfig();
  if (!cfg.ready) return NextResponse.redirect(new URL("/hub/instagram?error=config", cfg.redirectUri));
  const state = randomBytes(24).toString("base64url");
  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.searchParams.set("client_id", cfg.appId!);
  url.searchParams.set("redirect_uri", cfg.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", IG_SCOPES);
  url.searchParams.set("state", state);
  url.searchParams.set("enable_fb_login", "0");
  const res = NextResponse.redirect(url);
  res.cookies.set("ig_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", path: "/api/instagram", maxAge: 900 });
  return res;
}
