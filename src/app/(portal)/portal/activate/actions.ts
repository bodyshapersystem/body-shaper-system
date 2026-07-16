"use server";

import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";
import { redirect } from "next/navigation";

export async function activatePortalAccount(token: string, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords don't match." };
  }

  const invite = await prisma.portalInvitation.findUnique({
    where: { token },
    include: { client: { include: { user: true } } },
  });

  if (!invite) return { error: "This activation link is invalid." };
  if (invite.acceptedAt) return { error: "This activation link has already been used. Please sign in." };
  if (invite.expiresAt < new Date()) return { error: "This activation link has expired. Contact hello@bodyshapersystem.com for a new one." };

  // Atomic single-use claim: only succeeds if no one else has already
  // claimed this exact invitation (acceptedAt still null) and it
  // hasn't expired in the moment between the read above and now.
  // This closes the race where a client double-clicks "Activate" or
  // opens the link in two tabs — only one request can ever win.
  const now = new Date();
  const claim = await prisma.portalInvitation.updateMany({
    where: { id: invite.id, acceptedAt: null, expiresAt: { gt: now } },
    data: { acceptedAt: now },
  });

  if (claim.count !== 1) {
    return { error: "This activation link is no longer valid. Please sign in, or ask for a new invitation." };
  }

  const admin = createSupabaseAdminClient();
  const { error: authError } = await admin.auth.admin.updateUserById(invite.client.user.authUserId, {
    password,
  });

  if (authError) {
    // The claim above already invalidated the link, but the password
    // set itself failed (e.g. a transient Supabase error) — roll the
    // claim back so the client's only activation link isn't burned by
    // something that wasn't their fault.
    await prisma.portalInvitation.update({ where: { id: invite.id }, data: { acceptedAt: null } });
    return { error: authError.message };
  }

  await prisma.user.update({ where: { id: invite.client.user.id }, data: { portalStatus: "ACTIVE" } });

  await createNotification({
    clientId: invite.client.id,
    category: "PORTAL",
    description: `${invite.client.firstName} ${invite.client.lastName} activated their Client Portal`,
    linkUrl: `/hub/clients/${invite.client.id}`,
  });

  redirect("/portal/login?activated=1");
}
