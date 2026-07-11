"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function loginHubUser(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    console.error("[DEBUG loginHubUser] Supabase auth error:", error?.message, error?.status, error?.code);
    return { error: "Incorrect email or password." };
  }

  // Confirm this auth user has a corresponding Hub `users` row with an
  // active, non-Client role. Someone can have valid Supabase Auth
  // credentials (e.g. a future portal client) without Hub access —
  // that's a separate, deliberate check, not implied by a successful
  // Supabase sign-in.
  const hubUser = await prisma.user.findUnique({
    where: { authUserId: data.user.id },
    include: { role: true },
  });

  if (!hubUser || hubUser.status !== "ACTIVE" || hubUser.role.name === "Client") {
    await supabase.auth.signOut();
    return { error: "This account doesn't have Hub access." };
  }

  await prisma.user.update({
    where: { id: hubUser.id },
    data: { lastLoginAt: new Date() },
  });

  redirect("/hub/dashboard");
}

export async function logoutHubUser() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/hub/login");
}
