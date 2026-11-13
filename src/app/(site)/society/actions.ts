"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentPortalClient } from "@/lib/permissions";
import { createNotification } from "@/lib/notifications";
import { sendSocietyApplicationEmails } from "@/lib/email/service";
import { AGREEMENT_VERSION, MIN_PAYOUT_CENTS, generateUniqueCode } from "@/lib/society";

/** The signed-in participant: a portal client's membership, or an external's own login. */
export async function getCurrentSocietyParticipant() {
  const client = await getCurrentPortalClient().catch(() => null);
  if (client) return prisma.societyParticipant.findUnique({ where: { clientId: client.id } });
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.societyParticipant.findUnique({ where: { authUserId: user.id } });
}

/* ---------- externals: apply / activate / login ---------- */

export async function applyToSociety(formData: FormData) {
  if (formData.get("website")) return { success: true }; // honeypot
  const firstName = String(formData.get("firstName") || "").trim().slice(0, 80);
  const lastName = String(formData.get("lastName") || "").trim().slice(0, 80);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim().slice(0, 40) || null;
  const instagram = String(formData.get("instagram") || "").trim().slice(0, 80) || null;
  const note = String(formData.get("note") || "").trim().slice(0, 1000) || null;
  if (!firstName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter your name and a valid email." };

  const existing = await prisma.societyParticipant.findUnique({ where: { email } });
  if (existing) return { error: "We already have an application with this email — we'll be in touch soon." };

  const client = await prisma.client.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (client) return { error: "You're already a client — join the Shaper Society from your Client Portal (Invite & Earn)." };

  await prisma.societyParticipant.create({
    data: { code: await generateUniqueCode(firstName), type: "EXTERNAL", status: "PENDING", firstName, lastName, email, phone, instagram, applicationNote: note },
  });
  await createNotification({ category: "GENERAL", description: `New Shaper Society application: ${firstName} ${lastName}`, linkUrl: "/hub/society" });
  await sendSocietyApplicationEmails({ firstName, lastName, email, phone, instagram, note });
  return { success: true };
}

export async function activateSocietyAccount(formData: FormData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  if (password.length < 8) return { error: "Use at least 8 characters." };
  const participant = token ? await prisma.societyParticipant.findUnique({ where: { activationToken: token } }) : null;
  if (!participant || participant.status !== "ACTIVE") return { error: "This link is no longer valid. Contact us and we'll send a new one." };

  const admin = createSupabaseAdminClient();
  let authUserId = participant.authUserId;
  if (authUserId) {
    const { error } = await admin.auth.admin.updateUserById(authUserId, { password });
    if (error) return { error: "We couldn't set your password. Please try again." };
  } else {
    const { data, error } = await admin.auth.admin.createUser({ email: participant.email, password, email_confirm: true });
    if (error || !data.user) {
      // The email may already have an auth account (e.g. a past client) — link it.
      const { data: list } = await admin.auth.admin.listUsers();
      const found = list?.users.find((u) => u.email?.toLowerCase() === participant.email.toLowerCase());
      if (!found) return { error: "We couldn't create your login. Please contact us." };
      await admin.auth.admin.updateUserById(found.id, { password });
      authUserId = found.id;
    } else {
      authUserId = data.user.id;
    }
  }
  await prisma.societyParticipant.update({ where: { id: participant.id }, data: { authUserId, activationToken: null } });

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signInWithPassword({ email: participant.email, password });
  redirect("/society/dashboard");
}

export async function loginSociety(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Email and password are required." };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "Incorrect email or password." };
  const participant = await prisma.societyParticipant.findUnique({ where: { authUserId: data.user.id } });
  if (!participant) {
    await supabase.auth.signOut();
    return { error: "This account isn't part of the Shaper Society. Clients: use Invite & Earn in your Client Portal." };
  }
  if (participant.status !== "ACTIVE") {
    await supabase.auth.signOut();
    return { error: "Your membership is not active right now. Contact us for help." };
  }
  redirect("/society/dashboard");
}

export async function logoutSociety() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/society/login");
}

