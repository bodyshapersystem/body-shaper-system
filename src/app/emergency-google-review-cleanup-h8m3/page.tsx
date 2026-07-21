import { prisma } from "@/lib/prisma";
import { computeTier } from "@/lib/rewards";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";
const MISSION_NAME = "Leave a Google Review";
const ANDREA_CLIENT_ID = "cmrtfsgbe0003jp04h57dkoji";
const POINTS = 25;

export default async function EmergencyGoogleReviewCleanupPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const lines: string[] = [];

  // 1. Deactivate the mission — per direction, this is now handled
  // manually/personally rather than advertised as an in-app, points-
  // for-review incentive (Google's 2026 policy explicitly prohibits
  // offering loyalty points in exchange for reviews).
  const mission = await prisma.mission.findFirst({ where: { name: MISSION_NAME } });
  if (mission && mission.active) {
    await prisma.mission.update({ where: { id: mission.id }, data: { active: false } });
    lines.push(`Deactivated mission "${mission.name}" (id: ${mission.id}) — no longer shown to clients.`);
  } else if (mission) {
    lines.push(`Mission "${mission.name}" was already inactive — nothing changed.`);
  } else {
    lines.push(`No mission named "${MISSION_NAME}" found — nothing to deactivate.`);
  }

  // 2. Credit Andrea manually — same real mechanism as the Hub's
  // "Add Rewards Transaction" tool (addRewardsTransaction), one time.
  const account = await prisma.rewardsAccount.findUnique({ where: { clientId: ANDREA_CLIENT_ID } });
  if (!account) {
    lines.push("Andrea has no rewards account — could not credit points.");
  } else {
    const alreadyCredited = await prisma.rewardsTransaction.findFirst({
      where: { rewardsAccountId: account.id, action: "Google Review" },
    });
    if (alreadyCredited) {
      lines.push(`Already credited (transaction id: ${alreadyCredited.id}) — nothing changed.`);
    } else {
      const newLifetimePoints = account.lifetimePoints + POINTS;
      const newTier = computeTier(newLifetimePoints);
      await prisma.$transaction([
        prisma.rewardsTransaction.create({
          data: {
            rewardsAccountId: account.id,
            points: POINTS,
            action: "Google Review",
            notes: "Manually credited by Emmy — client left a real Google review.",
          },
        }),
        prisma.rewardsAccount.update({
          where: { id: account.id },
          data: { pointsBalance: { increment: POINTS }, lifetimePoints: newLifetimePoints, tier: newTier },
        }),
      ]);
      lines.push(`Credited Andrea +${POINTS} points. New balance: ${account.pointsBalance + POINTS}, lifetime: ${newLifetimePoints}, tier: ${newTier}.`);
    }
  }

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      {lines.join("\n")}
    </div>
  );
}
