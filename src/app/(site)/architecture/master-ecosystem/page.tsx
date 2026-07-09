import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import BrandOverlay from "@/components/BrandOverlay";

export const metadata: Metadata = buildMetadata({
  title: "Master Ecosystem Architecture",
  description:
    "The complete operating system for personalized transformation — how the Body Blueprint Engine™, Client Portal, platform roadmap and client lifecycle all work together at Body Shaper System™.",
  path: "/architecture/master-ecosystem",
});

/* ---------------------------------------------------------------------
   Small line-art icons used throughout this page. Kept intentionally
   minimal/thin-stroke to match the approved "precision engineering"
   icon language — no icon library, consistent with the rest of the
   codebase (see Tech Talks decorative motifs).
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

function IconBrain() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 4.5c-2.2 0-3.7 1.7-3.5 3.6C4 8.7 3.2 10 3.2 11.5c0 1.4.7 2.5 1.8 3.1-.1 2.1 1.5 3.9 3.6 3.9.7 0 1.4-.2 1.9-.6"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M15 4.5c2.2 0 3.7 1.7 3.5 3.6 1.5.6 2.3 1.9 2.3 3.4 0 1.4-.7 2.5-1.8 3.1.1 2.1-1.5 3.9-3.6 3.9-.7 0-1.4-.2-1.9-.6"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <line x1="12" y1="4.3" x2="12" y2="18.7" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function IconBrainSplit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8.5 4.5c-2.2 0-3.7 1.7-3.5 3.6C4 8.7 3.2 10 3.2 11.5c0 1.4.7 2.5 1.8 3.1-.1 2.1 1.5 3.9 3.6 3.9.7 0 1.4-.2 1.9-.6"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M15.5 4.5c2.2 0 3.7 1.7 3.5 3.6 1.5.6 2.3 1.9 2.3 3.4 0 1.4-.7 2.5-1.8 3.1.1 2.1-1.5 3.9-3.6 3.9-.7 0-1.4-.2-1.9-.6"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <line
        x1="10.6"
        y1="4.3"
        x2="10.6"
        y2="18.7"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeDasharray="1.5 2.4"
      />
      <line
        x1="13.4"
        y1="4.3"
        x2="13.4"
        y2="18.7"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeDasharray="1.5 2.4"
      />
    </svg>
  );
}

function IconCubes() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 3.5 4 6v6l5 2.5 5-2.5V6L9 3.5Z" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4 6 9 8.5 14 6M9 8.5V14.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M16 9.5 20 11.5v5L16 19l-3.4-1.7" stroke="currentColor" strokeWidth="1.1" />
      <path d="M20 11.5 16 13.5v5.5" stroke="currentColor" strokeWidth="1.1" />
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
      <path
        d="M12 4c-2.6 0-4.4 2-4.4 4.6v2.7c0 1-.4 2-1.2 2.8L5.5 15h13l-.9-1c-.8-.8-1.2-1.8-1.2-2.8V8.6C16.4 6 14.6 4 12 4Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12a8 8 0 1 1 3.3 6.4L4 19.5l1.2-3A7.9 7.9 0 0 1 4 12Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
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

function IconGift() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="9.5" width="16" height="10" rx="0.6" stroke="currentColor" strokeWidth="1.1" />
      <line x1="4" y1="13.5" x2="20" y2="13.5" stroke="currentColor" strokeWidth="1.1" />
      <line x1="12" y1="9.5" x2="12" y2="19.5" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M12 9.5c0-2 -1.6-3.6-3.2-3-1 .4-1 2 0 2.6.9.5 2.2.4 3.2.4Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M12 9.5c0-2 1.6-3.6 3.2-3 1 .4 1 2 0 2.6-.9.5-2.2.4-3.2.4Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
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

/* ---------------------------------------------------------------------
   Content data — copy exactly as approved.
--------------------------------------------------------------------- */

const OVERVIEW_TILES = [
  {
    icon: IconTarget,
    title: "Integrated Modules",
    desc: "All systems work together in perfect harmony.",
  },
  {
    icon: IconTarget,
    title: "Seamless Flow",
    desc: "Information and actions move without friction.",
  },
  {
    icon: IconTarget,
    title: "Scalable Foundation",
    desc: "Built to grow, adapt and evolve with every client.",
  },
  {
    icon: IconTarget,
    title: "Data-Driven Decisions",
    desc: "Real time intelligence that drives results.",
  },
];

