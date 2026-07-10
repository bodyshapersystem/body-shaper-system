import Link from "next/link";

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 19.5c1.3-3.4 4-5 7-5s5.7 1.6 7 5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/**
 * ClientPortalButton — the single official "Client Portal" entry
 * point, per the BSS design system. Same size, radius, border,
 * typography and spacing everywhere it appears (public site header,
 * public site drawer). Do not create a per-page variant — import this.
 */
export default function ClientPortalButton({
  className = "",
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link href="/portal/login" className={`client-portal-btn ${className}`} onClick={onClick}>
      <span className="cp-icon">
        <IconUser />
      </span>
      Client Portal
    </Link>
  );
}
