"use client";

import { useRouter } from "next/navigation";

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M16 16l4-4-4-4M20 12H9" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/**
 * ProfileLogout — the single official compact profile/logout block,
 * per the BSS design system: avatar, name, tier, small logout icon,
 * one row, minimal height. Used identically by the public site drawer
 * (only when a demo session is active) and the Client Portal sidebar.
 * Logging out always exits to the public Home page — never back to a
 * sign-in screen.
 */
export default function ProfileLogout({
  name = "Emmy Murillo",
  tier = "Gold Member",
  className = "",
  onLogout,
}: {
  name?: string;
  tier?: string;
  className?: string;
  onLogout?: () => void | Promise<void>;
}) {
  const router = useRouter();
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleLogout() {
    if (onLogout) {
      await onLogout();
      return;
    }
    // Default fallback (public-site demo drawer): clear the demo flag
    // and return to the public Home page.
    window.sessionStorage.removeItem("bss_portal_demo_auth");
    router.push("/");
  }

  return (
    <button type="button" className={`profile-logout ${className}`} onClick={handleLogout} aria-label="Log out">
      <span className="profile-logout-avatar">{initials}</span>
      <span className="profile-logout-text">
        {name}
        <small>{tier}</small>
      </span>
      <span className="profile-logout-icon" aria-hidden="true">
        <IconLogout />
      </span>
    </button>
  );
}
