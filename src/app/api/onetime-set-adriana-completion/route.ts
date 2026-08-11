import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: sets Adriana Rojas's System Completion™ content (results
// highlights + Sculpt Signature™ upgrade proposal) so it's ready the
// moment "Finish System" is clicked in the Hub. Scoped by name.
export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Adriana", mode: "insensitive" }, lastName: { equals: "Rojas", mode: "insensitive" } },
    include: { blueprintAssessments: { orderBy: { updatedAt: "desc" }, take: 1 } },
  });
  if (!client) return NextResponse.json({ success: false, error: "Adriana Rojas not found" });

  const assessment = client.blueprintAssessments[0];
  if (!assessment) return NextResponse.json({ success: false, error: "No assessment found" });

  const updated = await prisma.blueprintAssessment.update({
    where: { id: assessment.id },
    data: {
      completionHighlights:
        "Abdomen: definición visiblemente mejor, fibrosis reducida\nPiernas y glúteos: celulitis notablemente disminuida",
      nextSystemName: "Sculpt Signature™",
      nextSystemProposal:
        "6 sesiones de Exilis® (4 piernas, 2 abdomen)\n6 sesiones de Endospheres® (piernas)\n2 sesiones adicionales de EMS",
    },
  });

  return NextResponse.json({ success: true, clientId: client.id, assessmentId: updated.id });
}