const ENGINE_TILES = [
  {
    icon: IconBrain,
    title: "Orchestrates",
    desc: "Every module is synchronized through the engine.",
  },
  {
    icon: IconBrainSplit,
    title: "Decoupled",
    desc: "No module connects directly. Everything flows through the engine.",
  },
  {
    icon: IconCubes,
    title: "Modular",
    desc: "No module controls another. Modular. Secure. Scalable.",
  },
];

const PORTAL_ITEMS = [
  { icon: IconEnvelope, title: "Email", status: "LIVE + CONCIERGE" },
  { icon: IconBell, title: "Internal Notifications", status: "LIVE + BLUEPRINT®" },
  { icon: IconChat, title: "WhatsApp", status: "FUTURE" },
  { icon: IconCalendar, title: "Google Calendar", status: "FUTURE" },
  { icon: IconGift, title: "Body Rewards™ Program", status: "FUTURE" },
  { icon: IconPerson, title: "AI Concierge", status: "FUTURE" },
];

const ROADMAP_STEPS = [
  {
    n: "01",
    title: "complete current website",
    desc: "Foundation and essentials live. Functional and optimized.",
  },
  {
    n: "02",
    title: "email ecosystem",
    desc: "Blueprint emails, automations and segmentation activate.",
  },
  {
    n: "03",
    title: "client portal",
    desc: "Dashboard, docs, progress, photos, appointments and more.",
  },
  {
    n: "04",
    title: "body rewards™ program",
    desc: "Loyalty layer goes live inside the ecosystem.",
  },
  {
    n: "05",
    title: "ai concierge",
    desc: "Intelligence and automation at your client's service.",
  },
];

const LIFECYCLE_ITEMS = [
  { n: "01", title: "treatment begins", desc: "Start of the transformation." },
  { n: "02", title: "after care", desc: "Support and guidance." },
  { n: "03", title: "progress check", desc: "Evaluate and refine." },
  { n: "04", title: "progress photos", desc: "Visual proof of progress." },
  { n: "05", title: "rewards program", desc: "Loyalty and benefits." },
  { n: "06", title: "google review", desc: "Share the experience." },
  { n: "07", title: "referral", desc: "Spread the transformation." },
  { n: "08", title: "vip client", desc: "Exclusive experience." },
  { n: "09", title: "maintenance program", desc: "Ongoing care and optimization." },
  { n: "10", title: "future treatments", desc: "Continued evolution." },
];

