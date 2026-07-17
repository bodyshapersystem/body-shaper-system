"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { sendRewardUnlockedEmail } from "@/lib/email/service";
import { createNotification } from "@/lib/notifications";
import { computeTier } from "@/lib/rewards";

export async function addRewardsTransaction(formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "rewards.manage")) {
    return { error: "You don't have permission to adjust rewards." };
  }

  const clientId = String(formData.get("clientId") || "");
  const points = Number(formData.get("points"));
  const action = String(formData.get("action") || "").trim();
  const notes = (formData.get("notes") as string) || undefined;

  if (!clientId || !Number.isFinite(points) || points === 0 || !action) {
    return { error: "Client, a non-zero point value, and an action label are required." };
  }

  const account = await prisma.rewardsAccount.findUnique({ where: { clientId } });
  if (!account) return { error: "This client has no rewards account." };

  const newLifetimePoints = points > 0 ? account.lifetimePoints + points : account.lifetimePoints;
  const newTier = computeTier(newLifetimePoints);

  await prisma.$transaction([
    prisma.rewardsTransaction.create({
      data: { rewardsAccountId: account.id, points, action, notes, createdById: user.id },
    }),
    prisma.rewardsAccount.update({
      where: { id: account.id },
      data: { pointsBalance: { increment: points }, lifetimePoints: newLifetimePoints, tier: newTier },
    }),
  ]);

  if (points > 0) {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (client) {
      await sendRewardUnlockedEmail({
        clientId,
        firstName: client.firstName,
        email: client.email,
        rewardLabel: action,
        portalUrl: "https://www.bodyshapersystem.com/portal/rewards",
      }).catch(() => undefined);
      await createNotification({
        clientId,
        category: "REWARDS",
        description: `${client.firstName} ${client.lastName} unlocked a reward — ${action}`,
        linkUrl: `/hub/clients/${clientId}`,
      });
    }
  }

  revalidatePath("/hub/rewards");
  return { success: true };
}
