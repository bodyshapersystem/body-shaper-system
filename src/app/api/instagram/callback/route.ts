import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { igConfig, saveConnection } from "@/lib/instagram";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const back = (q: string) => {
    const res = NextResponse.redirect(new URL(`/hub/instagram?${q}`, req.url));
    res.cookies.delete({ name: "ig_oauth_state", path: "/api/instagram" });
    return res;
  };
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "settings.manage")) return back("error=auth");
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state") || "";
  const expected = req.cookies.get("ig_oauth_state")?.value || "";
  if (!code) return back("error=denied");
  if (!expected || expected.length !== state.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(state))) return back("error=state");
  const cfg = igConfig();
  if (!cfg.ready) return back("error=config");
  try {
    const body = new URLSearchParams({ client_id: cfg.appId!, client_secret: cfg.secret!, grant_type: "authorization_code", redirect_uri: cfg.redirectUri, code: code.replace(/#_$/, "") });
    const s = await fetch("https://api.instagram.com/oauth/access_token", { method: "POST", body, cache: "no-store" });
    const short = (await s.json()) as { access_token?: string; user_id?: number | string };
    if (!s.ok || !short.access_token) throw new Error("short-lived token: " + JSON.stringify(short).slice(0, 200));
    const lu = new URL("https://graph.instagram.com/access_token");
    lu.searchParams.set("grant_type", "ig_exchange_token");
    lu.searchParams.set("client_secret", cfg.secret!);
    lu.searchParams.set("access_token", short.access_token);
    const l = await fetch(lu, { cache: "no-store" });
    const long = (await l.json()) as { access_token?: string; expires_in?: number };
    if (!l.ok || !long.access_token) throw new Error("long-lived token failed");
    const me = await fetch(`https://graph.instagram.com/v23.0/me?fields=user_id,username&access_token=${encodeURIComponent(long.access_token)}`, { cache: "no-store" });
    const profile = (await me.json()) as { user_id?: string; username?: string };
    await saveConnection({ igUserId: String(profile.user_id ?? short.user_id ?? ""), username: profile.username ?? "", accessToken: long.access_token, expiresIn: long.expires_in ?? 5184000 });
    return back("connected=1");
  } catch (e) {
    console.error("instagram connect", e);
    return back("error=exchange");
  }
}
