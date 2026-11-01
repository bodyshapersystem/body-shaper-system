import { NextResponse } from "next/server";
import { findActiveProposal } from "@/lib/proposals/server";
import { createProposalCheckout, SPLIT_SCHEDULE_TEXT } from "@/lib/proposals/checkout";
import { normalizePrograms, priceProgram } from "@/lib/proposals/types";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

/**
 * POST /api/proposals/[token]/checkout  { programKey, mode: "full" | "split", consent }
 * The browser only names a program and a payment mode. Every amount is
 * recomputed here from the proposal stored in the database.
 */
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const proposal = await findActiveProposal(token);
  if (!proposal) return NextResponse.json({ error: "Not found." }, { status: 404, headers: NO_STORE });

  let body: { programKey?: unknown; mode?: unknown; consent?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }
  const programKey = typeof body.programKey === "string" ? body.programKey : "";
  const mode = body.mode === "split" ? "split" : body.mode === "full" ? "full" : null;
  if (!programKey || !mode) return NextResponse.json({ error: "Invalid request." }, { status: 400, headers: NO_STORE });

  if (proposal.checkoutStatus && ["paid_in_full", "first_installment_paid", "completed"].includes(proposal.checkoutStatus)) {
    return NextResponse.json({ error: "This proposal is already reserved. Please message us for any change." }, { status: 409, headers: NO_STORE });
  }

  if (mode === "split") {
    if (body.consent !== true) {
      return NextResponse.json({ error: "Please confirm the two-installment schedule to continue." }, { status: 400, headers: NO_STORE });
    }
    const program = normalizePrograms(proposal.programs).find((p) => p.key === programKey);
    const split = program ? priceProgram(program).split : null;
    if (!split) return NextResponse.json({ error: "Two payments are not available for this program." }, { status: 400, headers: NO_STORE });
    await prisma.clientProposal.update({
      where: { id: proposal.id },
      data: { splitConsentAt: new Date(), splitConsentText: SPLIT_SCHEDULE_TEXT(split.firstCents, split.secondCents) },
    });
  }

  const origin = new URL(request.url).origin;
  const result = await createProposalCheckout({ proposalId: proposal.id, token, origin, programKey, mode, installment: 1 }).catch((e) => {
    console.error("[proposal-checkout]", e);
    return { error: "Checkout could not be started. Please try again.", status: 500 };
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status, headers: NO_STORE });

  await prisma.clientProposal.update({
    where: { id: proposal.id },
    data: { selectedProgramKey: programKey, selectedPaymentMode: mode, checkoutStatus: "started" },
  });
  return NextResponse.json({ url: result.url }, { headers: NO_STORE });
}
