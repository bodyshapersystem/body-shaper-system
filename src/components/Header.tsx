"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_ITEMS } from "@/lib/nav";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Lock background scroll while the mobile menu is open — standard for a
  // premium mobile menu, and avoids the page scrolling behind the backdrop.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
      <nav className={`menu${open ? " open" : ""}`} id="siteMenu">
        <svg className="menu-overlay" aria-hidden="true" focusable="false">
          <use href="#bss-brand-overlay-pattern" />
        </svg>
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
