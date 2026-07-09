"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardSidebar({ active }: { active: "dashboard" | "settings" }) {
  const [open, setOpen] = useState(false);
  const [rewardsUnlocked, setRewardsUnlocked] = useState(false);

  useEffect(() => {
    setRewardsUnlocked(window.localStorage.getItem("bss_rewards_unlocked") === "1");
  }, []);

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setOpen((v) => !v)}>
        ☰
      </button>
      <aside className={`dash-sidebar${open ? " open" : ""}`}>
        <span className="logo">body shaper system™</span>
        <nav className="dash-nav">
          <Link href="/client-dashboard" className={active === "dashboard" ? "active" : ""}>
            Dashboard
          </Link>
          <a href="#">Appointments</a>
          <Link href="/client-welcome">Client Guide</Link>
          <a href="#">Prepare Your Experience</a>
          <Link href="/tech-talks">Tech Talks™</Link>
          <div className="divider" />
          {rewardsUnlocked && (
            <Link href="/client-dashboard#rewards">
              Blueprint Rewards™ <span className="badge">✨ New</span>
            </Link>
          )}
          <a href="#">Secret Challenges™</a>
          <div className="divider" />
          <Link href="/client-settings" className={active === "settings" ? "active" : ""}>
            Settings
          </Link>
          <Link href="/client-access">Logout</Link>
        </nav>
      </aside>
    </>
  );
}
