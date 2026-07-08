"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_ITEMS } from "@/lib/nav";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header id="siteHeader" className="scrolled">
      <Link href="/" className="logo" style={{ color: "var(--charcoal)" }}>
        Body Shaper System
        <sup style={{ fontSize: 10 }}>™</sup>
      </Link>
      <nav className={`menu${open ? " open" : ""}`} id="siteMenu">
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
        <Link href="#build" className="cta btn btn-dark-outline" style={{ padding: "10px 20px" }} onClick={() => setOpen(false)}>
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
