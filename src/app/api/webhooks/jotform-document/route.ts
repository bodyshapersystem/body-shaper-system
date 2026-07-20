import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJotformPayload, extractContactField, extractSubmissionMeta, extractName } from "@/lib/jotform-webhook-utils";
import { fetchAndStoreJotformSubmissionPdf } from "@/lib/jotform-pdf";
import { createNotification } from "@/lib/notifications";
import type { DocumentCategory } from "@prisma/client";

// The PDF fetch (with retries) can take a while — give this route
// more time than the default serverless limit so it doesn't get
// killed mid-request (which showed up as a status-0/no-response log
// entry rather than a clean error).
export const maxDuration = 30;

/**
 * Generic, reusable receiver for ANY onboarding Jotform form whose
 * completed submission should become a Document automatically — no
 * per-form code needed. Configure a new form's webhook in Jotform as:
 *
 *   https://www.bodyshapersystem.com/api/webhooks/jotform-document
 *     ?token=YOUR_SECRET&category=CONSENT_TREATMENT
 *
 * ...swapping `category` for whichever DocumentCategory this form's
 * completed PDF belongs under (WAIVER submissions -> CONSENT_TREATMENT,
 * Photography Authorization form -> PHOTOGRAPHY_AUTHORIZATION, the
 * Policies form -> POLICIES_APPOINTMENTS, etc.) One webhook route,
 * many forms — adding a new onboarding form later is a Jotform-side
 * configuration change, not a code change.
 *
 * Unlike the Blueprint intake webhook, this fires for forms submitted
 * by people who are ALREADY Clients (Waiver/Consent/Photography
 * Authorization/Policies are signed post-conversion, during
 * onboarding) — so the Client is looked up by email and MUST already
 * exist. If it doesn't, this fails clearly (visible in Jotform's
 * delivery log) rather than silently dropping the document.
 */
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.replace(/\/+$/, "");
  if (!process.env.JOTFORM_WEBHOOK_SECRET || token !== process.env.JOTFORM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categoryRaw = request.nextUrl.searchParams.get("category")?.replace(/\/+$/, "");
  const category = categoryRaw as DocumentCategory | null;
  const VALID_CATEGORIES: DocumentCategory[] = [
    "INTAKE_FORM",
    "WELCOME_GUIDE",
    "POLICIES_APPOINTMENTS",
    "CONSENT_TREATMENT",
    "PHOTOGRAPHY_AUTHORIZATION",
    "BODY_BLUEPRINT_PDF",
    "FINAL_REPORT",
    "RECEIPTS_INVOICES",
    "PROGRESS_PHOTOS",
    "RENPHO_REPORTS",
    "ADDITIONAL_FILES",
  ];
  if (!category || !VALID_CATEGORIES.includes(category)) {
    // TEMPORARY diagnostic logging — remove once the 400 cause is confirmed.
    console.error("[jotform-document] invalid category:", JSON.stringify(categoryRaw), "full URL:", request.nextUrl.toString());
    return NextResponse.json(
      { error: `Missing or invalid ?category= query param. Must be one of: ${VALID_CATEGORIES.join(", ")}` },
      { status: 400 }
    );
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
    console.error("[jotform-document] no email found. raw keys:", JSON.stringify(Object.keys(raw)));
    return NextResponse.json({ error: "No email field found in submission." }, { status: 400 });
  }

  const { formId, submissionId } = extractSubmissionMeta(raw);
  if (!formId || !submissionId) {
    console.error("[jotform-document] missing formId/submissionId. raw:", JSON.stringify(raw).slice(0, 500));
    return NextResponse.json({ error: "Missing formID/submissionID in the Jotform payload." }, { status: 400 });
  }

  const client = await prisma.client.findFirst({ where: { email }, orderBy: { createdAt: "desc" } });
  if (!client) {
    // Per direction: "Prepare for Your Experience" (POLICIES_APPOINTMENTS)
    // is often someone's very FIRST real touchpoint — they may submit
    // it before ever being added as a Lead. Rather than silently
    // failing (a real prospective client's submission was being lost
    // entirely, as happened with Gabriela), auto-create a real Lead
    // from the submission's own contact info so they show up ready to
    // convert. Every other category still requires an existing
    // Client, since Waiver/Photography Authorization are genuinely
    // post-conversion documents.
    if (category === "POLICIES_APPOINTMENTS") {
      const { firstName, lastName } = extractName(raw);
      const phone = extractContactField(raw, ["phone", "phone number"]);

      const existingLead = await prisma.lead.findFirst({ where: { email }, orderBy: { createdAt: "desc" } });
      if (!existingLead) {
        await prisma.lead.create({
          data: {
            firstName: firstName || "New",
            lastName: lastName || "Lead",
            email,
            phone,
            source: "jotform:prepare-for-your-experience",
          },
        });
      }
      return NextResponse.json({
        success: true,
        note: `No client existed for ${email} — created a real Lead from this submission instead of dropping it. Convert them to a Client once ready, then re-submit or manually record this document.`,
      });
    }

    return NextResponse.json(
      { error: `No client found for ${email}. This form's signer must already be a converted Client.` },
      { status: 404 }
    );
  }

  const CATEGORY_TITLES: Record<DocumentCategory, string> = {
    INTAKE_FORM: "Intake Form.pdf",
    WELCOME_GUIDE: "Welcome Guide.pdf",
    POLICIES_APPOINTMENTS: "Policies & Appointments.pdf",
    CONSENT_TREATMENT: "Consent for Treatment.pdf",
    PHOTOGRAPHY_AUTHORIZATION: "Photography Authorization.pdf",
    BODY_BLUEPRINT_PDF: "Body Blueprint Report.pdf",
    FINAL_REPORT: "Final Report.pdf",
    RECEIPTS_INVOICES: "Receipt.pdf",
    PROGRESS_PHOTOS: "Progress Photos.pdf",
    RENPHO_REPORTS: "RENPHO Report.pdf",
    ADDITIONAL_FILES: "Document.pdf",
  };

  const result = await fetchAndStoreJotformSubmissionPdf({
    clientId: client.id,
    jotformFormId: formId,
    jotformSubmissionId: submissionId,
    title: CATEGORY_TITLES[category],
    category,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const NOTIFICATION_TEXT: Partial<Record<DocumentCategory, string>> = {
    CONSENT_TREATMENT: `${client.firstName} ${client.lastName} signed their Waiver Form`,
    POLICIES_APPOINTMENTS: `${client.firstName} ${client.lastName} completed their Policies & Consent Form`,
  };
  await createNotification({
    clientId: client.id,
    category: "FORMS",
    description: NOTIFICATION_TEXT[category] ?? `${client.firstName} ${client.lastName} submitted ${CATEGORY_TITLES[category]}`,
    linkUrl: `/hub/clients/${client.id}?tab=documents`,
  });

  return NextResponse.json({ success: true, documentId: result.documentId, clientId: client.id });
}
