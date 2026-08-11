import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: Emmy's own test/owner Client account keeps getting routed
// to /portal/onboarding because the real onboarding gate checks for
// two signed documents (Prepare Your Experience™ agreement, Almost
// Ready™ waiver) that a genuine intake would produce via Jotform
// webhooks. Since this is Emmy testing her own portal (not a real
// client going through intake), we create placeholder Document rows
// satisfying the gate — clearly labeled as test/bypass records, not
// real signed paperwork. The gating logic itself is untouched, so
// real clients still must actually sign both forms.
export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Emmy", mode: "insensitive" }, lastName: { equals: "Branger", mode: "insensitive" } },
  });
  if (!client) return NextResponse.json({ success: false, error: "Emmy's client record not found" });

  const docs = await prisma.document.createMany({
    data: [
      {
        clientId: client.id,
        title: "[TEST ACCOUNT — onboarding gate bypass, not a real signed document] Prepare Your Experience™",
        category: "POLICIES_APPOINTMENTS",
        visibility: "INTERNAL_ONLY",
        storagePath: "test-account-bypass/prepare-your-experience-placeholder.pdf",
      },
      {
        clientId: client.id,
        title: "[TEST ACCOUNT — onboarding gate bypass, not a real signed document] Almost Ready™ Waiver",
        category: "CONSENT_TREATMENT",
        visibility: "INTERNAL_ONLY",
        storagePath: "test-account-bypass/waiver-placeholder.pdf",
      },
    ],
  });

  return NextResponse.json({ success: true, clientId: client.id, docsCreated: docs.count });
}
