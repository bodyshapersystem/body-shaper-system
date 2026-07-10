import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import BrandOverlay from "@/components/BrandOverlay";
import ArchitectureSidebar from "@/components/ArchitectureSidebar";

export const metadata: Metadata = buildMetadata({
  title: "Email Ecosystem Architecture",
  description:
    "The communication engine behind every personalized transformation — how the Body Blueprint Engine™, automation triggers and the Resend Email Engine generate every client communication. Visual documentation only.",
  path: "/architecture/email-ecosystem",
});

function IconBrain() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 4.5c-2.2 0-3.7 1.7-3.5 3.6C4 8.7 3.2 10 3.2 11.5c0 1.4.7 2.5 1.8 3.1-.1 2.1 1.5 3.9 3.6 3.9.7 0 1.4-.2 1.9-.6" stroke="currentColor" strokeWidth="1.1" />
      <path d="M15 4.5c2.2 0 3.7 1.7 3.5 3.6 1.5.6 2.3 1.9 2.3 3.4 0 1.4-.7 2.5-1.8 3.1.1 2.1-1.5 3.9-3.6 3.9-.7 0-1.4-.2-1.9-.6" stroke="currentColor" strokeWidth="1.1" />
      <line x1="12" y1="4.3" x2="12" y2="18.7" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconPerson() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.3" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5 19.5c1.3-3.4 4-5 7-5s5.7 1.6 7 5" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconZap() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 3 5 13.5h5.5L11 21l8-10.5h-5.5L13 3Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}
function IconSend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20 20.5 12 4 4l2 7.2L14 12l-8 .8L4 20Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}
function IconEnvelope() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="18" height="13" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M3.5 6.5 12 13l8.5-6.5" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconGear() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.1" />
      <path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18 6l-1.5 1.5M7.5 16.5 6 18M18 18l-1.5-1.5M7.5 7.5 6 6" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="15" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconGift() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="9.5" width="16" height="10" rx="0.6" stroke="currentColor" strokeWidth="1.1" />
      <line x1="12" y1="9.5" x2="12" y2="19.5" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 14.5 9.6l6.5.5-5 4.3 1.6 6.3L12 17.3 6.4 20.7 8 14.4l-5-4.3 6.5-.5L12 3.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M8 12.5l2.5 2.5 5.5-6" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconDatabase() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7.5" ry="2.6" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4.5 6v12c0 1.4 3.4 2.6 7.5 2.6s7.5-1.2 7.5-2.6V6" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12a8 8 0 1 1 3.3 6.4L4 19.5l1.2-3A7.9 7.9 0 0 1 4 12Z" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconCard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5.5" width="18" height="13" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
      <line x1="3" y1="9.5" x2="21" y2="9.5" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconSparkle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 13.5 9 19 10.5 13.5 12 12 17.5 10.5 12 5 10.5 10.5 9 12 3.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

const FLOW = [
  { icon: IconBrain, title: "Body Blueprint Engine™", desc: "The brain of the platform" },
  { icon: IconPerson, title: "Client Action", desc: "Interactions, forms, bookings, uploads" },
  { icon: IconZap, title: "Automation Trigger", desc: "Events activate the system" },
  { icon: IconSend, title: "Resend Email Engine", desc: "Secure delivery infrastructure" },
  { icon: IconEnvelope, title: "Client Receives Personalized Communication", desc: "Right message. Right time." },
];

const TRIGGER_EVENTS = [
  "Blueprint completed",
  "Consultation booked",
  "Treatment purchased",
  "Session completed",
  "Progress uploaded",
  "Reward unlocked",
  "Review submitted",
  "Referral completed",
];

const AUTOMATION_STEPS = [
  { title: "Jotform", desc: "Form submissions and client inputs" },
  { title: "Internal Processing", desc: "Validation, routing, and data enrichment" },
  { title: "Body Blueprint Engine™", desc: "Personalization logic and client intelligence" },
  { title: "Resend Email Engine", desc: "Transactional email infrastructure" },
  { title: "Email Queue", desc: "Prioritization and sequencing" },
  { title: "Delivery", desc: "Inbox delivery and tracking" },
];

const OUTPUTS = [
  "Welcome Guide",
  "Appointment Confirmation",
  "Preparation Instructions",
  "After Care",
  "Progress Reminder",
  "Photo Reminder",
  "Rewards",
  "Referral Invitation",
  "VIP Invitation",
  "Future Treatment Recommendation",
];

