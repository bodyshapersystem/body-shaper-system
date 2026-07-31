import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { WHATSAPP_URL, JOTFORM_BLUEPRINT_URL, FACEBOOK_URL } from "@/lib/nav";
import { GOOGLE_REVIEW_URL } from "@/lib/site-links";

export const metadata: Metadata = buildMetadata({
  title: "Links",
  description: "Everything you need from Body Shaper System™, in one place.",
  path: "/links",
  noIndex: true,
});

const LINKS = [
  { label: "Book Your Blueprint Consultation", sub: "Reserve online with a $350 deposit", href: "/book-appointment", bg: "burgundy" },
  { label: "Build My Blueprint™ — Free Assessment", sub: "Tell us your goals, get your plan", href: JOTFORM_BLUEPRINT_URL, bg: "stone" },
  { label: "Chat with a Specialist", sub: "WhatsApp", href: WHATSAPP_URL, bg: "burgundy" },
  { label: "See Our Google Reviews", sub: "Read what real clients say", href: GOOGLE_REVIEW_URL, bg: "stone" },
  { label: "Visit Our Website", sub: "bodyshapersystem.com", href: "/", bg: "burgundy" },
  { label: "Follow on Facebook", sub: "@bodyshapersystem", href: FACEBOOK_URL, bg: "stone" },
] as const;

const BG_IMAGE: Record<"burgundy" | "stone", string> = {
  burgundy: "/images/rewards/society-rules-bg.jpg",
  stone: "/images/rewards/green-waves-bg.jpg",
};

export default function LinksPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F7F2EA", padding: "56px 20px", display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#8B7362", marginBottom: 6 }}>
          Miami, Florida
        </p>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: 30, color: "#B8A088", marginBottom: 36 }}>
          body shaper system.
        </h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{
                display: "block",
                background: `${l.bg === "burgundy" ? "#3A0F16" : "#4E5A4A"} url('${BG_IMAGE[l.bg]}') center/cover no-repeat`,
                borderRadius: 12,
                padding: "16px 20px",
                textDecoration: "none",
                textAlign: "left",
                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
              }}
            >
              <span style={{ display: "block", fontFamily: "var(--serif)", fontSize: 16, color: "#B8A088", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
                {l.label}
              </span>
              <span style={{ display: "block", fontFamily: "var(--sans)", fontSize: 12, color: "#B8A088", marginTop: 2, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
                {l.sub}
              </span>
            </a>
          ))}
        </div>
        <p style={{ fontFamily: "var(--sans)", fontSize: 11, color: "#B8A088", marginTop: 40 }}>
          @bodyshapersystem
        </p>
      </div>
    </div>
  );
}
