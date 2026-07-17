"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import type { RewardCategory } from "@prisma/client";

export async function upsertRewardCatalogItem(formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "rewards.manage")) return { error: "You don't have permission to manage the catalog." };

  const id = (formData.get("id") as string) || undefined;
  const name = String(formData.get("name") || "").trim();
  const description = (formData.get("description") as string) || undefined;
  const category = formData.get("category") as RewardCategory;
  const creditCost = Number(formData.get("creditCost"));
  const available = formData.get("available") === "on";

  if (!name || !category || !Number.isFinite(creditCost)) {
    return { error: "Name, category, and a valid credit cost are required." };
  }

  if (id) {
    await prisma.rewardCatalogItem.update({ where: { id }, data: { name, description, category, creditCost, available } });
  } else {
    await prisma.rewardCatalogItem.create({ data: { name, description, category, creditCost, available } });
  }

  revalidatePath("/hub/rewards");
  revalidatePath("/portal/rewards");
  return { success: true };
}

export async function deleteRewardCatalogItem(id: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "rewards.manage")) return { error: "You don't have permission to manage the catalog." };
  await prisma.rewardCatalogItem.delete({ where: { id } }).catch(() => undefined);
  revalidatePath("/hub/rewards");
  revalidatePath("/portal/rewards");
  return { success: true };
}

export async function upsertMission(formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "rewards.manage")) return { error: "You don't have permission to manage missions." };

  const id = (formData.get("id") as string) || undefined;
  const name = String(formData.get("name") || "").trim();
  const description = (formData.get("description") as string) || undefined;
  const creditReward = Number(formData.get("creditReward"));
  const type = (formData.get("type") as "SELF_REPORT" | "MANUAL_APPROVAL") || "SELF_REPORT";
  const active = formData.get("active") === "on";

  if (!name || !Number.isFinite(creditReward)) return { error: "Name and a valid credit reward are required." };

  if (id) {
    await prisma.mission.update({ where: { id }, data: { name, description, creditReward, type, active } });
  } else {
    await prisma.mission.create({ data: { name, description, creditReward, type, active } });
  }

  revalidatePath("/hub/rewards");
  revalidatePath("/portal/rewards");
  return { success: true };
}

export async function deleteMission(id: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "rewards.manage")) return { error: "You don't have permission to manage missions." };
  await prisma.mission.delete({ where: { id } }).catch(() => undefined);
  revalidatePath("/hub/rewards");
  revalidatePath("/portal/rewards");
  return { success: true };
}

export async function upsertPartner(formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "rewards.manage")) return { error: "You don't have permission to manage partners." };

  const id = (formData.get("id") as string) || undefined;
  const name = String(formData.get("name") || "").trim();
  const category = (formData.get("category") as string) || undefined;
  const creditValue = formData.get("creditValue") ? Number(formData.get("creditValue")) : undefined;
  const notes = (formData.get("notes") as string) || undefined;
  const active = formData.get("active") === "on";

  if (!name) return { error: "Partner name is required." };

  if (id) {
    await prisma.partner.update({ where: { id }, data: { name, category, creditValue, notes, active } });
  } else {
    await prisma.partner.create({ data: { name, category, creditValue, notes, active } });
  }

  revalidatePath("/hub/rewards");
  return { success: true };
}

export async function deletePartner(id: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "rewards.manage")) return { error: "You don't have permission to manage partners." };
  await prisma.partner.delete({ where: { id } }).catch(() => undefined);
  revalidatePath("/hub/rewards");
  return { success: true };
}

/** Owner approves a client-reported mission (Manual Approval type) and awards the real credits. */
export async function approveMissionCompletion(completionId: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "rewards.manage")) return { error: "You don't have permission to approve missions." };

  const completion = await prisma.missionCompletion.findUnique({ where: { id: completionId }, include: { mission: true, rewardsAccount: true } });
  if (!completion) return { error: "Mission completion not found." };
  if (completion.status !== "PENDING") return { error: "This mission has already been reviewed." };

  const { computeTier } = await import("@/lib/rewards");
  const newLifetime = completion.rewardsAccount.lifetimePoints + completion.mission.creditReward;

  await prisma.$transaction([
    prisma.missionCompletion.update({ where: { id: completionId }, data: { status: "APPROVED", approvedAt: new Date() } }),
    prisma.rewardsAccount.update({
      where: { id: completion.rewardsAccountId },
      data: { pointsBalance: { increment: completion.mission.creditReward }, lifetimePoints: newLifetime, tier: computeTier(newLifetime) },
    }),
    prisma.rewardsTransaction.create({
      data: { rewardsAccountId: completion.rewardsAccountId, points: completion.mission.creditReward, action: completion.mission.name, createdById: user.id },
    }),
  ]);

  revalidatePath("/hub/rewards");
  revalidatePath("/portal/rewards");
  return { success: true };
}

export async function rejectMissionCompletion(completionId: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "rewards.manage")) return { error: "You don't have permission to review missions." };
  await prisma.missionCompletion.update({ where: { id: completionId }, data: { status: "REJECTED" } });
  revalidatePath("/hub/rewards");
  return { success: true };
}

/** Owner marks a pending redemption as fulfilled (the reward has been given). */
export async function fulfillRedemption(redemptionId: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "rewards.manage")) return { error: "You don't have permission to manage redemptions." };
  await prisma.rewardRedemption.update({ where: { id: redemptionId }, data: { status: "FULFILLED", fulfilledAt: new Date() } });
  revalidatePath("/hub/rewards");
  return { success: true };
}

export async function cancelRedemption(redemptionId: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "rewards.manage")) return { error: "You don't have permission to manage redemptions." };
  const redemption = await prisma.rewardRedemption.findUnique({ where: { id: redemptionId } });
  if (!redemption || redemption.status !== "PENDING") return { error: "Only pending redemptions can be cancelled." };

  // Refund the credits since the redemption never happened.
  await prisma.$transaction([
    prisma.rewardRedemption.update({ where: { id: redemptionId }, data: { status: "CANCELLED" } }),
    prisma.rewardsAccount.update({ where: { id: redemption.rewardsAccountId }, data: { pointsBalance: { increment: redemption.creditsCost } } }),
    prisma.rewardsTransaction.create({
      data: { rewardsAccountId: redemption.rewardsAccountId, points: redemption.creditsCost, action: "Redemption cancelled — credits refunded", createdById: user.id },
    }),
  ]);

  revalidatePath("/hub/rewards");
  return { success: true };
}

export async function moveTier(clientId: string, tier: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "rewards.manage")) return { error: "You don't have permission to change tiers." };
  const account = await prisma.rewardsAccount.findUnique({ where: { clientId } });
  if (!account) return { error: "This client has no rewards account." };
  await prisma.rewardsAccount.update({ where: { id: account.id }, data: { tier } });
  revalidatePath("/hub/rewards");
  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}

export async function toggleSuspendRewards(clientId: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "rewards.manage")) return { error: "You don't have permission to do this." };
  const account = await prisma.rewardsAccount.findUnique({ where: { clientId } });
  if (!account) return { error: "This client has no rewards account." };
  await prisma.rewardsAccount.update({ where: { id: account.id }, data: { suspended: !account.suspended } });
  revalidatePath("/hub/rewards");
  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}
