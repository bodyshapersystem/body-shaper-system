import { prisma } from "@/lib/prisma";
import { fetchAndStoreJotformSubmissionPdf } from "@/lib/jotform-pdf";
import { NextResponse } from "next/server";

// One-time: the "Almost Ready™" (Waiver/CONSENT_TREATMENT) webhook
// 404'd for Duber Baptista because his Client record has
// "Duberbaptista@..." (capital D) while he typed "duberbaptista@..."
// on the form. Now that the lookup bug is fixed for future
// submissions, this manually completes the ONE submission that
// already happened and was genuinely lost.
export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { contains: "Duber", mode: "insensitive" } },
  });
  if (!client) return NextResponse.json({ success: false, error: "not found" });

  const existing = await prisma.document.findFirst({ where: { clientId: client.id, category: "CONSENT_TREATMENT" } });
  if (existing) return NextResponse.json({ success: true, note: "Already exists", documentId: existing.id });

  const result = await fetchAndStoreJotformSubmissionPdf({
    clientId: client.id,
    jotformFormId: "230686448903161",
    jotformSubmissionId: "6630770091985668423",
    title: "Consent for Treatment.pdf",
    category: "CONSENT_TREATMENT",
  });

  return NextResponse.json({ success: result.success, result });
}
