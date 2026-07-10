import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import BrandOverlay from "@/components/BrandOverlay";

export const metadata: Metadata = buildMetadata({
  title: "Master Ecosystem Architecture",
  description:
    "The complete operating system for personalized transformation — how the Body Blueprint Engine™, Core Modules, Client Portal, Staff Portal and Data & Integrations Layer all work together at Body Shaper System™.",
  path: "/architecture/master-ecosystem",
});

/* ---------------------------------------------------------------------
   Small line-art icons — thin-stroke, no fill, consistent with the
   Tech Talks / architecture icon language established earlier.
--------------------------------------------------------------------- */
function IconTarget() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      <line x1="12" y1="1.5" x2="12" y2="4" stroke="currentColor" strokeWidth="1.1" />
      <line x1="12" y1="20" x2="12" y2="22.5" stroke="currentColor" strokeWidth="1.1" />
      <line x1="1.5" y1="12" x2="4" y2="12" stroke="currentColor" strokeWidth="1.1" />
      <line x1="20" y1="12" x2="22.5" y2="12" stroke="currentColor" strokeWidth="1.1" />
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
function IconBell() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4c-2.6 0-4.4 2-4.4 4.6v2.7c0 1-.4 2-1.2 2.8L5.5 15h13l-.9-1c-.8-.8-1.2-1.8-1.2-2.8V8.6C16.4 6 14.6 4 12 4Z" stroke="currentColor" strokeWidth="1.1" />
      <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconCRM() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="4" width="17" height="16" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <line x1="3.5" y1="9" x2="20.5" y2="9" stroke="currentColor" strokeWidth="1.1" />
      <line x1="7.5" y1="13" x2="16.5" y2="13" stroke="currentColor" strokeWidth="1" />
      <line x1="7.5" y1="16.5" x2="13" y2="16.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="15" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" stroke="currentColor" strokeWidth="1.1" />
      <line x1="7.5" y1="3.5" x2="7.5" y2="7" stroke="currentColor" strokeWidth="1.1" />
      <line x1="16.5" y1="3.5" x2="16.5" y2="7" stroke="currentColor" strokeWidth="1.1" />
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
function IconSparkle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 13.5 9 19 10.5 13.5 12 12 17.5 10.5 12 5 10.5 10.5 9 12 3.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}
function IconGift() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="9.5" width="16" height="10" rx="0.6" stroke="currentColor" strokeWidth="1.1" />
      <line x1="4" y1="13.5" x2="20" y2="13.5" stroke="currentColor" strokeWidth="1.1" />
      <line x1="12" y1="9.5" x2="12" y2="19.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M12 9.5c0-2 -1.6-3.6-3.2-3-1 .4-1 2 0 2.6.9.5 2.2.4 3.2.4Z" stroke="currentColor" strokeWidth="1.1" />
      <path d="M12 9.5c0-2 1.6-3.6 3.2-3 1 .4 1 2 0 2.6-.9.5-2.2.4-3.2.4Z" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="12" width="4" height="8" stroke="currentColor" strokeWidth="1.1" />
      <rect x="10" y="7" width="4" height="13" stroke="currentColor" strokeWidth="1.1" />
      <rect x="16.5" y="4" width="4" height="16" stroke="currentColor" strokeWidth="1.1" />
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
function IconClipboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="4.5" width="14" height="17" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <rect x="9" y="3" width="6" height="3" rx="0.6" stroke="currentColor" strokeWidth="1.1" />
      <line x1="8" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1" />
      <line x1="8" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 19.5V4.5M4 19.5h16" stroke="currentColor" strokeWidth="1.1" />
      <path d="M6.5 16 10 11l3 3 5-6.5" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconDatabase() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7.5" ry="2.6" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4.5 6v12c0 1.4 3.4 2.6 7.5 2.6s7.5-1.2 7.5-2.6V6" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4.5 12c0 1.4 3.4 2.6 7.5 2.6s7.5-1.2 7.5-2.6" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconCloud() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 18.5a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17.2 9.1 3.8 3.8 0 0 1 17 16.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M7 18.5h10" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconCard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5.5" width="18" height="13" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
      <line x1="3" y1="9.5" x2="21" y2="9.5" stroke="currentColor" strokeWidth="1.1" />
      <line x1="6" y1="14.5" x2="10" y2="14.5" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5.5" y="11" width="13" height="9" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="12" cy="15.2" r="1.2" fill="currentColor" />
    </svg>
  );
}
function IconCode() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 7 4.5 12 9 17M15 7l4.5 5-4.5 5" stroke="currentColor" strokeWidth="1.1" />
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

/* ---------------------------------------------------------------------
   Content — copy exactly as approved.
--------------------------------------------------------------------- */
const OVERVIEW_ITEMS = [
  { icon: IconTarget, title: "Integrated Modules", desc: "All systems work together in perfect harmony." },
  { icon: IconTarget, title: "Seamless Flow", desc: "Information and actions move without friction." },
  { icon: IconTarget, title: "Scalable Foundation", desc: "Built to grow, adapt and evolve with every client." },
  { icon: IconTarget, title: "Data-Driven Decisions", desc: "Real time intelligence that drives results." },
];