/* ---------- clients: join from the portal ---------- */

export async function joinSocietyAsClient(formData: FormData) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Please sign in to your Client Portal first." };
  if (formData.get("agree") !== "on") return { error: "Please accept the Shaper Society Agreement." };
  const existing = await prisma.societyParticipant.findFirst({ where: { OR: [{ clientId: client.id }, { email: client.email.toLowerCase() }] } });
  if (existing) {
    await prisma.societyParticipant.update({
      where: { id: existing.id },
      data: { clientId: client.id, agreementVersion: AGREEMENT_VERSION, agreementAcceptedAt: new Date() },
    });
  } else {
    await prisma.societyParticipant.create({
      data: {
        code: await generateUniqueCode(client.firstName),
        type: "CLIENT",
        status: "ACTIVE",
        approvedAt: new Date(),
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email.toLowerCase(),
        phone: client.phone,
        clientId: client.id,
        agreementVersion: AGREEMENT_VERSION,
        agreementAcceptedAt: new Date(),
      },
    });
    await createNotification({ clientId: client.id, category: "GENERAL", description: `${client.firstName} ${client.lastName} joined the Shaper Society`, linkUrl: "/hub/society" });
  }
  revalidatePath("/portal/invite");
  return { success: true };
}

/* ---------- shared: agreement, payout details, payout request ---------- */

export async function acceptSocietyAgreement() {
  const p = await getCurrentSocietyParticipant();
  if (!p) return { error: "Please sign in." };
  await prisma.societyParticipant.update({ where: { id: p.id }, data: { agreementVersion: AGREEMENT_VERSION, agreementAcceptedAt: new Date() } });
  revalidatePath("/society/dashboard");
  revalidatePath("/portal/invite");
  return { success: true };
}

export async function updateSocietyPayoutDetails(formData: FormData) {
  const p = await getCurrentSocietyParticipant();
  if (!p) return { error: "Please sign in." };
  const method = String(formData.get("payoutMethod") || "").slice(0, 20) || null;
  const handle = String(formData.get("payoutHandle") || "").trim().slice(0, 120) || null;
  await prisma.societyParticipant.update({ where: { id: p.id }, data: { payoutMethod: method, payoutHandle: handle } });
  revalidatePath("/society/dashboard");
  revalidatePath("/portal/invite");
  return { success: true };
}

export async function requestSocietyPayout() {
  const p = await getCurrentSocietyParticipant();
  if (!p || p.status !== "ACTIVE") return { error: "Please sign in." };
  if (!p.payoutMethod || !p.payoutHandle) return { error: "Add how you'd like to be paid first." };
  if (await prisma.societyPayout.findFirst({ where: { participantId: p.id, status: "REQUESTED" } })) {
    return { error: "You already have a payout request in progress." };
  }
  const ready = await prisma.societyCommission.findMany({ where: { participantId: p.id, status: "APPROVED", payoutId: null } });
  const amountCents = ready.reduce((s, c) => s + c.amountCents, 0);
  if (amountCents < MIN_PAYOUT_CENTS) return { error: `Payouts start at $${MIN_PAYOUT_CENTS / 100} in approved commissions.` };
  const payout = await prisma.societyPayout.create({
    data: { participantId: p.id, amountCents, method: p.payoutMethod, handle: p.payoutHandle },
  });
  await prisma.societyCommission.updateMany({ where: { id: { in: ready.map((c) => c.id) } }, data: { payoutId: payout.id } });
  await createNotification({ category: "PAYMENTS", description: `Shaper Society payout request: ${p.firstName} — $${(amountCents / 100).toFixed(2)} via ${p.payoutMethod}`, linkUrl: "/hub/society" });
  revalidatePath("/society/dashboard");
  revalidatePath("/portal/invite");
  return { success: true };
}
