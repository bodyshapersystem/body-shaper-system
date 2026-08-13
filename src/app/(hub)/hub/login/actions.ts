"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyTotpCode } from "@/lib/totp";

const TOTP_COOKIE = "hub_2fa_ok";

export async function loginHubUser(formData: FormData) {
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

  // Password alone is only the first factor if 2FA is enabled on this
  // account — the Supabase session is already live at this point, so
  // the protected layout is what actually blocks access to real pages
  // until the TOTP cookie below gets set on the verify screen.
  if (hubUser.totpEnabled) {
    redirect("/hub/login/verify-2fa");
  }

  redirect("/hub/dashboard");
}

export async function verifyTotpLogin(code: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { error: "Session expired — please sign in again." };

  const hubUser = await prisma.user.findUnique({ where: { authUserId: authUser.id } });
  if (!hubUser?.totpEnabled || !hubUser.totpSecret) {
    return { error: "2FA isn't enabled on this account." };
  }

  if (!verifyTotpCode(hubUser.totpSecret, code)) {
    return { error: "That code didn't match. Check the time on your phone and try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set(TOTP_COOKIE, hubUser.id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days — re-challenged only after a fresh login, not every page load
  });

  redirect("/hub/dashboard");
}

export async function logoutHubUser() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const cookieStore = await cookies();
  cookieStore.delete(TOTP_COOKIE);
  redirect("/hub/login");
}

/**
 * Called alongside "Sign out of all devices" (Settings → Security) —
 * that button revokes every Supabase session via the browser client,
 * but can't touch this server-set httpOnly cookie itself. Without
 * this, logging back in as the same user would skip the 2FA challenge
 * entirely, since the stale cookie still matches their user id.
 */
export async function clearTotpCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOTP_COOKIE);
}
