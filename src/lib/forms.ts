import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma, FormType, FormStatus } from "@prisma/client";

/**
 * Administrative form documentation — Prepare for Your Experience,
 * Treatment Waiver, and future forms (medical updates, consent, etc).
 * Deliberately separate from Blueprint Assessment™: this is
 * paperwork, not the clinical/strategic journey. Adding a new form
 * type later is one FormType enum value — never a new table.
 */

export async function createFormSubmission(params: {
  clientId: string;
  formType: FormType;
  status?: FormStatus;
  jotformSubmissionId?: string;
  rawData?: Prisma.InputJsonValue;
  completedAt?: Date;
}) {
  return prisma.formSubmission.create({
    data: {
      clientId: params.clientId,
      formType: params.formType,
      status: params.status ?? "COMPLETED",
      jotformSubmissionId: params.jotformSubmissionId,
      rawData: params.rawData,
      completedAt: params.completedAt ?? new Date(),
    },
  });
}

export async function getClientForms(clientId: string) {
  return prisma.formSubmission.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getClientFormsByType(clientId: string, formType: FormType) {
  return prisma.formSubmission.findMany({
    where: { clientId, formType },
    orderBy: { version: "desc" },
  });
}
