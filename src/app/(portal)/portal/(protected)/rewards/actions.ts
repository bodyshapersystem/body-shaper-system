"use server";

import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";
import { computeTier } from "@/lib/rewards";

/** Real redemption request — spends credits immediately and creates
 * a real pending request for the Owner to fulfill (not an automatic
 * discount code — this is a concierge-fulfilled experience). */
export async function requestRedemption(rewardCatalogItemId: string) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };
  if (!client.rewardsAccount) return { error: "No rewards account found." };
  if (client.rewardsAccount.suspended) return { error: "Your rewards access is currently paused. Please contact your specialist." };

  const item = await prisma.rewardCatalogItem.findUnique({ where: { id: rewardCatalogItemId } });
  if (!item || !item.available) return { error: "This reward isn't available right now." };
  if (client.rewardsAccount.pointsBalance < item.creditCost) return { error: "You don't have enough Body Credits™ for this reward yet." };

  await prisma.$transaction([
    prisma.rewardRedemption.create({
      data: { rewardsAccountId: client.rewardsAccount.id, rewardCatalogItemId, creditsCost: item.creditCost },
    }),
    prisma.rewardsAccount.update({
      where: { id: client.rewardsAccount.id },
      data: { pointsBalance: { decrement: item.creditCost } },
    }),
    prisma.rewardsTransaction.create({
      data: { rewardsAccountId: client.rewardsAccount.id, points: -item.creditCost, action: `Redeemed: ${item.name}` },
    }),
  ]);

  await createNotification({
    clientId: client.id,
    category: "REWARDS",
    description: `${client.firstName} ${client.lastName} redeemed "${item.name}"`,
    linkUrl: `/hub/clients/${client.id}`,
  });

  revalidatePath("/portal/rewards");
  return { success: true };
}

/** Client marks a Secret Mission™ as done. Self-report missions
 * award credits immediately (real, but honest — these can't be
 * technically verified, e.g. "shared a story"). Manual-approval
 * missions (e.g. Google Review) go to the Owner for real
 * verification before any credits are granted. */
export async function completeMission(missionId: string) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };
  if (!client.rewardsAccount) return { error: "No rewards account found." };

  const mission = await prisma.mission.findUnique({ where: { id: missionId } });
  if (!mission || !mission.active) return { error: "This mission isn't available right now." };

  const existing = await prisma.missionCompletion.findFirst({
    where: { rewardsAccountId: client.rewardsAccount.id, missionId, status: { in: ["PENDING", "APPROVED"] } },
  });
  if (existing) return { error: "You've already completed this mission." };

  if (mission.type === "MANUAL_APPROVAL") {
    await prisma.missionCompletion.create({ data: { rewardsAccountId: client.rewardsAccount.id, missionId, status: "PENDING" } });
    await createNotification({
      clientId: client.id,
      category: "REWARDS",
      description: `${client.firstName} ${client.lastName} submitted "${mission.name}" for review`,
      linkUrl: `/hub/clients/${client.id}`,
    });
    revalidatePath("/portal/rewards");
    return { success: true, pending: true };
  }

  const newLifetime = client.rewardsAccount.lifetimePoints + mission.creditReward;
  await prisma.$transaction([
    prisma.missionCompletion.create({ data: { rewardsAccountId: client.rewardsAccount.id, missionId, status: "APPROVED", approvedAt: new Date() } }),
    prisma.rewardsAccount.update({
      where: { id: client.rewardsAccount.id },
      data: { pointsBalance: { increment: mission.creditReward }, lifetimePoints: newLifetime, tier: computeTier(newLifetime) },
    }),
    prisma.rewardsTransaction.create({
      data: { rewardsAccountId: client.rewardsAccount.id, points: mission.creditReward, action: mission.name },
    }),
  ]);

  revalidatePath("/portal/rewards");
  return { success: true, pending: false };
}
