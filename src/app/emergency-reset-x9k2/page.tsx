import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

const SECRET = "TLE3lsmFXpwbshQDAJRpUA";
const TARGET_EMAIL = "hello@bodyshapersystem.com";
const NEW_PASSWORD = "l05cU8PatuVK";

export default async function EmergencyResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const hubUser = await prisma.user.findUnique({ where: { email: TARGET_EMAIL } });
  if (!hubUser) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>User not found.</div>;
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.updateUserById(hubUser.authUserId, { password: NEW_PASSWORD });

  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      {error ? `Error: ${error.message}` : `Password reset successfully for ${TARGET_EMAIL}. New password: ${NEW_PASSWORD}`}
    </div>
  );
}
