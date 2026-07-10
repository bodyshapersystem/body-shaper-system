"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/portal/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/portal/blueprint", label: "My Body Blueprint™", icon: "brain" },
  { href: "/portal/appointments", label: "Appointments", icon: "calendar" },
  { href: "/portal/daily-trackers", label: "Daily Trackers", icon: "drop" },
  { href: "/portal/rewards", label: "Body Rewards™", icon: "star" },
  { href: "/portal/photos", label: "Progress Photos", icon: "camera" },
  { href: "/portal/documents", label: "Documents", icon: "doc" },
  { href: "/portal/messages", label: "Messages", icon: "chat" },
  { href: "/portal/profile", label: "Profile", icon: "person" },
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
    case "drop":
      return (
        <svg {...common}>
          <path d="M12 3.5c3 4 6 7.6 6 11a6 6 0 1 1-12 0c0-3.4 3-7 6-11Z" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M12 3.5 14.5 9.6l6.5.5-5 4.3 1.6 6.3L12 17.3 6.4 20.7 8 14.4l-5-4.3 6.5-.5L12 3.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="12" cy="13.5" r="3.4" stroke="currentColor" strokeWidth="1.1" />
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
    case "person":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.3" stroke="currentColor" strokeWidth="1.1" />
          <path d="M5 19.5c1.3-3.4 4-5 7-5s5.7 1.6 7 5" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("bss_portal_demo_auth");
    }
    router.push("/portal/login");
  }

  return (
    <nav className="psb">
      <div className="psb-word">
        body
        <br />
        shaper
        <br />
        system™
      </div>
      <ul className="psb-nav">
        {NAV.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={pathname === item.href ? "active" : ""}>
              <span className="psb-icon">
                <NavIcon name={item.icon} />
              </span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <button type="button" className="psb-logout" onClick={handleLogout}>
        Log out (demo)
      </button>
    </nav>
  );
}