const ENGINE_BULLETS = [
  "Orchestrates every module.",
  "No module connects directly to each other.",
  "Everything plugs into the Engine.",
  "Modular. Secure. Scalable.",
];

const CORE_MODULES = [
  { icon: IconEnvelope, title: "Email", status: "LIVE", sub: "concierge@" },
  { icon: IconBell, title: "Internal Notifications", status: "LIVE", sub: "blueprint@" },
  { icon: IconCRM, title: "CRM", status: "FUTURE" },
  { icon: IconCalendar, title: "Google Calendar", status: "FUTURE" },
  { icon: IconChat, title: "WhatsApp", status: "FUTURE" },
  { icon: IconSparkle, title: "Blueprint AI™ Concierge", status: "FUTURE" },
  { icon: IconGift, title: "Body Rewards™ Program", status: "FUTURE" },
  { icon: IconDashboard, title: "Dashboard", status: "FUTURE" },
];

const PORTAL_TABS = [
  { key: "burgundy", label: "My Journey", items: ["Dashboard", "My Body Blueprint™", "Appointments"] },
  { key: "mocha", label: "My Results", items: ["Progress Photos", "Before & After", "Recommendations"] },
  { key: "taupe", label: "My Documents", items: ["Welcome Guide", "Documents", "Payments"] },
  { key: "olive", label: "My Community", items: ["Body Rewards™", "Messages", "Support"] },
  { key: "charcoal", label: "My Profile", items: ["Profile", "Account", "Preferences"] },
] as const;

const STAFF_PORTAL = [
  { icon: IconPerson, title: "Client Management", desc: "view & manage client profiles" },
  { icon: IconClipboard, title: "Session Management", desc: "mark sessions, add notes" },
  { icon: IconChart, title: "Progress Tracking", desc: "upload photos, update progress" },
  { icon: IconGift, title: "Rewards Management", desc: "assign points, unlock rewards" },
  { icon: IconCalendar, title: "Appointments", desc: "schedule & reschedule" },
  { icon: IconDashboard, title: "Reports & Analytics", desc: "business insights and performance" },
];

const DATA_LAYER = [
  { icon: IconDatabase, title: "Database", desc: "PostgreSQL" },
  { icon: IconCloud, title: "File Storage", desc: "S3 / Cloud" },
  { icon: IconCard, title: "Payments", desc: "Stripe" },
  { icon: IconLock, title: "Authentication", desc: "Secure Login" },
  { icon: IconCode, title: "API Layer", desc: "Internal & External" },
  { icon: IconZap, title: "Webhooks", desc: "Real-time Flow" },
];

const ROADMAP = [
  { n: "01", status: "Complete", dot: "burgundy", title: "Current Website", desc: "Brand, design system, and site architecture — locked and untouched." },
  { n: "02", status: "In Progress", dot: "outline", title: "Email Ecosystem", desc: "Body Blueprint Engine™, 10 concierge@ templates, Jotform + Resend integration." },
  { n: "03", status: "Next", dot: "outline", title: "Client Portal", desc: "Dashboard, Blueprint, Treatments, Appointments, Documents, and more." },
  { n: "04", status: "Future", dot: "outline", title: "Body Rewards™ Program", desc: "Points, tiers, referrals — the loyalty layer of the ecosystem." },
  { n: "05", status: "Future", dot: "outline", title: "Blueprint AI™ Concierge", desc: "Personalized recommendations, WhatsApp and portal assistance." },
  { n: "06", status: "Vision", dot: "outline", title: "Complete Ecosystem", desc: "Every module orchestrated by the Body Blueprint Engine™ — one unified platform." },
] as const;

const LIFECYCLE = [
  { n: "1", dot: "burgundy", title: "Treatment Begins", tag: "Step 4 of Onboarding" },
  { n: "2", dot: "outline", title: "After Care", tag: "Email 7" },
  { n: "3", dot: "outline", title: "Progress Check", tag: "Email 8" },
  { n: "4", dot: "outline", title: "Progress Photos", tag: "Portal Module" },
  { n: "5", dot: "champagne", title: "Body Rewards™ Program", tag: "Email 9 → 10" },
  { n: "6", dot: "outline", title: "Google Review", tag: "Rewards Action" },
  { n: "7", dot: "outline", title: "Referral", tag: "Rewards Action" },
  { n: "8", dot: "outline", title: "VIP Client", tag: "Rewards Tier" },
  { n: "9", dot: "outline", title: "Maintenance Program", tag: "Ongoing Plan" },
  { n: "10", dot: "outline", title: "Future Treatment Recommendations", tag: "Personalized, Portal-Driven" },
] as const;

