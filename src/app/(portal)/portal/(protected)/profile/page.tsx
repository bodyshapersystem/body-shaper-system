import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import PortalAvatarUploadWidget from "./PortalAvatarUploadWidget";
import PortalEditProfileSheet from "./PortalEditProfileSheet";
import PortalPasswordChangeSheet from "./PortalPasswordChangeSheet";
import PortalNotificationForm from "./PortalNotificationForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const user = await prisma.user.findUnique({ where: { id: client.userId } });
  if (!user) redirect("/portal/login");

  let avatarUrl: string | null = null;
  if (user.avatarStoragePath) {
    const admin = createSupabaseAdminClient();
    const { data } = await admin.storage.from("client-documents").createSignedUrl(user.avatarStoragePath, 60 * 60);
    avatarUrl = data?.signedUrl ?? null;
  }

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">your account</p>
        <h1>profile.</h1>
        <p className="portal-page-sub">Manage your information and preferences.</p>
      </div>

      {/* ---------- Account ---------- */}
      <div className="pd-card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 16 }}>Account</h3>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
          <div className="settings-logo-frame" style={{ borderRadius: "50%" }}>
            {avatarUrl ? <img src={avatarUrl} alt={client.firstName} /> : <span>{client.firstName[0]}</span>}
          </div>
          <PortalAvatarUploadWidget />
        </div>
        <div className="cl-summary-list" style={{ marginBottom: 16 }}>
          <div className="cl-summary-row"><span>Name</span><span>{client.firstName} {client.lastName}</span></div>
          <div className="cl-summary-row"><span>Email</span><span>{client.email}</span></div>
          <div className="cl-summary-row"><span>Phone</span><span>{client.phone ?? "Not set"}</span></div>
          <div className="cl-summary-row"><span>Member Since</span><span>{client.createdAt.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span></div>
          <div className="cl-summary-row"><span>Tier</span><span>{client.rewardsAccount?.tier ?? "Standard"}</span></div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <PortalEditProfileSheet phone={client.phone ?? ""} />
          <PortalPasswordChangeSheet />
        </div>
      </div>

      {/* ---------- Preferences ---------- */}
      <div className="pd-card">
        <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 4 }}>Preferences</h3>
        <PortalNotificationForm emailNotifications={user.emailNotifications} />
      </div>
    </div>
  );
}
