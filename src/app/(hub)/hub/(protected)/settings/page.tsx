import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { updateBusinessSettings, updateOwnProfile } from "./actions";

export const dynamic = "force-dynamic";

export default async function HubSettingsPage() {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");

  const business = await prisma.businessSettings.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });

  const canManageBusiness = hasPermission(user, "settings.manage");

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Administration</p>
        <h1>settings.</h1>
      </div>

      <h3 style={{ fontSize: 14, marginBottom: 12 }}>Your Profile</h3>
      <form
        action={async (formData: FormData) => {
          "use server";
          await updateOwnProfile(formData);
        }}
        style={{ display: "flex", gap: 10, marginBottom: 36, maxWidth: 480 }}
      >
        <input name="fullName" defaultValue={user.fullName} style={{ padding: 10, flex: 1 }} />
        <button type="submit" className="auth-submit" style={{ width: "auto", padding: "10px 20px" }}>
          Save
        </button>
      </form>
      <p style={{ fontSize: 13, opacity: 0.6, marginTop: -24, marginBottom: 36 }}>Email: {user.email} · Role: {user.role.name}</p>

      <h3 style={{ fontSize: 14, marginBottom: 12 }}>Business Information</h3>
      {canManageBusiness ? (
        <form
          action={async (formData: FormData) => {
            "use server";
            await updateBusinessSettings(formData);
          }}
          style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 480 }}
        >
          <input name="businessName" defaultValue={business.businessName} placeholder="Business name" style={{ padding: 10 }} />
          <input name="contactEmail" defaultValue={business.contactEmail ?? ""} placeholder="Contact email" style={{ padding: 10 }} />
          <input name="contactPhone" defaultValue={business.contactPhone ?? ""} placeholder="Contact phone" style={{ padding: 10 }} />
          <input name="address" defaultValue={business.address ?? ""} placeholder="Address" style={{ padding: 10 }} />
          <label style={{ fontSize: 13 }}>
            <span style={{ display: "block", fontSize: 11, opacity: 0.6, marginBottom: 4 }}>
              "Exclusive Courtesy" full-payment discount ($, leave blank to disable)
            </span>
            <input
              name="fullPaymentDiscount"
              type="number"
              step="0.01"
              defaultValue={business.fullPaymentDiscountCents ? (business.fullPaymentDiscountCents / 100).toFixed(2) : ""}
              placeholder="e.g. 120"
              style={{ padding: 10, width: "100%" }}
            />
          </label>
          <button type="submit" className="auth-submit" style={{ width: "auto", padding: "10px 20px" }}>
            Save
          </button>
        </form>
      ) : (
        <div style={{ fontSize: 13.5, opacity: 0.75 }}>
          <p>{business.businessName}</p>
          <p>{business.contactEmail}</p>
          <p>{business.contactPhone}</p>
          <p>{business.address}</p>
        </div>
      )}
    </div>
  );
}