export default function MasterEcosystemArchitecturePage() {
  return (
    <div className="arch-page me2-page">
      <BrandOverlay
        motifs={["target", "dotgrid"]}
        opacity={0.09}
        tone="gold"
        position="absolute"
        className="arch-overlay"
      />

      <div className="me2-content">
        {/* Top bar + hero */}
        <div className="me2-topbar">Body Shaper System™</div>
        <section className="me2-hero reveal">
          <h1>
            master
            <br />
            ecosystem
            <br />
            architecture.
          </h1>
          <p className="me2-hero-sub">
            The complete operating system
            <br />
            for personalized transformation.
          </p>
          <span className="me2-rule" aria-hidden="true" />
        </section>

        {/* Two-column: overview list (left) + system diagram (right) */}
        <div className="me2-grid">
          <aside className="me2-overview reveal">
            {OVERVIEW_ITEMS.map((it) => (
              <div className="me2-overview-item" key={it.title}>
                <span className="me2-overview-icon">
                  <it.icon />
                </span>
                <div>
                  <h3>{it.title}</h3>
                  <p>{it.desc}</p>
                </div>
              </div>
            ))}
          </aside>

          <div className="me2-diagram">
            {/* Body Blueprint Engine */}
            <div className="me2-engine-row reveal">
              <div className="me2-engine-card">
                <span className="me2-engine-eyebrow">The Brain of the Platform</span>
                <h2>body blueprint engine™</h2>
                <span className="me2-engine-status">
                  <span className="me2-status-dot" /> Active
                </span>
              </div>
              <ul className="me2-engine-bullets">
                {ENGINE_BULLETS.map((b) => (
                  <li key={b}>
                    <span className="plus">+</span> {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Core Modules */}
            <div className="me2-section-label reveal">Core Modules</div>
            <div className="me2-modules reveal">
              {CORE_MODULES.map((m) => (
                <div className="me2-module" key={m.title}>
                  <span className="me2-module-icon">
                    <m.icon />
                  </span>
                  <h4>{m.title}</h4>
                  <span className="me2-module-status">{m.status}</span>
                  {m.sub && <span className="me2-module-sub">{m.sub}</span>}
                </div>
              ))}
            </div>

            {/* Client Portal */}
            <div className="me2-panel reveal">
              <div className="me2-panel-head">
                <div>
                  <h3>Client Portal</h3>
                  <p>The Center of the Client Experience</p>
                </div>
                <span className="me2-panel-url">my.bodyshapersystem.com</span>
              </div>
              <div className="me2-portal-tabs">
                {PORTAL_TABS.map((tab) => (
                  <div className="me2-portal-col" key={tab.label}>
                    <div className={`me2-portal-tab tone-${tab.key}`}>{tab.label}</div>
                    <ul>
                      {tab.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="me2-panel-note">
                Internal communications and alerts stay within the Engine and Staff Portal.
              </div>
            </div>

            {/* Staff Portal */}
            <div className="me2-panel reveal">
              <div className="me2-panel-head">
                <div>
                  <h3>Staff Portal</h3>
                  <p>The Backend Experience for Our Team</p>
                </div>
                <span className="me2-panel-url">staff.bodyshapersystem.com</span>
              </div>
              <div className="me2-staff-grid">
                {STAFF_PORTAL.map((it) => (
                  <div className="me2-staff-item" key={it.title}>
                    <span className="me2-module-icon">
                      <it.icon />
                    </span>
                    <h4>{it.title}</h4>
                    <p>{it.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Data & Integrations */}
            <div className="me2-panel reveal">
              <div className="me2-panel-head" style={{ justifyContent: "center", textAlign: "center" }}>
                <div>
                  <h3>Data &amp; Integrations Layer</h3>
                  <p>Secure. Modular. Scalable.</p>
                </div>
              </div>
              <div className="me2-staff-grid">
                {DATA_LAYER.map((it) => (
                  <div className="me2-staff-item" key={it.title}>
                    <span className="me2-module-icon">
                      <it.icon />
                    </span>
                    <h4>{it.title}</h4>
                    <p>{it.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap + Lifecycle condensed strip */}
        <div className="me2-strip reveal">
          <div className="me2-strip-col">
            <h3 className="me2-strip-title">Platform Evolution Roadmap</h3>
            <p className="me2-strip-sub">From Website to Complete Ecosystem</p>
            <div className="me2-mini-timeline">
              {ROADMAP.map((s) => (
                <div className="me2-mini-stage" key={s.n}>
                  <span className={`me2-mini-dot dot-${s.dot}`}>{s.n}</span>
                  <span className="me2-mini-status">{s.status}</span>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="me2-strip-col">
            <h3 className="me2-strip-title">The Complete Client Lifecycle</h3>
            <p className="me2-strip-sub">From First Treatment to Lifetime VIP Client</p>
            <div className="me2-mini-timeline lifecycle">
              {LIFECYCLE.map((s) => (
                <div className="me2-mini-stage" key={s.n}>
                  <span className={`me2-mini-dot dot-${s.dot}`}>{s.n}</span>
                  <h4>{s.title}</h4>
                  <span className="me2-mini-status">{s.tag}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="me2-loop reveal">
            <div className="me2-loop-box">
              <h3>New Body Blueprint™</h3>
              <p>New Goals. New System. New Transformation.</p>
            </div>
            <p className="me2-loop-caption">
              This is a loop, not a dead end — the journey evolves with every client.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
