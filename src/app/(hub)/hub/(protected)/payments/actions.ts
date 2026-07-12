"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import type { PaymentMethod, PaymentRecordStatus, PaymentType, PaymentOrigin } from "@prisma/client";

export async function createPayment(formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "payments.manage")) {
    return { error: "You don't have permission to record payments." };
  }

  const clientId = String(formData.get("clientId") || "");
  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") || "CARD") as PaymentMethod;
  const status = String(formData.get("status") || "PAID") as PaymentRecordStatus;
  const paymentType = (formData.get("paymentType") as string) || undefined;
  const origin = String(formData.get("origin") || "CLIENT_PAYMENT") as PaymentOrigin;
  const reference = (formData.get("reference") as string) || undefined;
  const notes = (formData.get("notes") as string) || undefined;

  if (!clientId || !Number.isFinite(amount) || amount <= 0) {
    return { error: "Client and a valid amount are required." };
  }

  const payment = await prisma.payment.create({
    data: {
      clientId,
      amountCents: Math.round(amount * 100),
      method,
      status,
      paymentType: paymentType ? (paymentType as PaymentType) : undefined,
      origin,
      reference,
      paidAt: status === "PAID" ? new Date() : undefined,
      notes,
      createdById: user.id,
    },
  });

  revalidatePath("/hub/payments");
  revalidatePath("/hub/dashboard");
  return { success: true, paymentId: payment.id };
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

/**
 * Real financial summary for one client — no invented numbers. Total
 * Plan comes from the active Blueprint Assessment's planTotalCents
 * (null/"Not set" until the Owner enters it — package prices are
 * dynamic, never hardcoded here). Paid/Balance are computed from
 * actual recorded Payment rows.
 */
export async function getClientFinancialSummary(clientId: string) {
  const user = await getCurrentHubUser();
  if (!user) return null;

  const [client, paidAgg, pendingAgg, completedSessionCount] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      include: {
        blueprintAssessments: {
          where: { status: { in: ["ACTIVE", "BASELINE_PENDING", "BASELINE_COMPLETED", "VALIDATED", "IN_PROGRESS", "COMPLETED"] } },
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    }),
    prisma.payment.aggregate({ where: { clientId, status: "PAID" }, _sum: { amountCents: true } }),
    prisma.payment.aggregate({ where: { clientId, status: "PENDING" }, _sum: { amountCents: true } }),
    prisma.appointment.count({ where: { clientId, status: "COMPLETED" } }),
  ]);

  if (!client) return null;

  const assessment = client.blueprintAssessments[0];
  const totalSessions = assessment?.validatedSessionCount ?? 8;
  const currentSession = Math.min(completedSessionCount + 1, totalSessions);
  const planTotalCents = assessment?.planTotalCents ?? null;
  const paidCents = paidAgg._sum.amountCents ?? 0;
  const pendingCents = pendingAgg._sum.amountCents ?? 0;
  const balanceCents = planTotalCents !== null ? Math.max(planTotalCents - paidCents, 0) : null;

  return {
    assessmentId: assessment?.id ?? null,
    firstName: client.firstName,
    lastName: client.lastName,
    system: assessment?.recommendedSystem ?? null,
    currentSession,
    totalSessions,
    planTotalCents,
    paidCents,
    pendingCents,
    balanceCents,
  };
}

export async function updatePlanTotal(assessmentId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "payments.manage")) {
    return { error: "You don't have permission to set plan pricing." };
  }

  const amount = Number(formData.get("planTotal"));
  if (!Number.isFinite(amount) || amount < 0) {
    return { error: "Enter a valid plan total." };
  }

  await prisma.blueprintAssessment.update({
    where: { id: assessmentId },
    data: { planTotalCents: Math.round(amount * 100) },
  });

  revalidatePath("/hub/payments");
  return { success: true };
}

/**
 * Financial Overview widgets — every number here is a real aggregate
 * query. No invented calculations (e.g. no fabricated growth %, no
 * projected revenue).
 */
export async function getFinancialOverview() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalCollected, collectedThisMonth, pendingBalance, refunds, distinctPayingClients] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amountCents: true } }),
    prisma.payment.aggregate({ where: { status: "PAID", paidAt: { gte: startOfMonth } }, _sum: { amountCents: true } }),
    prisma.payment.aggregate({ where: { status: "PENDING" }, _sum: { amountCents: true } }),
    prisma.payment.aggregate({ where: { status: "REFUNDED" }, _sum: { amountCents: true } }),
    prisma.payment.groupBy({ by: ["clientId"], where: { status: "PAID" } }),
  ]);

  const totalCollectedCents = totalCollected._sum.amountCents ?? 0;
  const payingClientCount = distinctPayingClients.length;
  const averageClientValueCents = payingClientCount > 0 ? Math.round(totalCollectedCents / payingClientCount) : 0;

  return {
    totalCollectedCents,
    collectedThisMonthCents: collectedThisMonth._sum.amountCents ?? 0,
    pendingBalanceCents: pendingBalance._sum.amountCents ?? 0,
    refundsCents: refunds._sum.amountCents ?? 0,
    averageClientValueCents,
  };
}

/**
 * Reads the configurable "Exclusive Courtesy" full-payment discount
 * (set in Settings, never hardcoded here). Returns null when the
 * Owner hasn't configured one — the UI simply doesn't show the card
 * in that case, rather than fabricating a default discount.
 */
export async function getFullPaymentDiscount() {
  const settings = await prisma.businessSettings.findUnique({ where: { id: "default" } });
  return settings?.fullPaymentDiscountCents ?? null;
}
