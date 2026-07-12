import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBlueprintReceivedEmail } from "@/lib/email/service";
import { createOrUpdateDraftAssessment } from "@/lib/blueprint-assessments";
import { parseJotformPayload, extractContactField, extractName } from "@/lib/jotform-webhook-utils";
import type { Prisma } from "@prisma/client";

/**
 * Receives Body Blueprint™ submissions from Jotform ("Let's Build
 * Your Blueprint™" form) and creates or updates a Lead, plus its
 * Blueprint Assessment™ (Stage 1 of the client journey). This is
 * intake only:
 *   - creates a Lead if the email doesn't match an existing one
 *   - updates the existing Lead if it does (never a duplicate person)
 *   - creates or updates the Lead's draft BlueprintAssessment (never
 *     duplicated pre-activation — see createOrUpdateDraftAssessment)
 *   - sets Lead status = BLUEPRINT_COMPLETED
 *   - sends the Blueprint Received confirmation email (blueprint@)
 *
 * This endpoint NEVER converts a Lead to a Client, never creates a
 * Portal account, and never sends the Welcome/Activation email —
 * that only happens when the Owner clicks "Convert Lead to Client"
 * (a.k.a. "Activate Client") in the Hub, reviewing the Blueprint
 * first (Stage 2).
 *
 * AUTH: protected by a shared-secret query param, since Jotform
 * webhooks aren't signed. Configure the webhook URL in Jotform as:
 *   https://www.bodyshapersystem.com/api/webhooks/jotform-blueprint?token=YOUR_SECRET
 * and set JOTFORM_WEBHOOK_SECRET to the same value in Vercel.
 *
 * FIELD MAPPING: Jotform's exact field names/IDs are unique to each
 * form and aren't known ahead of time. This parser tries several
 * common patterns (see extractContactField/extractName below) to
 * find email/name/phone/city, but the FULL raw submission is always
 * stored in the assessment's jotformRawData regardless of whether
 * auto-detection succeeds — no data is ever lost, even if the
 * heuristics need tuning once real submissions are seen.
 */

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  // TEMPORARY diagnostic logging — remove once the 401 mismatch is resolved.
  console.error("[jotform-blueprint] received token:", JSON.stringify(token), "expected:", JSON.stringify(process.env.JOTFORM_WEBHOOK_SECRET), "full URL:", request.nextUrl.toString());
  if (!process.env.JOTFORM_WEBHOOK_SECRET || token !== process.env.JOTFORM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = await parseJotformPayload(request);
  } catch (err) {
    return NextResponse.json(
      { error: "Could not parse submission payload", detail: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }

  const email = extractContactField(raw, ["email"]);
  if (!email) {
    return NextResponse.json({ error: "No email field found in submission — cannot create/update a Lead." }, { status: 400 });
  }

  const { firstName, lastName } = extractName(raw);
  const phone = extractContactField(raw, ["phone"]);
  const city = extractContactField(raw, ["city"]);
  const goals = extractContactField(raw, ["goal", "concern", "describe", "tellus", "message"]);
  const jotformSubmissionId = extractContactField(raw, ["submissionid", "submission_id"]);

  const existing = await prisma.lead.findFirst({
    where: { email, archivedAt: null },
    orderBy: { createdAt: "desc" },
  });

  let lead;
  if (existing) {
    lead = await prisma.lead.update({
      where: { id: existing.id },
      data: {
        firstName: firstName || existing.firstName,
        lastName: lastName || existing.lastName,
        phone: phone ?? existing.phone,
        city: city ?? existing.city,
        goals: goals ?? existing.goals,
        status: "BLUEPRINT_COMPLETED",
        source: existing.source ?? "jotform:lets-build-your-blueprint",
      },
    });
  } else {
    lead = await prisma.lead.create({
      data: {
        firstName: firstName || "Unknown",
        lastName: lastName || "",
        email,
        phone,
        city,
        goals,
        status: "BLUEPRINT_COMPLETED",
        source: "jotform:lets-build-your-blueprint",
      },
    });
  }

  await createOrUpdateDraftAssessment(lead.id, {
    jotformSubmissionId,
    jotformRawData: raw as Prisma.InputJsonValue,
    goals,
  });

  await prisma.leadStatusHistory.create({
    data: {
      leadId: lead.id,
      fromStatus: existing?.status,
      toStatus: "BLUEPRINT_COMPLETED",
      note: existing
        ? "Blueprint Assessment™ updated via Jotform"
        : "Lead created from Blueprint Assessment™ submission (Jotform)",
    },
  });

  // Confirmation email only — never a portal invitation, never a
  // Client. Failure here doesn't fail the webhook: the Lead/Blueprint
  // data is already safely saved either way, and Resend's own log
  // captures the failure for review.
  await sendBlueprintReceivedEmail({
    leadId: lead.id,
    firstName: lead.firstName || "there",
    email: lead.email,
  });

  return NextResponse.json({ success: true, leadId: lead.id, created: !existing });
}
