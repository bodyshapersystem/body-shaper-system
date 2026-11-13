import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ATTRIBUTION_DAYS, REF_COOKIE, VISITOR_COOKIE, normalizeCode } from "@/lib/society";

export const dynamic = "force-dynamic";

/**
 * Shaper Society referral link: /r/CODE[?to=/body-blueprint&c=instagram]
 * Records a server-side visit and sets a 30-day cookie — first valid
 * referral wins (a still-valid referral from someone else is kept).
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code: raw } = await params;
  const url = new URL(req.url);
  const to = url.searchParams.get("to");
  const dest = to && to.startsWith("/") && !to.startsWith("//") ? to : "/";
  const res = NextResponse.redirect(new URL(dest, url.origin));

  const participant = await prisma.societyParticipant.findUnique({ where: { code: normalizeCode(raw) } });
  if (!participant || participant.status !== "ACTIVE") return res;

  const visitorId = req.cookies.get(VISITOR_COOKIE)?.value || crypto.randomUUID();
  const channelRaw = (url.searchParams.get("c") || "link").toLowerCase();
  const channel = /^[a-z0-9_-]{1,24}$/.test(channelRaw) ? channelRaw : "link";

  const visit = await prisma.societyVisit.create({
    data: { participantId: participant.id, visitorId, channel, landingPath: dest.slice(0, 200) },
  });

  const cookieOpts = { httpOnly: true, sameSite: "lax" as const, secure: true, path: "/" };
  res.cookies.set(VISITOR_COOKIE, visitorId, { ...cookieOpts, maxAge: 365 * 86400 });

  // First valid referral wins: keep an existing, still-valid cookie from another participant.
  const existing = req.cookies.get(REF_COOKIE)?.value;
  let keepExisting = false;
  if (existing) {
    const [pid, vid] = existing.split(".");
    if (pid && vid && pid !== participant.id) {
      const prev = await prisma.societyVisit.findUnique({ where: { id: vid } });
      keepExisting = !!prev && prev.participantId === pid && Date.now() - prev.visitedAt.getTime() < ATTRIBUTION_DAYS * 86400000;
    }
  }
  if (!keepExisting) res.cookies.set(REF_COOKIE, `${participant.id}.${visit.id}`, { ...cookieOpts, maxAge: ATTRIBUTION_DAYS * 86400 });
  return res;
}
