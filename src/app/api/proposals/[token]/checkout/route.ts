import { NextResponse } from "next/server";
import { availableAssessmentCredit, findActiveProposal } from "@/lib/proposals/server";
import { createProposalCheckout, SPLIT_SCHEDULE_TEXT, validSecondChargeDate } from "@/lib/proposals/checkout";
import { applyCredit, normalizePrograms, priceProgram } from "@/lib/proposals/types";
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

  let body: { programKey?: unknown; mode?: unknown; consent?: unknown; secondDate?: unknown };
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

  const secondDate = mode === "split" ? validSecondChargeDate(body.secondDate) : null;
  if (mode === "split") {
    if (!secondDate) {
      return NextResponse.json({ error: "Please choose the day for your second payment." }, { status: 400, headers: NO_STORE });
    }
    if (body.consent !== true) {
      return NextResponse.json({ error: "Please confirm the two-installment schedule to continue." }, { status: 400, headers: NO_STORE });
    }
    const program = normalizePrograms(proposal.programs).find((p) => p.key === programKey);
    const pricing = program ? priceProgram(program) : null;
    if (!pricing?.split) return NextResponse.json({ error: "Two payments are not available for this program." }, { status: 400, headers: NO_STORE });
    const credit = await availableAssessmentCredit(proposal.id);
    const applied = applyCredit(pricing, "split", credit?.availableCents ?? 0);
    await prisma.clientProposal.update({
      where: { id: proposal.id },
      data: { splitConsentAt: new Date(), splitConsentText: SPLIT_SCHEDULE_TEXT(applied.todayCents, applied.secondCents, secondDate) + (applied.creditCents ? ` Assessment credit applied: ${(applied.creditCents / 100).toFixed(2)}.` : "") },
    });
  }

  const origin = new URL(request.url).origin;
  const result = await createProposalCheckout({ proposalId: proposal.id, token, origin, programKey, mode, installment: 1, secondChargeDate: secondDate }).catch((e) => {
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
