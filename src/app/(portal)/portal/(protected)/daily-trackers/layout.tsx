"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/portal/daily-trackers", label: "home", icon: "home" },
  { href: "/portal/daily-trackers/journey", label: "journey", icon: "journey" },
  { href: "/portal/daily-trackers/protocol", label: "protocol", icon: "protocol" },
  { href: "/portal/daily-trackers/insights", label: "insights", icon: "insights" },
];

function TabIcon({ name }: { name: string }) {
  switch (name) {
    case "home":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 11.5L12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.5 10v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "journey":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round" />
          <circle cx="12" cy="12" r="5" />
        </svg>
      );
    case "protocol":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M8 2v4M16 2v4M4 9h16" strokeLinecap="round" />
        </svg>
      );
    case "insights":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 19V9M11 19V5M18 19v-7" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function DailyTrackersLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="dtj-shell">
      <header className="dtj-header">
        <button type="button" className="dtj-header-menu" aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>
        <span className="dtj-header-wordmark">body shaper system.</span>
        <span style={{ width: 20 }} />
      </header>
      <div className="dtj-content">{children}</div>
      <nav className="dtj-tabbar">
        {TABS.map((t) => {
          const active = pathname === t.href;
          return (
            <Link key={t.href} href={t.href} className={`dtj-tab ${active ? "dtj-tab-active" : ""}`}>
              <span className="dtj-tab-icon-wrap"><TabIcon name={t.icon} /></span>
              <span>{t.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
