"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { getCurrentPortalClient } from "@/lib/permissions";
import { createNotification } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

export async function approveMidpointReview(reviewId: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "blueprints.manage")) {
    return { error: "You don't have permission to do this." };
  }

  const review = await prisma.midpointReview.findUnique({ where: { id: reviewId } });
  if (!review) return { error: "Not found." };

  await prisma.midpointReview.update({
    where: { id: reviewId },
    data: { reviewStatus: "APPROVED", reviewedById: user.id, reviewedAt: new Date() },
  });
  revalidatePath(`/hub/clients/${review.clientId}`);
  revalidatePath(`/portal/blueprint`);
  return { success: true };
}

export async function editMidpointReview(reviewId: string, newCopy: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "blueprints.manage")) {
    return { error: "You don't have permission to do this." };
  }

  const review = await prisma.midpointReview.findUnique({ where: { id: reviewId } });
  if (!review) return { error: "Not found." };

  await prisma.midpointReview.update({
    where: { id: reviewId },
    data: { nextPhaseCopy: newCopy, reviewStatus: "APPROVED", reviewedById: user.id, reviewedAt: new Date() },
  });
  revalidatePath(`/hub/clients/${review.clientId}`);
  revalidatePath(`/portal/blueprint`);
  return { success: true };
}

export async function declineMidpointReview(reviewId: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "blueprints.manage")) {
    return { error: "You don't have permission to do this." };
  }

  const review = await prisma.midpointReview.findUnique({ where: { id: reviewId } });
  if (!review) return { error: "Not found." };

  await prisma.midpointReview.update({
    where: { id: reviewId },
    data: { reviewStatus: "DECLINED", reviewedById: user.id, reviewedAt: new Date() },
  });
  revalidatePath(`/hub/clients/${review.clientId}`);
  return { success: true };
}

/**
 * Client-initiated — tapping "Explore My Next Phase" sends a real
 * message to the specialist (same MessageThread pattern as
 * requestNextSession) and marks the request, so the client sees the
 * warm confirmation state instead of the card re-triggering. This is
 * a conversation starter, not a checkout — nothing is booked or
 * charged here.
 */
export async function requestExploreNextPhase(reviewId: string) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };

  const review = await prisma.midpointReview.findUnique({ where: { id: reviewId } });
  if (!review || review.clientId !== client.id) return { error: "Not found." };
  if (review.clientRequestedExploreAt) return { success: true }; // already requested, idempotent

  const headline = review.nextPhaseCategory === "MUSCLE_SUPPORT" ? "Muscle Support"
    : review.nextPhaseCategory === "FIRMNESS_SUPPORT" ? "Firmness Support"
    : review.nextPhaseCategory === "TISSUE_SUPPORT" ? "Tissue/Recovery Support"
    : review.nextPhaseCategory === "SYSTEM_EVOLUTION" ? "a System evolution"
    : "their next phase";

  const thread = await prisma.messageThread.upsert({ where: { clientId: client.id }, create: { clientId: client.id }, update: {} });
  await prisma.message.create({
    data: { threadId: thread.id, senderType: "CLIENT", body: `I'd like to explore ${headline} for the second half of my System (from my Midpoint Data).` },
  });

  await createNotification({
    clientId: client.id,
    category: "GENERAL",
    description: `${client.firstName} ${client.lastName} wants to explore ${headline} — Midpoint Next Phase`,
    linkUrl: `/hub/clients/${client.id}?tab=messages`,
  });

  await prisma.midpointReview.update({ where: { id: reviewId }, data: { clientRequestedExploreAt: new Date() } });
  revalidatePath("/portal/blueprint");
  return { success: true };
}
