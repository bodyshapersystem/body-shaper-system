import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";
const NAME = "Leave a Google Review";

export default async function EmergencyCreateGoogleReviewMissionPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const existing = await prisma.mission.findFirst({ where: { name: NAME } });
  if (existing) {
    return (
      <div style={{ padding: 40, fontFamily: "monospace" }}>
        Already exists — nothing changed. "{existing.name}" | {existing.creditReward} pts | active: {String(existing.active)} | id: {existing.id}
      </div>
    );
  }

  // Mirrors exactly what the real Hub "Create Mission" form
  // (upsertMission in catalog-actions.ts) would insert.
  const mission = await prisma.mission.create({
    data: {
      name: NAME,
      description: "Share your experience publicly on Google and help other clients find us.",
      creditReward: 25,
      type: "MANUAL_APPROVAL",
      active: true,
      closingNote: "Take a screenshot of your submitted review, then upload it here for approval.",
    },
  });

  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      Created "{mission.name}" | {mission.creditReward} pts | type: {mission.type} | id: {mission.id}
    </div>
  );
}
