import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: sets Adriana Rojas's final System Completion™ content —
// structured two-option proposal with real pricing, and corrects
// recommendedSystem back to "Sculpt Start" (was showing "Sculpt
// Signature", which is the *next* system, not the one she completed).
export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Adriana", mode: "insensitive" }, lastName: { equals: "Rojas", mode: "insensitive" } },
    include: { blueprintAssessments: { orderBy: { updatedAt: "desc" }, take: 1 } },
  });
  if (!client) return NextResponse.json({ success: false, error: "Adriana Rojas not found" });

  const assessment = client.blueprintAssessments[0];
  if (!assessment) return NextResponse.json({ success: false, error: "No assessment found" });

  const nextSystemProposal = [
    "## Propuesta 01 — $2,050",
    "- 6 Exilis® (4 piernas + glúteos, 2 abdomen)",
    "- 6 Endospheres® (piernas)",
    "- 2 EMS® (abdomen)",
    "## Propuesta 02 — $1,650",
    "- 6 Exilis® (4 piernas, 2 abdomen)",
    "- 6 Endospheres® (piernas)",
    "> Pago completo (ahorra $120), 2 pagos o 3 pagos — disponible en Zelle o tarjeta (+4%)",
  ].join("\n");

  const updated = await prisma.blueprintAssessment.update({
    where: { id: assessment.id },
    data: {
      recommendedSystem: "Sculpt Start",
      completionHighlights:
        "Abdomen: definición visiblemente mejor, fibrosis reducida\nPiernas y glúteos: celulitis notablemente disminuida",
      nextSystemName: "Sculpt Signature™",
      nextSystemProposal,
    },
  });

  return NextResponse.json({ success: true, clientId: client.id, assessmentId: updated.id, recommendedSystem: updated.recommendedSystem });
}
