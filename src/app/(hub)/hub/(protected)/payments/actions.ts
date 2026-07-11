"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import type { PaymentMethod, PaymentRecordStatus } from "@prisma/client";

export async function createPayment(formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "payments.manage")) {
    return { error: "You don't have permission to record payments." };
  }

  const clientId = String(formData.get("clientId") || "");
  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") || "CARD") as PaymentMethod;
  const status = String(formData.get("status") || "PENDING") as PaymentRecordStatus;
  const notes = (formData.get("notes") as string) || undefined;

  if (!clientId || !Number.isFinite(amount) || amount <= 0) {
    return { error: "Client and a valid amount are required." };
  }

  await prisma.payment.create({
    data: {
      clientId,
      amountCents: Math.round(amount * 100),
      method,
      status,
      paidAt: status === "PAID" ? new Date() : undefined,
      notes,
      createdById: user.id,
    },
  });

  revalidatePath("/hub/payments");
  revalidatePath("/hub/dashboard");
  return { success: true };
}

export async function updatePaymentStatus(paymentId: string, status: PaymentRecordStatus) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "payments.manage")) {
    return { error: "You don't have permission to update payments." };
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status, paidAt: status === "PAID" ? new Date() : undefined },
  });

  revalidatePath("/hub/payments");
  revalidatePath("/hub/dashboard");
  return { success: true };
}
