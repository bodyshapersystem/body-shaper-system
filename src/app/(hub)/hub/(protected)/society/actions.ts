"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { sendSocietyApprovedEmail } from "@/lib/email/service";
import { generateUniqueCode, getLevels, levelFor, normalizeCode, paidReferralCount } from "@/lib/society";

async function guard() {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "payments.manage")) throw new Error("You don't have permission to manage the Shaper Society.");
  return user;
}

const done = () => {
  revalidatePath("/hub/society");
  return { success: true as const };
};

const money = (c: number) => `$${(c / 100).toFixed(0)}`;

/** Approve an application (or re-send the activation email). */
export async function approveParticipant(id: string) {
  await guard();
  const p = await prisma.societyParticipant.findUnique({ where: { id } });
  if (!p) return { error: "Not found." };
  const token = p.type === "EXTERNAL" && !p.authUserId ? randomBytes(24).toString("hex") : null;
  await prisma.societyParticipant.update({
    where: { id },
    data: { status: "ACTIVE", approvedAt: p.approvedAt ?? new Date(), ...(token ? { activationToken: token } : {}) },
  });
  if (p.type === "EXTERNAL") {
    await sendSocietyApprovedEmail({
      firstName: p.firstName,
      email: p.email,
      code: p.code,
      discountLabel: p.referralDiscountCents > 0 ? money(p.referralDiscountCents) : null,
      activationUrl: token ? `https://www.bodyshapersystem.com/society/activate?token=${token}` : "https://www.bodyshapersystem.com/society/login",
    });
  }
  return done();
}

export async function setParticipantStatus(id: string, status: "PAUSED" | "ACTIVE" | "REJECTED") {
  await guard();
  await prisma.societyParticipant.update({ where: { id }, data: { status } });
  return done();
}

export async function updateParticipant(id: string, formData: FormData) {
  await guard();
  const code = normalizeCode(String(formData.get("code") || ""));
  if (code.length < 3) return { error: "The code needs at least 3 letters or numbers." };
  const clash = await prisma.societyParticipant.findFirst({ where: { code, id: { not: id } } });
  if (clash) return { error: `The code ${code} is already used.` };
  const discount = Math.max(0, Math.round(Number(formData.get("discount") || 0) * 100));
  const overrideRaw = String(formData.get("percentOverride") || "").trim();
  const percentOverride = overrideRaw === "" ? null : Math.min(50, Math.max(0, Math.round(Number(overrideRaw))));
  await prisma.societyParticipant.update({
    where: { id },
    data: { code, referralDiscountCents: discount, percentOverride, internalNotes: String(formData.get("notes") || "").slice(0, 2000) || null },
  });
  return done();
}

/** Owner adds a collab / ambassador directly (already approved). */
export async function createParticipant(formData: FormData) {
  await guard();
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim() || null;
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!firstName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Name and a valid email are required." };
  if (await prisma.societyParticipant.findUnique({ where: { email } })) return { error: "That email is already in the Society." };
  const client = await prisma.client.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  const discount = Math.max(0, Math.round(Number(formData.get("discount") || 0) * 100));
  const p = await prisma.societyParticipant.create({
    data: {
      code: normalizeCode(String(formData.get("code") || "")) || (await generateUniqueCode(firstName)),
      type: client ? "CLIENT" : "EXTERNAL",
      status: "PENDING",
      firstName,
      lastName,
      email,
      phone: String(formData.get("phone") || "").trim() || null,
      instagram: String(formData.get("instagram") || "").trim() || null,
      clientId: client?.id ?? null,
      referralDiscountCents: discount,
    },
  });
  return approveParticipant(p.id);
}

export async function setCommissionStatus(id: string, status: "APPROVED" | "VOID" | "PENDING") {
  await guard();
  const c = await prisma.societyCommission.findUnique({ where: { id } });
  if (!c) return { error: "Not found." };
  if (c.status === "PAID") return { error: "This commission was already paid." };
  await prisma.societyCommission.update({
    where: { id },
    data: { status, approvedAt: status === "APPROVED" ? new Date() : null, ...(status !== "APPROVED" ? { payoutId: null } : {}) },
  });
  return done();
}

export async function markPayoutPaid(id: string) {
  await guard();
  const now = new Date();
  await prisma.$transaction([
    prisma.societyPayout.update({ where: { id }, data: { status: "PAID", paidAt: now } }),
    prisma.societyCommission.updateMany({ where: { payoutId: id }, data: { status: "PAID", paidAt: now } }),
  ]);
  return done();
}

/** Credit a lead/client to a participant (e.g. they came by DM, not the link). */
export async function attributeLead(formData: FormData) {
  await guard();
  const participantId = String(formData.get("participantId") || "");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const lead = await prisma.lead.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, orderBy: { createdAt: "desc" } });
  if (!lead) return { error: "No lead found with that email." };
  const p = await prisma.societyParticipant.findUnique({ where: { id: participantId } });
  if (!p) return { error: "Choose a participant." };
  if (p.email === lead.email.toLowerCase()) return { error: "A participant can't refer herself." };
  await prisma.lead.update({ where: { id: lead.id }, data: { societyParticipantId: p.id } });
  return done();
}

/** Commission for a package paid outside the proposal checkout (Zelle, in-Hub card, etc.). */
export async function addManualCommission(formData: FormData) {
  await guard();
  const participantId = String(formData.get("participantId") || "");
  const description = String(formData.get("description") || "").trim().slice(0, 160);
  const baseCents = Math.round(Number(formData.get("amount") || 0) * 100);
  if (!participantId || !description || baseCents <= 0) return { error: "Participant, description and paid amount are required." };
  const p = await prisma.societyParticipant.findUnique({ where: { id: participantId } });
  if (!p) return { error: "Participant not found." };
  const saleNumber = (await paidReferralCount(p.id)) + 1;
  const { current } = levelFor(await getLevels(), saleNumber);
  const percent = p.percentOverride ?? current.percent;
  await prisma.societyCommission.create({
    data: {
      participantId: p.id,
      description,
      baseCents,
      percent,
      amountCents: Math.round((baseCents * percent) / 100),
      saleNumber,
      levelName: p.percentOverride ? "custom" : current.name,
      status: "APPROVED",
      approvedAt: new Date(),
    },
  });
  return done();
}

export async function saveLevels(formData: FormData) {
  await guard();
  const rows: { name: string; minSales: number; percent: number }[] = [];
  for (let i = 0; i < 8; i++) {
    const name = String(formData.get(`name_${i}`) || "").trim();
    const minSales = Number(formData.get(`min_${i}`));
    const percent = Number(formData.get(`pct_${i}`));
    if (!name) continue;
    if (!Number.isFinite(minSales) || minSales < 1 || !Number.isFinite(percent) || percent < 0 || percent > 50) {
      return { error: `Check level "${name}" — referrals from 1, percent 0–50.` };
    }
    rows.push({ name, minSales: Math.floor(minSales), percent: Math.floor(percent) });
  }
  rows.sort((a, b) => a.minSales - b.minSales);
  if (rows.length === 0 || rows[0].minSales !== 1) return { error: "The first level must start at 1 referral." };
  await prisma.$transaction([
    prisma.societyLevel.deleteMany({}),
    prisma.societyLevel.createMany({ data: rows.map((r, i) => ({ ...r, sort: i + 1 })) }),
  ]);
  return done();
}
