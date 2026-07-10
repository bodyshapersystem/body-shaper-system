import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import BrandOverlay from "@/components/BrandOverlay";

export const metadata: Metadata = buildMetadata({
  title: "Platform Evolution Roadmap",
  description:
    "From website to complete ecosystem — the phased evolution of Body Shaper System™: current website, email ecosystem, client portal, Body Rewards™ Program, AI Concierge and the complete platform.",
  path: "/architecture/platform-roadmap",
});

/**
 * Copy note: the approved mockup labels the sixth/final stage
 * "Complete Platform" (not "Complete Ecosystem"). Reproduced exactly
 * as shown in the approved image.
 */
const STAGES = [
  {
    status: "Complete",
    name: "Current Website",
    desc: "Brand, design system, and site architecture — locked and untouched.",
    dot: "filled",
  },
  {
    status: "In Progress",
    name: "Email Ecosystem",
    desc: "Body Blueprint Engine™, 10 concierge@ templates, Jotform + Resend integration.",
    dot: "filled",
  },
  {
    status: "Next",
    name: "Client Portal",
    desc: "Dashboard, Blueprint, Treatments, Appointments, Documents, and more.",
    dot: "outline",
  },
  {
    status: "Future",
    name: "Body Rewards™ Program",
    desc: "Points, tiers, referrals — the loyalty layer of the ecosystem.",
    dot: "outline",
  },
  {
    status: "Future",
    name: "AI Concierge",
    desc: "Personalized recommendations, WhatsApp and portal assistance.",
    dot: "outline",
  },
  {
    status: "Vision",
    name: "Complete Platform",
    desc: "Every module orchestrated by the Body Blueprint Engine™ — one ecosystem.",
    dot: "outline",
  },
] as const;

export default function PlatformRoadmapPage() {
  return (
    <div className="arch-page road-page">
      <BrandOverlay
        motifs={["target", "dotgrid"]}
        opacity={0.08}
        tone="gold"
        position="absolute"
        className="arch-overlay"
      />

      <div className="road-content">
        <section className="road-hero reveal">
          <span className="road-eyebrow">Body Shaper System™</span>
          <h1>Platform Evolution Roadmap</h1>
          <p className="road-sub">From Website to Complete Ecosystem</p>
          <span className="road-rule" aria-hidden="true" />
        </section>

        <section className="road-timeline reveal">
          {STAGES.map((s) => (
            <div className="road-stage" key={s.name}>
              <span className="road-dot-wrap">
                <span className={`road-dot ${s.dot === "filled" ? "is-filled" : "is-outline"}`} />
              </span>
              <span
                className="road-status"
                style={s.dot === "filled" ? { color: "var(--olive)" } : undefined}
              >
                {s.status}
              </span>
              <h3
                className="road-name"
                style={{ color: s.dot === "filled" ? "var(--olive)" : "var(--charcoal)" }}
              >
                {s.name}
              </h3>
              <p className="road-desc">{s.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
