import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { WHATSAPP_URL } from "@/lib/nav";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description: "The terms that govern your use of Body Shaper System™ services and website.",
  path: "/terms",
});

const SECTIONS = [
  {
    title: "Our Services",
    body: "Body Shaper System™ provides personalized, non-surgical body contouring, skin tightening, cellulite reduction and muscle toning services, delivered in-home or in-studio in the Miami area. Every client begins with a Body Blueprint™ evaluation, used to design a Personalized System™ specific to their body and goals.",
  },
  {
    title: "Not Medical Care",
    body: "Body Shaper System™ is a body contouring and wellness service, not a medical practice. Our services do not diagnose, treat, cure or prevent any disease, and are not a substitute for medical advice. Certain medical conditions may require physician clearance before treatment, and we may decline or modify a service for safety reasons.",
  },
  {
    title: "Booking & Deposits",
    body: "A deposit is required to reserve your Body Blueprint™ consultation or a Personalized System™. Deposits are applied toward the cost of your treatment and are non-refundable, including if you cancel, reschedule with less than 24 hours' notice, or do not show up. Full policies on cancellations, no-shows and package validity are on our Policies page.",
  },
  {
    title: "Payments",
    body: "All online payments are processed securely through Stripe. By making a payment, you agree to Stripe's terms of service in addition to ours. Prices for Personalized Systems™ reflect a starting investment — the total cost of your program depends on the number of sessions and technologies recommended in your Body Blueprint™, and any remaining balance is billed separately as your treatment plan is finalized.",
  },
  {
    title: "Results Vary",
    body: "Every body responds differently. While we design every Personalized System™ to give you the best possible outcome, we cannot guarantee specific results, timelines, or that your experience will match any photos, testimonials or examples shown on our website or social media.",
  },
  {
    title: "Photos & Content",
    body: "Progress photos may be taken to document your transformation and are used internally to track your results. They are only used publicly (marketing, social media, website) with your specific written consent.",
  },
  {
    title: "Client Portal",
    body: "As a client, you'll have access to a Client Portal to view your appointments, progress and documents. You're responsible for keeping your login credentials confidential and for all activity under your account.",
  },
  {
    title: "Limitation of Liability",
    body: "To the fullest extent permitted by law, Body Shaper System™ and its owner are not liable for any indirect, incidental or consequential damages arising from your use of our services or website. Our total liability for any claim is limited to the amount you paid for the specific service in question.",
  },
  {
    title: "Governing Law",
    body: "These terms are governed by the laws of the State of Florida, without regard to its conflict-of-law principles.",
  },
  {
    title: "Changes To These Terms",
    body: "We may update these terms from time to time as our services evolve. Continued use of our services after an update means you accept the revised terms.",
  },
  {
    title: "Contact Us",
    body: "Questions about these terms? Reach out any time at hello@bodyshapersystem.com or via WhatsApp.",
  },
];

export default function TermsPage() {
  return (
    <>
      <section className="hero" style={{ minHeight: "40vh" }}>
        <div className="hero-bg" />
        <div className="hero-content">
          <span className="eyebrow" style={{ color: "var(--rose)" }}>
            Terms of Service
          </span>
          <h1>
            The Fine <em>Print.</em>
          </h1>
          <p>Last updated August 2026. The terms that govern your use of our services and website.</p>
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
