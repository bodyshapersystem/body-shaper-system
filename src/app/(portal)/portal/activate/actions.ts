"use server";

import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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

  const admin = createSupabaseAdminClient();
  const { error: authError } = await admin.auth.admin.updateUserById(invite.client.user.authUserId, {
    password,
  });

  if (authError) return { error: authError.message };

  await prisma.$transaction([
    prisma.portalInvitation.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } }),
    prisma.user.update({ where: { id: invite.client.user.id }, data: { portalStatus: "ACTIVE" } }),
  ]);

  redirect("/portal/login?activated=1");
}
