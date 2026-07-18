"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import type { RewardCategory } from "@prisma/client";
import { computeTier } from "@/lib/rewards";

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

const DEFAULT_CATALOG: { name: string; description: string; category: string; creditCost: number }[] = [
  // Body Shaper System Experiences
  { name: "10 Extra Minutes", description: "Add 10 extra minutes to any treatment area during your session.", category: "EXPERIENCES", creditCost: 150 },
  { name: "Evening Priority Booking", description: "Priority access to premium evening appointments whenever available.", category: "EXPERIENCES", creditCost: 200 },
  { name: "Endospheres® Session", description: "One complimentary Endospheres treatment.", category: "EXPERIENCES", creditCost: 450 },
  { name: "EMS Session", description: "One complimentary EMS treatment.", category: "EXPERIENCES", creditCost: 550 },
  { name: "Exilis® Session", description: "One complimentary Exilis treatment.", category: "EXPERIENCES", creditCost: 700 },
  { name: "30% OFF Your Next System", description: "Apply 30% off toward your next qualifying Body Shaper System.", category: "EXPERIENCES", creditCost: 1000 },
  // Beauty Partners
  { name: "Professional Blowout", description: "With our partner salon.", category: "BEAUTY", creditCost: 350 },
  { name: "Manicure", description: "With our partner salon.", category: "BEAUTY", creditCost: 350 },
  { name: "Pedicure", description: "With our partner salon.", category: "BEAUTY", creditCost: 350 },
  { name: "Professional Spray Tan", description: "With our partner studio.", category: "BEAUTY", creditCost: 500 },
  // Signature Experiences — locked, real hidden eligibility (see isEligibleForSignatureExperiences)
  { name: "Lash Experience", description: "A luxury lash treatment, exclusively for our most dedicated members.", category: "VIP", creditCost: 800 },
  { name: "Personal Training Session", description: "One complimentary session with a personal trainer.", category: "VIP", creditCost: 900 },
  { name: "Therapeutic Massage at Home", description: "A therapeutic massage, brought to you.", category: "VIP", creditCost: 1000 },
];

const DEFAULT_MISSIONS: { name: string; description: string; creditReward: number; type: "SELF_REPORT" | "MANUAL_APPROVAL" }[] = [
  { name: "Coffee Mission", description: "Visit your favorite coffee shop, post the approved story, and tag @bodyshapersystem_mia. Keep the story public for 24 hours.", creditReward: 15, type: "MANUAL_APPROVAL" },
  { name: "Gym Check-In", description: "Share your workout, use the approved caption, and tag Body Shaper System.", creditReward: 15, type: "MANUAL_APPROVAL" },
  { name: "Hydration Challenge", description: "Share your daily hydration, use the approved sticker, and tag us.", creditReward: 10, type: "MANUAL_APPROVAL" },
  { name: "Wellness Sunday", description: "Share your Sunday wellness ritual — pilates, a walk, stretching, meditation, or matcha.", creditReward: 20, type: "MANUAL_APPROVAL" },
  { name: "Transformation Story", description: "Share one positive change you've experienced since beginning your Body Shaper System journey. No before & after required.", creditReward: 25, type: "MANUAL_APPROVAL" },
];

/**
 * Real, idempotent seed — only creates catalog items/missions that
 * don't already exist by name, so this is always safe to run again
 * (e.g. after adding a new item to the default list later). Not a
 * one-time throwaway script; kept as a permanent, repeatable action.
 */
export async function seedDefaultRewardsCatalog() {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "rewards.manage")) return { error: "You don't have permission to do this." };

  let itemsCreated = 0;
  for (const item of DEFAULT_CATALOG) {
    const existing = await prisma.rewardCatalogItem.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.rewardCatalogItem.create({ data: item as never });
      itemsCreated += 1;
    }
  }

  let missionsCreated = 0;
  for (const mission of DEFAULT_MISSIONS) {
    const existing = await prisma.mission.findFirst({ where: { name: mission.name } });
    if (!existing) {
      await prisma.mission.create({ data: mission });
      missionsCreated += 1;
    }
  }

  revalidatePath("/hub/rewards");
  revalidatePath("/portal/rewards");
  return { success: true, itemsCreated, missionsCreated };
}

/**
 * Real bulk bonus — awards a fixed number of Society Points to every
 * real active client (not paused, not archived) that already has a
 * RewardsAccount. Idempotent per client: skips anyone who already
 * has a transaction with this exact action label, so it's safe to
 * click again without double-awarding the same round of bonuses.
 */
export async function bulkAwardActiveClientBonus(points: number, label: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "rewards.manage")) return { error: "You don't have permission to do this." };
  if (!Number.isFinite(points) || points <= 0) return { error: "Points must be a positive number." };
  if (!label.trim()) return { error: "Please provide a label for this bonus." };

  const activeAccounts = await prisma.rewardsAccount.findMany({
    where: { client: { pausedAt: null, archivedAt: null } },
  });

  let awardedCount = 0;
  let skippedCount = 0;

  for (const account of activeAccounts) {
    const alreadyAwarded = await prisma.rewardsTransaction.findFirst({
      where: { rewardsAccountId: account.id, action: label },
    });
    if (alreadyAwarded) {
      skippedCount += 1;
      continue;
    }

    const newLifetime = account.lifetimePoints + points;
    await prisma.$transaction([
      prisma.rewardsAccount.update({
        where: { id: account.id },
        data: { pointsBalance: { increment: points }, lifetimePoints: newLifetime, tier: computeTier(newLifetime) },
      }),
      prisma.rewardsTransaction.create({
        data: { rewardsAccountId: account.id, points, action: label, createdById: user.id },
      }),
    ]);
    awardedCount += 1;
  }

  revalidatePath("/hub/rewards");
  revalidatePath("/portal/rewards");
  return { success: true, awardedCount, skippedCount };
}