const SEQUENCE = [
  { n: "01", title: "Welcome", desc: "Your journey starts here.", dot: "filled" },
  { n: "02", title: "Consultation Confirmation", desc: "We've received your booking.", dot: "outline" },
  { n: "03", title: "Blueprint Summary", desc: "Your Body Blueprint™ is ready.", dot: "outline" },
  { n: "04", title: "Treatment Begins", desc: "Let's start your transformation.", dot: "outline" },
  { n: "05", title: "Preparation Guide", desc: "How to prepare for your session.", dot: "filled" },
  { n: "06", title: "After Care", desc: "How to care for your body afterward.", dot: "outline" },
  { n: "07", title: "Progress Check", desc: "How are you feeling? Let us know.", dot: "outline" },
  { n: "08", title: "Progress Photos", desc: "Upload your progress photos.", dot: "outline" },
  { n: "09", title: "Body Rewards™", desc: "Earn points. Unlock benefits.", dot: "filled" },
  { n: "10", title: "Future Recommendations", desc: "What's next for your journey.", dot: "outline" },
] as const;

const INTEGRATIONS = [
  { icon: IconSend, title: "Resend", desc: "Email Delivery Engine" },
  { icon: IconCalendar, title: "Google Calendar", desc: "Scheduling & Appointments" },
  { icon: IconEnvelope, title: "Jotform", desc: "Forms & Client Data Capture" },
  { icon: IconCard, title: "Stripe", desc: "Payments & Billing" },
  { icon: IconDatabase, title: "PostgreSQL", desc: "Secure Database Infrastructure" },
  { icon: IconChat, title: "WhatsApp", desc: "Client Messaging Channel", future: true },
  { icon: IconSparkle, title: "AI Concierge", desc: "AI-Powered Client Assistant", future: true },
];

export default function EmailEcosystemPage() {
  return (
    <div className="arch-page cat-technology">
      <BrandOverlay
        motifs={["target", "dotgrid"]}
        opacity={0.08}
        tone="gold"
        position="absolute"
        className="arch-overlay"
      />
      <div className="me2-content">
        <div className="arch-with-sidebar">
          <div>
            <div className="cat-level-tag">
              <span className="cat-bar" />
              <span className="cat-level-text">
                Architecture
                <br />
                Level
                <br />
                06
              </span>
            </div>
            <div className="me2-topbar">Body Shaper System™</div>
            <section className="me2-hero reveal">
              <h1>
                email ecosystem
                <br />
                architecture.
              </h1>
              <p className="me2-hero-sub">
                The communication engine behind
                <br />
                every personalized transformation.
              </p>
              <span className="me2-rule" aria-hidden="true" />
            </section>

            {/* Communication Flow */}
            <div className="me2-section-label reveal">Communication Flow</div>
            <div className="ee-flow reveal">
              {FLOW.map((f, i) => (
                <div className="ee-flow-step" key={f.title}>
                  <div className="ee-flow-card">
                    <span className="ee-flow-icon">
                      <f.icon />
                    </span>
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                  {i < FLOW.length - 1 && <span className="ee-flow-arrow">→</span>}
                </div>
              ))}
            </div>

            {/* Trigger Events / Automation Engine / Outputs */}
            <div className="ee-three-col reveal">
              <div className="ee-col">
                <h3>Trigger Events</h3>
                <ul>
                  {TRIGGER_EVENTS.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="ee-col ee-engine-col">
                <h3>Automation Engine</h3>
                <div className="ee-engine-stack">
                  {AUTOMATION_STEPS.map((s) => (
                    <div className="ee-engine-node" key={s.title}>
                      <strong>{s.title}</strong>
                      <span>{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ee-col">
                <h3>Communication Outputs</h3>
                <ul>
                  {OUTPUTS.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Email Automation Sequence */}
            <div className="me2-section-label reveal" style={{ marginTop: "8px" }}>
              Email Automation Sequence
            </div>
            <div className="ee-sequence reveal">
              {SEQUENCE.map((s) => (
                <div className="ee-seq-step" key={s.n}>
                  <span className={`ee-seq-dot ${s.dot === "filled" ? "is-filled" : "is-outline"}`}>{s.n}</span>
                  <span className="ee-seq-label">EMAIL {s.n}</span>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Integrations Ecosystem */}
            <div className="me2-section-label reveal">Integrations Ecosystem</div>
            <div className="ee-integrations reveal">
              {INTEGRATIONS.map((it) => (
                <div className="ee-integration" key={it.title}>
                  <span className="me2-module-icon">
                    <it.icon />
                  </span>
                  <h4>{it.title}</h4>
                  <p>{it.desc}</p>
                  {it.future && <span className="ee-future-tag">Future</span>}
                </div>
              ))}
            </div>

            <blockquote className="ee-quote reveal">
              &ldquo;Every email is generated from the client&rsquo;s Body Blueprint™, creating a completely
              personalized communication journey.&rdquo;
            </blockquote>
          </div>

          <div className="arch-sidebar-col">
            <ArchitectureSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
