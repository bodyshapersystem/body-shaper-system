import Image from "next/image";

/* ---------------------------------------------------------------------
   ArchitectureSidebar — the shared right-hand reference panel shown
   on every architecture documentation page: wordmark, the official
   6-color palette, typography specimens, UI elements, icon style and
   brand mood photography. Content is identical across pages per the
   approved design-system reference; only the page body around it
   changes its dominant category color.
--------------------------------------------------------------------- */

const PALETTE = [
  { name: "Burgundy", hex: "#5C1A1F" },
  { name: "Mocha", hex: "#6F5446" },
  { name: "Sand / Gold", hex: "#C8B28A" },
  { name: "Olive", hex: "#4F4C39" },
  { name: "Charcoal", hex: "#1E1E1E" },
  { name: "Ivory", hex: "#F6F3EE" },
];

function IconPerson() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.3" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5 19.5c1.3-3.4 4-5 7-5s5.7 1.6 7 5" stroke="currentColor" strokeWidth="1.1" />
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
function IconCamera() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M8 7l1.5-2.5h5L16 7" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="12" cy="13.5" r="3.4" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.1" />
      <path d="M14 3.5V8h4" stroke="currentColor" strokeWidth="1.1" />
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
function IconChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12a8 8 0 1 1 3.3 6.4L4 19.5l1.2-3A7.9 7.9 0 0 1 4 12Z" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

const MOOD_IMAGES = [
  { src: "/images/about-story-1.jpg", alt: "Body Shaper System brand mood" },
  { src: "/images/inhome-lifestyle.jpeg", alt: "In-home experience mood" },
  { src: "/images/tech-session.jpeg", alt: "Technology in session" },
  { src: "/images/about-hero.jpg", alt: "Editorial brand mood" },
];

export interface ArchitectureSidebarProps {
  /** Optional custom tagline row shown under the wordmark. */
  tagline?: string[];
}

export default function ArchitectureSidebar({
  tagline = ["advanced technology.", "personalized strategy.", "visible results."],
}: ArchitectureSidebarProps) {
  return (
    <aside className="asb">
      <div className="asb-word">
        body
        <br />
        shaper
        <br />
        system™
      </div>
      <div className="asb-tagline">
        {tagline.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      <span className="asb-rule" aria-hidden="true" />

      <div className="asb-block">
        <h4>Color Palette</h4>
        <div className="asb-palette">
          {PALETTE.map((c) => (
            <div className="asb-swatch" key={c.hex}>
              <span className="asb-dot" style={{ background: c.hex }} />
              <span className="asb-hex">{c.hex}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="asb-block">
        <h4>Typography</h4>
        <div className="asb-type-row">
          <div>
            <span className="asb-type-sample serif-bold">títulos</span>
            <span className="asb-type-note">minúscula bold</span>
          </div>
          <span className="asb-type-aa serif-bold">Aa</span>
        </div>
        <div className="asb-type-row">
          <div>
            <span className="asb-type-sample serif-med">subtítulos</span>
            <span className="asb-type-note">minúscula medium</span>
          </div>
          <span className="asb-type-aa serif-med">Aa</span>
        </div>
        <div className="asb-type-row">
          <div>
            <span className="asb-type-sample sans-reg">texto principal</span>
            <span className="asb-type-note">minúscula regular, legible, elegante y atemporal.</span>
          </div>
          <span className="asb-type-aa sans-reg">Aa</span>
        </div>
      </div>

      <div className="asb-block">
        <h4>UI Elements</h4>
        <button className="asb-btn-primary" type="button" tabIndex={-1}>
          button primary
        </button>
        <button className="asb-btn-secondary" type="button" tabIndex={-1}>
          button secondary
        </button>
        <span className="asb-link">link text →</span>
      </div>

      <div className="asb-block">
        <h4>Icon Style</h4>
        <div className="asb-icons">
          <IconPerson />
          <IconCalendar />
          <IconCamera />
          <IconDoc />
          <IconGift />
          <IconChat />
        </div>
      </div>

      <div className="asb-block">
        <h4>Visual Style &amp; Mood</h4>
        <div className="asb-mood">
          {MOOD_IMAGES.map((m) => (
            <div className="asb-mood-item" key={m.src}>
              <Image src={m.src} alt={m.alt} fill sizes="120px" style={{ objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </div>

      <p className="asb-footer">Science. Strategy. Transformation.</p>
    </aside>
  );
}
