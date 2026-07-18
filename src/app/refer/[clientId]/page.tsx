import { prisma } from "@/lib/prisma";
import ReferralForm from "./ReferralForm";

export const dynamic = "force-dynamic";

export default async function ReferralLandingPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const referrer = await prisma.client.findUnique({ where: { id: clientId }, select: { firstName: true } });

  if (!referrer) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F4EF" }}>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#2B2622" }}>This referral link isn't valid.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F7F4EF", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ maxWidth: 480, width: "100%", background: "#fff", borderRadius: 20, padding: 40, boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B4E3D", marginBottom: 8 }}>
          you were invited by {referrer.firstName}
        </p>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, color: "#2B2622", margin: "0 0 12px" }}>Welcome to Body Shaper System™.</h1>
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 14, color: "#5a5148", marginBottom: 24, lineHeight: 1.6 }}>
          {referrer.firstName} thought you'd love this experience. Leave your info and our team will reach out to build your personalized plan.
        </p>
        <ReferralForm clientId={clientId} />
      </div>
    </div>
  );
}