export default function MasterEcosystemArchitecturePage() {
  return (
    <div className="arch-page">
      <BrandOverlay
        motifs={["grid", "target", "ring", "nodes", "contour", "dotgrid", "ticks"]}
        opacity={0.035}
        tone="ink"
        position="absolute"
        className="arch-overlay"
      />

      <div className="arch-content">
        {/* ---------- Top bar ---------- */}
        <div className="arch-topbar">
          <span className="arch-tick arch-tick-tl" aria-hidden="true" />
          <span className="arch-tick arch-tick-tr" aria-hidden="true" />
          <span className="arch-brand">Body Shaper System™</span>
          <span className="arch-version">
            v1.3
            <br />
            Master Architecture
          </span>
        </div>

        {/* ---------- Hero ---------- */}
        <section className="arch-hero reveal">
          <h1>
            master
            <br />
            ecosystem
            <br />
            architecture
          </h1>
          <p className="arch-hero-sub">
            The complete operating system
            <br />
            for personalized transformation.
          </p>
        </section>

        {/* ---------- 01 Master Ecosystem Overview ---------- */}
        <section className="arch-row reveal">
          <div className="arch-bar" style={{ background: "var(--burgundy)" }} />
          <div className="arch-row-head">
            <span className="arch-row-num">01</span>
            <h2 style={{ color: "var(--burgundy)" }}>
              master ecosystem
              <br />
              architecture
            </h2>
            <p className="arch-row-eyebrow">The Overview</p>
            <p className="arch-row-desc">
              The complete operating system behind every personalized transformation.
            </p>
          </div>
          <div className="arch-row-body">
            <div className="arch-tiles cols-2">
              {OVERVIEW_TILES.map((t) => (
                <div className="arch-tile" key={t.title}>
                  <span className="arch-tile-icon">
                    <t.icon />
                  </span>
                  <div>
                    <h3>{t.title}</h3>
                    <p>{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="arch-row-label">
            Architecture
            <br />
            Level
            <br />
            01
          </div>
        </section>

        {/* ---------- 02 Body Blueprint Engine ---------- */}
        <section className="arch-row reveal">
          <div className="arch-bar" style={{ background: "var(--taupe)" }} />
          <div className="arch-row-head">
            <span className="arch-row-num">02</span>
            <h2>
              body blueprint
              <br />
              engine™
            </h2>
            <p className="arch-row-eyebrow">
              The Brain of the Ecosystem
              <span className="arch-status">
                <span className="arch-status-dot" /> Active
              </span>
            </p>
            <p className="arch-row-desc">Orchestrates every module. Everything plugs into the engine.</p>
          </div>
          <div className="arch-row-body">
            <div className="arch-tiles cols-3">
              {ENGINE_TILES.map((t) => (
                <div className="arch-tile" key={t.title}>
                  <span className="arch-tile-icon">
                    <t.icon />
                  </span>
                  <div>
                    <h3>{t.title}</h3>
                    <p>{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="arch-row-label">
            Engine
            <br />
            Level
            <br />
            02
          </div>
        </section>

        {/* ---------- 03 Client Portal ---------- */}
        <section className="arch-row reveal">
          <div className="arch-bar" style={{ background: "var(--olive)" }} />
          <div className="arch-row-head">
            <span className="arch-row-num">03</span>
            <h2>client portal</h2>
            <p className="arch-row-eyebrow">
              The Center of the Client Experience
              <span className="arch-status">
                <span className="arch-status-dot" /> Active
              </span>
            </p>
            <p className="arch-row-desc">
              The hub where clients engage, track progress and stay connected.
            </p>
          </div>
          <div className="arch-row-body">
            <div className="arch-portal">
              {PORTAL_ITEMS.map((it) => (
                <div className="arch-portal-item" key={it.title}>
                  <span className="arch-tile-icon">
                    <it.icon />
                  </span>
                  <div>
                    <h3>{it.title}</h3>
                    <span className="arch-portal-status">{it.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="arch-row-label">
            Portal
            <br />
            Level
            <br />
            03
          </div>
        </section>

        {/* ---------- 04 Platform Evolution Roadmap ---------- */}
        <section className="arch-row reveal">
          <div className="arch-bar" style={{ background: "var(--gold)" }} />
          <div className="arch-row-head">
            <span className="arch-row-num">04</span>
            <h2 style={{ color: "var(--gold)" }}>
              platform evolution
              <br />
              roadmap
            </h2>
            <p className="arch-row-eyebrow">From Website to Complete Ecosystem</p>
            <p className="arch-row-desc">
              A phased evolution designed to deliver a seamless experience at every stage.
            </p>
          </div>
          <div className="arch-row-body">
            <div className="arch-roadmap">
              {ROADMAP_STEPS.map((s) => (
                <div className="arch-roadmap-step" key={s.n}>
                  <span className="arch-roadmap-num">{s.n}</span>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="arch-row-label" style={{ color: "var(--gold)" }}>
            Roadmap
            <br />
            Level
            <br />
            04
          </div>
        </section>

        {/* ---------- 05 Complete Client Lifecycle ---------- */}
        <section className="arch-row reveal">
          <div className="arch-bar" style={{ background: "var(--charcoal)" }} />
          <div className="arch-row-head">
            <span className="arch-row-num">05</span>
            <h2>
              complete client
              <br />
              lifecycle
            </h2>
            <p className="arch-row-eyebrow">
              From First Treatment
              <br />
              to Lifetime VIP Client
            </p>
            <p className="arch-row-desc">
              Our proven journey that transforms first time clients into lifelong VIPs.
            </p>
          </div>
          <div className="arch-row-body">
            <div className="arch-lifecycle">
              {LIFECYCLE_ITEMS.map((it) => (
                <div className="arch-lifecycle-item" key={it.n}>
                  <span className="n">{it.n}</span>
                  <h4>{it.title}</h4>
                  <p>{it.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="arch-row-label">
            Lifecycle
            <br />
            Level
            <br />
            05
          </div>
        </section>

        {/* ---------- Closing ---------- */}
        <div className="arch-closing reveal">
          <span className="arch-closing-mark" aria-hidden="true" />
          <p>
            Body Shaper System™ <span className="sep">|</span> Science. Strategy. Transformation.
          </p>
        </div>
      </div>
    </div>
  );
}
