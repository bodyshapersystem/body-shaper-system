import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * In-portal messaging is archived (stand-by) — the original thread page
 * lives in src/_archive/portal-messages/page.v1.tsx. Existing "message
 * your specialist" links land here and get direct text / call / email.
 */
export default async function ContactSpecialistPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const business = await prisma.businessSettings.findUnique({ where: { id: "default" } });
  const phone = business?.contactPhone?.replace(/[^\d+]/g, "") || null;
  const email = business?.contactEmail || null;

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">your specialist</p>
        <h1>contact.</h1>
        <p className="portal-page-sub">Questions about a session or your system? Reach us directly.</p>
      </div>
      <div className="apd-panel apd-panel-marble" style={{ position: "static", width: "100%", maxWidth: 520, borderRadius: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        {phone && (
          <a href={`sms:${phone}`} className="apd-btn-primary" style={{ display: "block", textAlign: "center" }}>
            Text Us
          </a>
        )}
        {phone && (
          <a href={`tel:${phone}`} className="apd-btn-secondary" style={{ display: "block", textAlign: "center" }}>
            Call
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className="apd-btn-secondary" style={{ display: "block", textAlign: "center" }}>
            Email
          </a>
        )}
        {!phone && !email && <p>Contact details coming soon.</p>}
      </div>
    </div>
  );
}
