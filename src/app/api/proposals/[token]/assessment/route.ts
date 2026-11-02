import { NextResponse } from "next/server";
import { findActiveProposal } from "@/lib/proposals/server";
import { createAssessmentCheckout } from "@/lib/proposals/checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

/** POST /api/proposals/[token]/assessment — $350 Body Blueprint™ Assessment reservation. No input is trusted: the amount comes from settings. */
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const proposal = await findActiveProposal(token);
  if (!proposal) return NextResponse.json({ error: "Not found." }, { status: 404, headers: NO_STORE });
  const origin = new URL(request.url).origin;
  const result = await createAssessmentCheckout({ proposalId: proposal.id, token, origin }).catch((e) => {
    console.error("[proposal-assessment]", e);
    return { error: "Checkout could not be started. Please try again.", status: 500 };
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status, headers: NO_STORE });
  return NextResponse.json({ url: result.url }, { headers: NO_STORE });
}
