"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutHubUser } from "@/app/(hub)/hub/login/actions";

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { href: "/hub/dashboard", label: "Dashboard", icon: "grid" },
      { href: "/hub/leads", label: "Leads", icon: "target" },
      { href: "/hub/clients", label: "Clients", icon: "people" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/hub/blueprints", label: "Body Blueprint™", icon: "brain" },
      { href: "/hub/appointments", label: "Appointments", icon: "calendar" },
      { href: "/hub/documents", label: "Client Records™", icon: "doc" },
      { href: "/hub/messages", label: "Messages", icon: "chat" },
      { href: "/hub/measurements", label: "Progress™", icon: "ruler" },
    ],
  },
  {
    label: "Business",
    items: [
      { href: "/hub/rewards", label: "Rewards™", icon: "star" },
      { href: "/hub/payments", label: "Payments", icon: "card" },
      { href: "/hub/analytics", label: "Analytics", icon: "chart" },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/hub/team", label: "Team", icon: "person" },
      { href: "/hub/settings", label: "Settings", icon: "gear" },
    ],
  },
];

function NavIcon({ name }: { name: string }) {
  const common = { viewBox: "0 0 24 24", fill: "none" as const, "aria-hidden": true as const };
  switch (name) {
    case "grid":
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="7" height="7" stroke="currentColor" strokeWidth="1.1" />
          <rect x="13.5" y="3.5" width="7" height="7" stroke="currentColor" strokeWidth="1.1" />
          <rect x="3.5" y="13.5" width="7" height="7" stroke="currentColor" strokeWidth="1.1" />
          <rect x="13.5" y="13.5" width="7" height="7" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "people":
      return (
        <svg {...common}>
          <circle cx="8.5" cy="8" r="2.8" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="16" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.1" />
          <path d="M3.5 19c.8-2.9 2.8-4.3 5-4.3s4.2 1.4 5 4.3" stroke="currentColor" strokeWidth="1.1" />
          <path d="M13.2 14.9c1.6.2 3 1.5 3.6 3.7" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "brain":
      return (
        <svg {...common}>
          <path d="M9 4.5c-2.2 0-3.7 1.7-3.5 3.6C4 8.7 3.2 10 3.2 11.5c0 1.4.7 2.5 1.8 3.1-.1 2.1 1.5 3.9 3.6 3.9.7 0 1.4-.2 1.9-.6" stroke="currentColor" strokeWidth="1.1" />
          <path d="M15 4.5c2.2 0 3.7 1.7 3.5 3.6 1.5.6 2.3 1.9 2.3 3.4 0 1.4-.7 2.5-1.8 3.1.1 2.1-1.5 3.9-3.6 3.9-.7 0-1.4-.2-1.9-.6" stroke="currentColor" strokeWidth="1.1" />
          <line x1="12" y1="4.3" x2="12" y2="18.7" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3.5" y="5.5" width="17" height="15" rx="1" stroke="currentColor" strokeWidth="1.1" />
          <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "doc":
      return (
        <svg {...common}>
          <path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M4 12a8 8 0 1 1 3.3 6.4L4 19.5l1.2-3A7.9 7.9 0 0 1 4 12Z" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "ruler":
      return (
        <svg {...common}>
          <rect x="3" y="8" width="18" height="8" rx="1" stroke="currentColor" strokeWidth="1.1" />
          <path d="M7 8v3M11 8v3M15 8v3" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M12 3.5 14.5 9.6l6.5.5-5 4.3 1.6 6.3L12 17.3 6.4 20.7 8 14.4l-5-4.3 6.5-.5L12 3.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="12" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <line x1="5" y1="20" x2="5" y2="11" stroke="currentColor" strokeWidth="1.1" />
          <line x1="12" y1="20" x2="12" y2="6" stroke="currentColor" strokeWidth="1.1" />
          <line x1="19" y1="20" x2="19" y2="14" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "person":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.3" stroke="currentColor" strokeWidth="1.1" />
          <path d="M5 19.5c1.3-3.4 4-5 7-5s5.7 1.6 7 5" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "gear":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.1" />
          <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6L18 18M18 6l-1.4 1.4M7.4 16.6L6 18" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    default:
      return null;
  }
}

export default function HubSidebar({ userName, roleName }: { userName: string; roleName: string }) {
  const pathname = usePathname();

  return (
    <nav className="psb">
      <div className="psb-inner">
        <div className="psb-word">
          body
          <br />
          shaper
          <br />
          system™
        </div>
        <span className="psb-rule" aria-hidden="true" />
        <button
          type="button"
          className="profile-logout psb-profile psb-profile-top"
          onClick={() => logoutHubUser()}
          aria-label="Log out"
        >
          <span className="profile-logout-avatar">
            {userName
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </span>
          <span className="profile-logout-text">
            {userName}
            <small>{roleName}</small>
          </span>
        </button>
        <ul className="psb-nav">
          {NAV_GROUPS.map((group) => (
            <li key={group.label} className="psb-nav-group">
              <span className="psb-nav-group-label">{group.label}</span>
              <ul>
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={pathname.startsWith(item.href) ? "active" : ""}>
                      <span className="psb-icon">
                        <NavIcon name={item.icon} />
                      </span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
