import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findActiveProposal, logProposalEvent } from "@/lib/proposals/server";
import { normalizePrograms } from "@/lib/proposals/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["view", "select_program", "select_payment"]);
const MAX_EVENTS = 400; // per proposal — tracking stays useful without unbounded writes

/** Best-effort engagement tracking from the private page. Always answers 204. */
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const done = new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  try {
    const { token } = await params;
    const proposal = await findActiveProposal(token);
    if (!proposal) return done;
    const body = (await request.json().catch(() => ({}))) as { type?: string; programKey?: string; mode?: string };
    if (!body.type || !ALLOWED.has(body.type)) return done;
    if ((await prisma.proposalEvent.count({ where: { proposalId: proposal.id } })) >= MAX_EVENTS) return done;

    const now = new Date();
    if (body.type === "view") {
      await prisma.clientProposal.update({
        where: { id: proposal.id },
        data: { viewCount: { increment: 1 }, lastViewedAt: now, firstViewedAt: proposal.firstViewedAt ?? now },
      });
      await logProposalEvent(proposal.id, "view");
      return done;
    }
    const programKey = typeof body.programKey === "string" ? body.programKey : "";
    if (!normalizePrograms(proposal.programs).some((p) => p.key === programKey)) return done;
    const mode = body.mode === "split" || body.mode === "full" ? body.mode : undefined;
    const paid = ["paid_in_full", "first_installment_paid", "completed"].includes(proposal.checkoutStatus ?? "");
    if (!paid) {
      await prisma.clientProposal.update({
        where: { id: proposal.id },
        data: { selectedProgramKey: programKey, ...(mode ? { selectedPaymentMode: mode } : {}) },
      });
    }
    await logProposalEvent(proposal.id, body.type, { programKey, ...(mode ? { mode } : {}) });
  } catch (e) {
    console.error("[proposal-event]", e);
  }
  return done;
}
