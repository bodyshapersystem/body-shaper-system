"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function loginPortalClient(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "Incorrect email or password." };
  }

  const portalUser = await prisma.user.findUnique({
    where: { authUserId: data.user.id },
    include: { role: true },
  });

  if (!portalUser || portalUser.role.name !== "Client") {
    await supabase.auth.signOut();
    return { error: "This account doesn't have portal access." };
  }

  if (portalUser.portalStatus === "INVITATION_PENDING") {
    await supabase.auth.signOut();
    return { error: "Please activate your account using the link sent to your email first." };
  }

  if (portalUser.portalStatus === "SUSPENDED") {
    await supabase.auth.signOut();
    return { error: "This account is suspended. Contact hello@bodyshapersystem.com." };
  }

  await prisma.user.update({ where: { id: portalUser.id }, data: { lastLoginAt: new Date() } });

  redirect("/portal/dashboard");
}

export async function logoutPortalClient() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/portal/login");
}
