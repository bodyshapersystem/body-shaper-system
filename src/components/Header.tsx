"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_ITEMS } from "@/lib/nav";
import BlueprintWaves from "@/components/BlueprintWaves";

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 19.5c1.3-3.4 4-5 7-5s5.7 1.6 7 5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
function IconTarget() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}
function IconPersonStand() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="5.5" r="2.4" stroke="currentColor" strokeWidth="1.1" />
      <path d="M12 9v7.5M8.5 12h7M9 21l3-4.5 3 4.5" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconConcentric() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="12" cy="12" r="4.4" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconDotMatrix() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="1.3" fill="currentColor" />
      <circle cx="12" cy="7" r="1.3" fill="currentColor" />
      <circle cx="17" cy="7" r="1.3" fill="currentColor" />
      <circle cx="7" cy="12" r="1.3" fill="currentColor" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="17" cy="12" r="1.3" fill="currentColor" />
    </svg>
  );
}
function IconTransform() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 4c-2 3-2 13 0 16" stroke="currentColor" strokeWidth="1.1" />
      <path d="M15 4c2 3 2 13 0 16" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconTargetSlash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <line x1="6.5" y1="17.5" x2="17.5" y2="6.5" stroke="currentColor" strokeWidth="1.1" />
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
function IconPersonCircle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="12" cy="9.8" r="2.4" stroke="currentColor" strokeWidth="1.1" />
      <path d="M7.5 17c1-2.3 2.7-3.3 4.5-3.3s3.5 1 4.5 3.3" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function IconQuestion() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M9.5 9.8c.3-1.6 1.6-2.4 2.8-2.3 1.3.1 2.3 1 2.2 2.2-.1 1.1-1 1.6-1.8 2.2-.6.5-.9 1-.9 1.8" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="12" cy="16.3" r="0.9" fill="currentColor" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 19 6v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-2.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

const NAV_ICONS: Record<string, () => React.ReactElement> = {
  "/": IconTarget,
  "/in-home-experience": IconPersonStand,
  "/body-blueprint": IconConcentric,
  "/systems": IconDotMatrix,
  "/transformations": IconTransform,
  "/tech-talks": IconTargetSlash,
  "/reviews": IconStar,
  "/about": IconPersonCircle,
  "/faq": IconQuestion,
  "/policies": IconShield,
};

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Lock background scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Esc key closes the drawer (desktop keyboard support).
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Swipe-to-close: accept a drag past ~70px in EITHER horizontal
  // direction as a close gesture, since people swipe both ways
  // depending on habit. Live 1:1 transform while dragging, snap
  // closed or back open on release.
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    setDragging(true);
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    setDragX(delta);
  }
  function handleTouchEnd() {
    if (Math.abs(dragX) > 70) {
      setOpen(false);
    }
    setDragging(false);
    setDragX(0);
    touchStartX.current = null;
  }

  return (
    <>
      <header id="siteHeader" className="scrolled">
        <Link href="/" className="logo" style={{ color: "var(--charcoal)" }}>
          body shaper system.
          <sup style={{ fontSize: 10 }}>™</sup>
        </Link>
        <Link href="/portal/login" className="client-portal-btn client-portal-btn-desktop">
          <span className="cp-icon">
            <IconUser />
          </span>
          Client Portal
        </Link>
        <button
          className="menu-toggle"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
      </header>

      {/* Rendered as siblings of <header>, not children — header has an
          always-on backdrop-filter (frosted glass nav), which creates a
          new containing block for position:fixed descendants. Nesting
          the backdrop/drawer inside it confined their fixed positioning
          to the header's own thin bounding box instead of the viewport,
          which is why tapping outside the drawer previously did nothing. */}
      <div
        className={`menu-backdrop${open ? " open" : ""}`}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />
      <nav
        className={`menu${open ? " open" : ""}${dragging ? " dragging" : ""}`}
        id="siteMenu"
        style={dragging ? { transform: `translateX(${dragX}px)` } : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <BlueprintWaves className="menu-waves" />
        <button className="menu-close-x" aria-label="Close menu" onClick={() => setOpen(false)}>
          ×
        </button>
        <div className="menu-inner">
          <div className="menu-top-row">
            <span className="menu-wordmark">
              body
              <br />
              shaper
              <br />
              system™
            </span>
            <Link href="/portal/login" className="client-portal-btn" onClick={() => setOpen(false)}>
              <span className="cp-icon">
                <IconUser />
              </span>
              Client Portal
            </Link>
          </div>
          <div className="menu-links">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = NAV_ICONS[item.href];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={active ? "active" : ""}
                >
                  <span className="menu-link-icon">{Icon && <Icon />}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
          <Link href="#build" className="cta btn menu-cta" onClick={() => setOpen(false)}>
            Build My Blueprint™
          </Link>
        </div>
      </nav>
    </>
  );
}
