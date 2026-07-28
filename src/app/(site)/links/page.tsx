import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { WHATSAPP_URL, JOTFORM_BLUEPRINT_URL } from "@/lib/nav";
import { GOOGLE_MAPS_URL } from "@/lib/site-links";

export const metadata: Metadata = buildMetadata({
  title: "Links",
  description: "Everything you need from Body Shaper System™, in one place.",
  path: "/links",
  noIndex: true,
});

const LINKS = [
  { label: "Book Your Blueprint Consultation", sub: "Reserve online with a $350 deposit", href: "/book-appointment" },
  { label: "Build My Blueprint™ — Free Assessment", sub: "Tell us your goals, get your plan", href: JOTFORM_BLUEPRINT_URL },
  { label: "Chat with a Specialist", sub: "WhatsApp", href: WHATSAPP_URL },
  { label: "See Our Google Reviews", sub: "Read what real clients say", href: GOOGLE_MAPS_URL },
  { label: "Visit Our Website", sub: "bodyshapersystem.com", href: "/" },
];

export default function LinksPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F7F2EA", padding: "56px 20px", display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#8B7362", marginBottom: 6 }}>
          Miami, Florida
        </p>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: 30, color: "#2B2622", marginBottom: 36 }}>
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
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 12,
                padding: "16px 20px",
                textDecoration: "none",
                textAlign: "left",
              }}
            >
              <span style={{ display: "block", fontFamily: "var(--serif)", fontSize: 16, color: "#2B2622" }}>{l.label}</span>
              <span style={{ display: "block", fontFamily: "var(--sans)", fontSize: 12, color: "#8a7f74", marginTop: 2 }}>{l.sub}</span>
            </a>
          ))}
        </div>
        <p style={{ fontFamily: "var(--sans)", fontSize: 11, color: "#a89e8f", marginTop: 40 }}>
          @bodyshapersystem_mia
        </p>
      </div>
    </div>
  );
}
