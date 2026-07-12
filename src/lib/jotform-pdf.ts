import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import type { DocumentCategory } from "@prisma/client";

/**
 * Fetches a submission's PDF directly from Jotform's documented
 * generatePDF endpoint and stores it as a real Document row, tied to
 * the client, marked Client Visible (it's an onboarding form the
 * client themselves submitted) — this is what makes onboarding
 * documents appear automatically in both the Owner Hub and the
 * Client Hub, with no manual "assign" step.
 *
 * Requires JOTFORM_API_KEY to be set. Fails soft (logs, returns
 * false) rather than throwing — a PDF-fetch failure should never
 * break the webhook flow that creates/updates the Lead itself.
 */
export async function fetchAndStoreJotformSubmissionPdf({
  clientId,
  jotformFormId,
  jotformSubmissionId,
  title,
  category,
}: {
  clientId: string;
  jotformFormId: string;
  jotformSubmissionId: string;
  title: string;
  category: DocumentCategory;
}): Promise<{ success: true; documentId: string } | { success: false; error: string }> {
  const apiKey = process.env.JOTFORM_API_KEY;
  if (!apiKey) {
    return { success: false, error: "JOTFORM_API_KEY is not set — skipping automatic PDF capture." };
  }

  try {
    const pdfUrl = `https://api.jotform.com/generatePDF?formid=${jotformFormId}&submissionid=${jotformSubmissionId}&apiKey=${apiKey}&download=1`;
    const res = await fetch(pdfUrl);
    if (!res.ok) {
      return { success: false, error: `Jotform PDF fetch failed with status ${res.status}` };
    }
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("pdf")) {
      // Jotform sometimes returns an HTML error page with a 200 status
      // (e.g. invalid API key, PDF still being generated) — treat
      // anything that isn't actually a PDF as a failure.
      return { success: false, error: `Jotform did not return a PDF (content-type: ${contentType})` };
    }
    const bytes = await res.arrayBuffer();

    const admin = createSupabaseAdminClient();
    const path = `${clientId}/${Date.now()}-${jotformSubmissionId}.pdf`;
    const { error: uploadError } = await admin.storage
      .from("client-documents")
      .upload(path, Buffer.from(bytes), { contentType: "application/pdf" });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const doc = await prisma.document.create({
      data: {
        clientId,
        title,
        category,
        visibility: "CLIENT_VISIBLE",
        storagePath: path,
        fileType: "application/pdf",
        sizeBytes: bytes.byteLength,
      },
    });

    return { success: true, documentId: doc.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error fetching Jotform PDF." };
  }
}
