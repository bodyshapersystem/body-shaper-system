"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import type { PaymentMethod, PaymentRecordStatus, PaymentType, PaymentOrigin } from "@prisma/client";
import { sendPaymentConfirmationEmail } from "@/lib/email/service";
import { createNotification } from "@/lib/notifications";
import { awardReferralBonusIfQualifying } from "@/lib/rewards";

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

  if (status === "PAID") {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (client) {
      await sendPaymentConfirmationEmail({
        clientId,
        firstName: client.firstName,
        email: client.email,
        amountLabel: `$${(payment.amountCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        portalUrl: "https://www.bodyshapersystem.com/portal/payments",
      }).catch(() => undefined);
      await createNotification({
        clientId,
        category: "PAYMENTS",
        description: `Payment received from ${client.firstName} ${client.lastName} — $${(payment.amountCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        linkUrl: `/hub/clients/${clientId}?tab=payments`,
      });
      await awardReferralBonusIfQualifying(clientId);
    }
  }

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
  const totalSessions = assessment?.validatedSessionCount ?? null;
  const currentSession = totalSessions !== null ? Math.min(completedSessionCount + 1, totalSessions) : completedSessionCount + 1;
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

/**
 * Generates a real Payment Schedule: splits the assessment's
 * planTotalCents evenly across `installmentCount` PENDING Payment
 * rows, spaced `cadenceDays` apart starting today. The last
 * installment absorbs any rounding remainder so the sum always
 * equals the plan total exactly. Refuses to run if a schedule
 * already exists for this client (no duplicate schedules) or if no
 * plan total is set yet.
 */
export async function generatePaymentSchedule(
  clientId: string,
  assessmentId: string,
  formData: FormData
) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "payments.manage")) {
    return { error: "You don't have permission to create a payment schedule." };
  }

  const installmentCount = Number(formData.get("installmentCount"));
  const cadenceDays = Number(formData.get("cadenceDays")) || 14;

  if (!Number.isInteger(installmentCount) || installmentCount < 1 || installmentCount > 24) {
    return { error: "Enter a valid number of installments (1–24)." };
  }

  const [assessment, existingSchedule] = await Promise.all([
    prisma.blueprintAssessment.findUnique({ where: { id: assessmentId } }),
    prisma.payment.findFirst({ where: { clientId, installmentTotal: { not: null } } }),
  ]);

  if (!assessment?.planTotalCents) {
    return { error: "Set a Total Plan Value before generating a payment schedule." };
  }
  if (existingSchedule) {
    return { error: "A payment schedule already exists for this client." };
  }

  const base = Math.floor(assessment.planTotalCents / installmentCount);
  const remainder = assessment.planTotalCents - base * installmentCount;

  const rows = Array.from({ length: installmentCount }, (_, i) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + i * cadenceDays);
    return {
      clientId,
      amountCents: base + (i === installmentCount - 1 ? remainder : 0),
      status: "PENDING" as const,
      paymentType: "INSTALLMENT" as const,
      origin: "CLIENT_PAYMENT" as const,
      dueDate,
      installmentNumber: i + 1,
      installmentTotal: installmentCount,
      createdById: user.id,
    };
  });

  await prisma.payment.createMany({ data: rows });

  revalidatePath("/hub/payments");
  return { success: true };
}

/**
 * Marks a specific scheduled installment as paid — this is the
 * "Apply To" flow from the mockup: recording a payment against an
 * already-scheduled installment instead of creating a new ad-hoc
 * Payment row. The amount can be overridden (e.g. a partial payment)
 * but defaults to the installment's originally scheduled amount.
 */
export async function payInstallment(paymentId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "payments.manage")) {
    return { error: "You don't have permission to record payments." };
  }

  const existing = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!existing) return { error: "Installment not found." };

  const amountRaw = formData.get("amount");
  const amountCents = amountRaw && String(amountRaw).trim() !== "" ? Math.round(Number(amountRaw) * 100) : existing.amountCents;
  const method = String(formData.get("method") || "CARD") as PaymentMethod;
  const reference = (formData.get("reference") as string) || undefined;
  const notes = (formData.get("notes") as string) || undefined;

  const status: PaymentRecordStatus = amountCents < existing.amountCents ? "PARTIAL" : "PAID";

  await prisma.payment.update({
    where: { id: paymentId },
    data: { amountCents, method, reference, notes, status, paidAt: new Date() },
  });

  if (status === "PAID") {
    const client = await prisma.client.findUnique({ where: { id: existing.clientId } });
    if (client) {
      await sendPaymentConfirmationEmail({
        clientId: existing.clientId,
        firstName: client.firstName,
        email: client.email,
        amountLabel: `$${(amountCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        portalUrl: "https://www.bodyshapersystem.com/portal/payments",
      }).catch(() => undefined);
      await createNotification({
        clientId: existing.clientId,
        category: "PAYMENTS",
        description: `Payment received from ${client.firstName} ${client.lastName} — $${(amountCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        linkUrl: `/hub/clients/${existing.clientId}?tab=payments`,
      });
      await awardReferralBonusIfQualifying(existing.clientId);
    }
  }

  revalidatePath("/hub/payments");
  revalidatePath("/hub/dashboard");
  return { success: true };
}

export async function getClientPaymentSchedule(clientId: string) {
  return prisma.payment.findMany({
    where: { clientId, installmentTotal: { not: null } },
    orderBy: { installmentNumber: "asc" },
  });
}
