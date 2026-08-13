import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { WHATSAPP_URL } from "@/lib/nav";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How Body Shaper System™ collects, uses and protects your personal information.",
  path: "/privacy",
});

const SECTIONS = [
  {
    title: "Information We Collect",
    body: "When you book a consultation, complete your Body Blueprint™, or become a client, we collect information you provide directly — your name, email, phone number, city/address, and payment details (processed securely by Stripe; we never store your full card number). As a client, we also record professional body measurements, RENPHO body composition scans, progress photos, appointment history, and notes from your treatment sessions, used to design and track your Personalized System™.",
  },
  {
    title: "How We Use Your Information",
    body: "We use your information to schedule and deliver your appointments, build and adjust your Personalized System™, process payments and deposits, send appointment confirmations and reminders, give you access to your Client Portal, and communicate with you about your care. With your consent, we may also use progress photos in marketing materials — never without your written approval.",
  },
  {
    title: "Who We Share It With",
    body: "We use trusted service providers to run the business: Stripe for payment processing, Supabase for secure data storage, Resend for transactional email, Jotform for intake forms, and Google Analytics to understand site traffic. These providers only receive the information needed to perform their function, and are contractually required to protect it. We do not sell your personal information to anyone.",
  },
  {
    title: "Photos & Body Data",
    body: "Progress photos and body measurements are treated as sensitive information. They're visible only to you (in your Client Portal) and to your specialist. They are never shared publicly, used in marketing, or shown to anyone else without your specific written consent for that use.",
  },
  {
    title: "Cookies & Analytics",
    body: "Our website uses Google Analytics to understand how visitors use the site, so we can improve it. This collects general usage data (pages visited, general location, device type) — not your personal health or treatment information.",
  },
  {
    title: "Data Retention",
    body: "We keep client records for as long as you're an active client, and for a reasonable period afterward for legal, tax and continuity-of-care purposes. You can request deletion of your account and personal data at any time, subject to any records we're legally required to retain.",
  },
  {
    title: "Your Rights",
    body: "You can request a copy of the personal information we hold about you, ask us to correct it, or ask us to delete your account and data. To make a request, reach out through the contact details below.",
  },
  {
    title: "Security",
    body: "Your information is stored with industry-standard encryption and access controls. Payment information is handled entirely by Stripe, a PCI-compliant payment processor — we never see or store your full card details.",
  },
  {
    title: "Changes To This Policy",
    body: "We may update this policy from time to time as our practices evolve. The date of the most recent update will always be reflected here.",
  },
  {
    title: "Contact Us",
    body: "Questions about this policy or your data? Reach out any time at hello@bodyshapersystem.com or via WhatsApp.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="hero" style={{ minHeight: "40vh" }}>
        <div className="hero-bg" />
        <div className="hero-content">
          <span className="eyebrow" style={{ color: "var(--rose)" }}>
            Privacy Policy
          </span>
          <h1>
            Your Data. <em>Protected.</em>
          </h1>
          <p>Last updated August 2026. How we collect, use and protect your personal information.</p>
        </div>
      </section>

      <div className="wave-divider">
        <svg viewBox="0 0 180 40" fill="none">
          <path d="M0 20C20 5 40 5 60 20C80 35 100 35 120 20C140 5 160 5 180 20" stroke="#6B5240" strokeWidth="1" />
        </svg>
      </div>

      <section className="policies-list reveal in">
        {SECTIONS.map((s) => (
          <div className="policy-item" key={s.title}>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        ))}
      </section>

      <section className="final-cta" id="build" style={{ paddingTop: 0 }}>
        <span className="eyebrow reveal" style={{ display: "block", marginBottom: 18 }}>
          Questions?
        </span>
        <h2 className="reveal">Happy to walk you through anything above.</h2>
        <div className="actions reveal">
          <a href={WHATSAPP_URL} className="btn btn-primary">
            Chat with a Specialist
          </a>
        </div>
      </section>
    </>
  );
}
