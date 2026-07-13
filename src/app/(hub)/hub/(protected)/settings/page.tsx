import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { updatePreferences, updateNotificationPreferences, getBusinessLogoUrl } from "./actions";
import EditBusinessInfoSheet from "./EditBusinessInfoSheet";
import EditProfileSheet from "./EditProfileSheet";
import PasswordChangeSheet from "./PasswordChangeSheet";
import LogoUploadWidget from "./LogoUploadWidget";
import LogOutAllDevicesButton from "./LogOutAllDevicesButton";

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

  // ---------- Platform Status: real checks only ----------
  let databaseConnected = true;
  try {
    await prisma.user.count();
  } catch {
    databaseConnected = false;
  }
  const emailServiceActive = !!process.env.RESEND_API_KEY;
  const jotformConnected = !!process.env.JOTFORM_API_KEY && !!process.env.JOTFORM_WEBHOOK_SECRET;

  const logoUrl = business.logoStoragePath ? await getBusinessLogoUrl(business.logoStoragePath) : null;

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Administration</p>
        <h1>settings.</h1>
        <p className="dash-subtitle">Manage your account, business preferences and integrations.</p>
      </div>

      {/* ---------- Platform Status ---------- */}
      <div className="pd-card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 16 }}>Platform Status</h3>
        <div className="settings-status-grid">
          <div className="settings-status-item">
            <span className={`doc-check-dot done`}>✓</span>
            <div>
              <strong>Website</strong>
              <p className="pay-history-meta">Online</p>
            </div>
          </div>
          <div className="settings-status-item">
            <span className={databaseConnected ? "doc-check-dot done" : "doc-check-dot"}>{databaseConnected ? "✓" : "!"}</span>
            <div>
              <strong>Database</strong>
              <p className="pay-history-meta">{databaseConnected ? "Connected" : "Unreachable"}</p>
            </div>
          </div>
          <div className="settings-status-item">
            <span className={emailServiceActive ? "doc-check-dot done" : "doc-check-dot"}>{emailServiceActive ? "✓" : "!"}</span>
            <div>
              <strong>Email Service</strong>
              <p className="pay-history-meta">{emailServiceActive ? "Active" : "Not configured"}</p>
            </div>
          </div>
          <div className="settings-status-item">
            <span className="bp-status-chip bp-status-chip-baseline_pending" style={{ fontSize: 10 }}>
              Paused
            </span>
            <div>
              <strong>RENPHO Integration</strong>
              <p className="pay-history-meta">Development paused</p>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-grid">
        {/* ---------- Business Information ---------- */}
        <div className="pd-card">
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 16 }}>Business Information</h3>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
            <div className="settings-logo-frame">
              {logoUrl ? <img src={logoUrl} alt="Business logo" /> : <span>Logo</span>}
            </div>
            <div className="cl-summary-list" style={{ flex: 1 }}>
              <div className="cl-summary-row">
                <span>Business Name</span>
                <span>{business.businessName}</span>
              </div>
              <div className="cl-summary-row">
                <span>Business Email</span>
                <span>{business.contactEmail ?? "Not set"}</span>
              </div>
              <div className="cl-summary-row">
                <span>Phone</span>
                <span>{business.contactPhone ?? "Not set"}</span>
              </div>
              <div className="cl-summary-row">
                <span>Website</span>
                <span>{business.website ?? "Not set"}</span>
              </div>
              <div className="cl-summary-row">
                <span>Address</span>
                <span>{business.address ?? "Not set"}</span>
              </div>
              <div className="cl-summary-row">
                <span>Time Zone</span>
                <span>{business.timezone}</span>
              </div>
            </div>
          </div>
          {canManageBusiness && (
            <div style={{ display: "flex", gap: 10 }}>
              <LogoUploadWidget />
              <EditBusinessInfoSheet
                businessName={business.businessName}
                contactEmail={business.contactEmail ?? ""}
                contactPhone={business.contactPhone ?? ""}
                address={business.address ?? ""}
                website={business.website ?? ""}
                timezone={business.timezone}
                fullPaymentDiscount={business.fullPaymentDiscountCents ? (business.fullPaymentDiscountCents / 100).toFixed(2) : ""}
              />
            </div>
          )}
        </div>

        {/* ---------- Owner Account ---------- */}
        <div className="pd-card">
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 16 }}>Owner Account</h3>
          <div className="cl-summary-list" style={{ marginBottom: 16 }}>
            <div className="cl-summary-row">
              <span>Name</span>
              <span>{user.fullName}</span>
            </div>
            <div className="cl-summary-row">
              <span>Email</span>
              <span>{user.email}</span>
            </div>
            <div className="cl-summary-row">
              <span>Phone</span>
              <span>{user.phone ?? "Not set"}</span>
            </div>
            <div className="cl-summary-row">
              <span>Role</span>
              <span>{user.role.name}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <EditProfileSheet fullName={user.fullName} phone={user.phone ?? ""} />
            <PasswordChangeSheet />
          </div>
        </div>

        {/* ---------- Notifications ---------- */}
        <div className="pd-card">
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 4 }}>Notifications</h3>
          <p className="pay-history-meta" style={{ marginBottom: 16 }}>
            Saved to your account. Not yet wired to every email trigger in the system — see note below.
          </p>
          <form
            action={async (formData: FormData) => {
              "use server";
              await updateNotificationPreferences(formData);
            }}
          >
            <div className="settings-toggle-list">
              {(
                [
                  { name: "emailNotifications", label: "Email Notifications", checked: user.emailNotifications },
                  { name: "appointmentReminders", label: "Appointment Reminders", checked: user.appointmentReminders },
                  { name: "paymentNotifications", label: "Payment Notifications", checked: user.paymentNotifications },
                  { name: "leadNotifications", label: "Lead Notifications", checked: user.leadNotifications },
                  { name: "weeklyReports", label: "Weekly Reports", checked: user.weeklyReports },
                ] as const
              ).map((item) => (
                <label key={item.name} className="settings-toggle-row">
                  <span>{item.label}</span>
                  <span className="settings-toggle">
                    <input type="checkbox" name={item.name} defaultChecked={item.checked} />
                    <span className="settings-toggle-track" />
                  </span>
                </label>
              ))}
            </div>
            <button type="submit" className="dash-view-btn" style={{ marginTop: 16 }}>
              Save
            </button>
          </form>
        </div>

        {/* ---------- Integrations ---------- */}
        <div className="pd-card">
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 16 }}>Integrations</h3>
          <p className="pay-history-meta" style={{ marginBottom: 12 }}>
            Only integrations that are actually connected in this system are shown here.
          </p>
          <div className="settings-integration-grid">
            <div className="settings-integration-card">
              <strong>Jotform</strong>
              <span className={jotformConnected ? "dash-status dash-status-active" : "dash-status"}>
                {jotformConnected ? "Connected" : "Not Connected"}
              </span>
            </div>
            <div className="settings-integration-card">
              <strong>Email (Resend)</strong>
              <span className={emailServiceActive ? "dash-status dash-status-active" : "dash-status"}>
                {emailServiceActive ? "Connected" : "Not Connected"}
              </span>
            </div>
            <div className="settings-integration-card">
              <strong>RENPHO</strong>
              <span className="dash-status dash-status-paused">Paused</span>
            </div>
          </div>
        </div>

        {/* ---------- Preferences ---------- */}
        <div className="pd-card">
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 4 }}>Preferences</h3>
          <p className="pay-history-meta" style={{ marginBottom: 16 }}>
            Saved, though not every screen in the Hub reads these yet (dates/currency are still shown in a fixed format in most places).
          </p>
          <form
            action={async (formData: FormData) => {
              "use server";
              await updatePreferences(formData);
            }}
            className="bp-sheet-form"
          >
            <label className="sched-label">
              Language
              <select name="language" defaultValue={business.language} className="sched-select">
                <option>English</option>
                <option>Español</option>
              </select>
            </label>
            <label className="sched-label">
              Measurement Units
              <select name="measurementUnits" defaultValue={business.measurementUnits} className="sched-select">
                <option value="Imperial">Imperial (lbs / inches)</option>
                <option value="Metric">Metric (kg / cm)</option>
              </select>
            </label>
            <label className="sched-label">
              Currency
              <select name="currency" defaultValue={business.currency} className="sched-select">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </label>
            <label className="sched-label">
              Date Format
              <select name="dateFormat" defaultValue={business.dateFormat} className="sched-select">
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              </select>
            </label>
            <label className="sched-label">
              Week Starts On
              <select name="weekStartsOn" defaultValue={business.weekStartsOn} className="sched-select">
                <option>Monday</option>
                <option>Sunday</option>
              </select>
            </label>
            <button type="submit" className="dash-view-btn" style={{ width: "fit-content" }}>
              Save
            </button>
          </form>
        </div>

        {/* ---------- Security ---------- */}
        <div className="pd-card">
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 16 }}>Security</h3>
          <div className="settings-security-list">
            <div className="settings-security-row">
              <span>Two-Factor Authentication</span>
              <span className="pay-history-meta">Not available yet</span>
            </div>
            <div className="settings-security-row">
              <span>Active Sessions</span>
              <span className="pay-history-meta">Not available yet</span>
            </div>
            <LogOutAllDevicesButton />
          </div>
        </div>
      </div>
    </div>
  );
}
