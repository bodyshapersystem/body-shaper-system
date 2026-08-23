"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
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
