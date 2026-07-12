import { NextResponse } from "next/server";
import { fetchAndStoreJotformSubmissionPdf } from "@/lib/jotform-pdf";

// TEMPORARY diagnostic route — manually re-run the PDF capture for a
// known client/form/submission to see the real error. Delete once done.
export async function GET() {
  const result = await fetchAndStoreJotformSubmissionPdf({
    clientId: "cmri74czl0007l204i5hckoi6",
    jotformFormId: "261875936820064",
    jotformSubmissionId: "6596941229626920327",
    title: "Intake Form (debug test).pdf",
    category: "INTAKE_FORM",
  });
  return NextResponse.json(result);
}
