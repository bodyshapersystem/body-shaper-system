import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import JourneyView from "../JourneyView";

export const dynamic = "force-dynamic";

export default async function PeptideJourneyPage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const { preview } = await searchParams;

  const [protocol, logs, activeAssessment] = await Promise.all([
    prisma.peptideProtocol.findFirst({ where: { clientId: client.id, active: true }, orderBy: { updatedAt: "desc" } }),
    prisma.peptideLog.findMany({ where: { clientId: client.id }, orderBy: { administeredAt: "desc" }, take: 30 }),
    prisma.blueprintAssessment.findFirst({
      where: { clientId: client.id, status: { in: ["ACTIVE", "VALIDATED", "IN_PROGRESS", "COMPLETED"] } },
      orderBy: { version: "desc" },
      select: { recommendedSystem: true },
    }),
  ]);

  return (
    <div className="cat-body portal-page dtj-page-wrap">
      <JourneyView
        currentSystemName={activeAssessment?.recommendedSystem ?? null}
        forceWelcome={preview === "welcome"}
        protocol={
          protocol
            ? {
                id: protocol.id,
                peptideName: protocol.peptideName,
                goalCategory: protocol.goalCategory,
                customGoal: protocol.customGoal,
                dose: protocol.dose,
                frequency: protocol.frequency,
                injectionDays: protocol.injectionDays,
                injectionTime: protocol.injectionTime,
                injectionSite: protocol.injectionSite,
                provider: protocol.provider,
                reminderEnabled: protocol.reminderEnabled,
                refillOrderByDate: protocol.refillOrderByDate ? protocol.refillOrderByDate.toISOString() : null,
              }
            : null
        }
        logs={logs.map((l) => ({
          id: l.id,
          peptideName: l.peptideName,
          administeredAt: l.administeredAt.toISOString(),
          dosage: l.dosage,
          injectionSite: l.injectionSite,
          notes: l.notes,
          appetite: l.appetite,
          energy: l.energy,
          bloating: l.bloating,
          digestion: l.digestion,
          sleepRating: l.sleepRating,
          mood: l.mood,
          nausea: l.nausea,
        }))}
      />
    </div>
  );
}
