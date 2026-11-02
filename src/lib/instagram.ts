import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Live Instagram feed — Instagram API with Instagram Login (Business Login for Instagram).
 * Emmy connects @bodyshapersystem once from the Hub; the long-lived token (60 days) is stored
 * server-side only and refreshed by a daily cron. The website reads the latest posts through a
 * cached server call (1 h) and falls back to the static tiles if anything is unavailable.
 */
export const IG_SCOPES = "instagram_business_basic";
export const IG_FEED_TAG = "instagram-feed";

export function igConfig() {
  const appId = process.env.INSTAGRAM_APP_ID;
  const secret = process.env.INSTAGRAM_APP_SECRET;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://www.bodyshapersystem.com";
  return { appId, secret, redirectUri: `${site.replace(/\/$/, "")}/api/instagram/callback`, ready: !!(appId && secret) };
}

export type IgPost = { id: string; type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"; image: string; permalink: string; caption: string; timestamp: string };

async function fetchFeed(limit: number): Promise<IgPost[]> {
  const conn = await prisma.instagramConnection.findUnique({ where: { id: "default" } });
  if (!conn || conn.expiresAt < new Date()) return [];
  const url = new URL("https://graph.instagram.com/v23.0/me/media");
  url.searchParams.set("fields", "id,media_type,media_url,thumbnail_url,permalink,caption,timestamp");
  url.searchParams.set("limit", String(Math.min(limit * 2, 30)));
  url.searchParams.set("access_token", conn.accessToken);
  const r = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!r.ok) {
    const msg = (await r.text()).slice(0, 300);
    await prisma.instagramConnection.update({ where: { id: "default" }, data: { lastError: `feed ${r.status}: ${msg}` } }).catch(() => undefined);
    return [];
  }
  const j = (await r.json()) as { data?: { id: string; media_type: IgPost["type"]; media_url?: string; thumbnail_url?: string; permalink: string; caption?: string; timestamp: string }[] };
  return (j.data ?? [])
    .map((m) => ({ id: m.id, type: m.media_type, image: (m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url) || "", permalink: m.permalink, caption: (m.caption ?? "").slice(0, 300), timestamp: m.timestamp }))
    .filter((m) => m.image && /^https:\/\/[^/]*(cdninstagram\.com|fbcdn\.net)\//.test(m.image) && m.permalink.startsWith("https://www.instagram.com/"))
    .slice(0, limit);
}

/** Latest posts for the website, cached for one hour (and refreshed right after connecting). */
export const getInstagramFeed = unstable_cache(
  async (limit = 8) => {
    try {
      return await fetchFeed(limit);
    } catch (e) {
      console.error("instagram feed", e);
      return [];
    }
  },
  ["instagram-feed-v1"],
  { revalidate: 3600, tags: [IG_FEED_TAG] },
);

export async function saveConnection(data: { igUserId: string; username: string; accessToken: string; expiresIn: number }) {
  const expiresAt = new Date(Date.now() + data.expiresIn * 1000);
  await prisma.instagramConnection.upsert({
    where: { id: "default" },
    create: { id: "default", igUserId: data.igUserId, username: data.username, accessToken: data.accessToken, expiresAt },
    update: { igUserId: data.igUserId, username: data.username, accessToken: data.accessToken, expiresAt, connectedAt: new Date(), refreshedAt: new Date(), lastError: null },
  });
  revalidateTag(IG_FEED_TAG);
}

/** Refreshes the long-lived token when it is older than 7 days (must be ≥24 h old and not expired). */
export async function refreshInstagramToken() {
  const conn = await prisma.instagramConnection.findUnique({ where: { id: "default" } });
  if (!conn) return { status: "not-connected" as const };
  if (conn.expiresAt < new Date()) return { status: "expired" as const };
  if (Date.now() - conn.refreshedAt.getTime() < 7 * 86400_000) return { status: "fresh" as const };
  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", conn.accessToken);
  const r = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10000) });
  const j = (await r.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: { message?: string } };
  if (!r.ok || !j.access_token) {
    await prisma.instagramConnection.update({ where: { id: "default" }, data: { lastError: `refresh: ${j.error?.message ?? r.status}` } });
    return { status: "error" as const };
  }
  await prisma.instagramConnection.update({ where: { id: "default" }, data: { accessToken: j.access_token, expiresAt: new Date(Date.now() + (j.expires_in ?? 5184000) * 1000), refreshedAt: new Date(), lastError: null } });
  return { status: "refreshed" as const };
}
