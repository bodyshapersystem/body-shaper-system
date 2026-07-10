"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_ITEMS } from "@/lib/nav";
import BrandOverlay from "@/components/BrandOverlay";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Lock background scroll while the mobile menu is open — standard for a
  // premium mobile menu, and avoids the page scrolling behind the backdrop.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Swipe-to-close: the menu slides in from the right, so a rightward drag
  // (positive deltaX) is a "close" gesture. Track the finger 1:1 while
  // dragging, then either snap closed (past threshold / fast flick) or
  // snap back open.
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    setDragging(true);
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    if (delta > 0) setDragX(delta);
  }
  function handleTouchEnd() {
    if (dragX > 70) {
      setOpen(false);
    }
    setDragging(false);
    setDragX(0);
    touchStartX.current = null;
  }

  return (
    <header id="siteHeader" className="scrolled">
      <Link href="/" className="logo" style={{ color: "var(--charcoal)" }}>
        body shaper system.
        <sup style={{ fontSize: 10 }}>™</sup>
      </Link>
      {/* Tapping this backdrop closes the menu — the fix. Always rendered so
          the opacity/visibility transition can animate in both directions. */}
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
        <BrandOverlay
          motifs={["grid", "target", "ring", "nodes", "contour", "dotgrid", "ticks"]}
          opacity={0.14}
          tone="gold"
          position="absolute"
          className="menu-overlay"
        />
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              style={active ? { color: "var(--burgundy)" } : undefined}
            >
              {item.label}
            </Link>
          );
        })}
        <Link href="#build" className="cta btn btn-primary" style={{ padding: "10px 20px" }} onClick={() => setOpen(false)}>
          Build My Blueprint™
        </Link>
      </nav>
      <button
        className="menu-toggle"
        aria-label="Menu"
        onClick={() => setOpen((v) => !v)}
      >
        ☰
      </button>
    </header>
  );
}

