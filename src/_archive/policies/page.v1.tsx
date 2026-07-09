import type { Metadata } from "next";
import { WHATSAPP_URL } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Policies",
  description:
    "Appointments, cancellations, deposits, package validity and more — everything you need to know before your Body Blueprint™ journey with Body Shaper System™.",
};

const POLICIES = [
  {
    title: "Appointments",
    body: "Appointments are reserved exclusively for you. Please arrive on time to ensure the best possible experience.",
  },
  {
    title: "Cancellation Policy",
    body: "Appointments cancelled or rescheduled with less than 24 hours' notice may result in the loss of the scheduled session.",
  },
  {
    title: "No Shows",
    body: "Missed appointments without prior notice are considered a completed session.",
  },
  {
    title: "Deposits",
    body: "Deposits secure your appointment and are applied toward your treatment. Deposits are non-refundable.",
  },
  {
    title: "Package Validity",
    body: "Treatment packages should begin within 60 days of purchase unless otherwise approved.",
  },
  {
    title: "Travel Appointments",
    body: "Body Shaper System™ is a luxury mobile experience. Travel fees may apply depending on your location.",
  },
  {
    title: "Results",
    body: "Every Body Blueprint™ is personalized. Results vary depending on body composition, lifestyle, consistency and adherence to the recommended system.",
  },
  {
    title: "Photography",
    body: "Progress photos may be taken to document your transformation. They are only shared with written consent.",
  },
  {
    title: "Health & Safety",
    body: "Certain medical conditions may require physician clearance before treatment. Recommendations are always made with your safety as the priority.",
  },
  {
    title: "Our Promise",
    body: "We don't sell sessions. We build personalized body systems designed around your unique goals.",
  },
];

export default function PoliciesPage() {
  return (
    <>
      {/* HERO */}
      <section className="hero" style={{ minHeight: "50vh" }}>
        <div className="hero-bg" />
        <div className="hero-content">
          <span className="eyebrow" style={{ color: "var(--rose)" }}>
            Policies
          </span>
          <h1>
            What To <em>Expect.</em>
          </h1>
          <p>
            A clear, transparent overview of how we work together — from
            your first appointment to your last session.
          </p>
        </div>
      </section>

      <div className="wave-divider">
        <svg viewBox="0 0 180 40" fill="none">
          <path
            d="M0 20C20 5 40 5 60 20C80 35 100 35 120 20C140 5 160 5 180 20"
            stroke="#6B5240"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* POLICIES LIST */}
      <section className="policies-list reveal in">
        {POLICIES.map((p) => (
          <div className="policy-item" key={p.title}>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </div>
        ))}
      </section>

      {/* QUESTIONS? */}
      <section className="final-cta" id="build" style={{ paddingTop: 0 }}>
        <span
          className="eyebrow reveal"
          style={{ display: "block", marginBottom: 18 }}
        >
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
