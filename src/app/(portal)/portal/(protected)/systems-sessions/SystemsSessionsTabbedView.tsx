"use client";

import { useState } from "react";

/**
 * Real tab switcher for the new Systems & Sessions™ module. The
 * "system" panel reuses BlueprintReport's existing system/architecture/
 * why-selected sections (data-bp-tab="system", filtered via CSS,
 * same pattern as Blueprint's own tabs) — no duplicated markup or
 * data-fetching. The "sessions" panel reuses the existing real
 * appointments view as-is for this first phase.
 */
export default function SystemsSessionsTabbedView({ systemPanel, sessionsPanel }: { systemPanel: React.ReactNode; sessionsPanel: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<"system" | "sessions">("system");

  return (
    <div style={{ paddingBottom: "calc(92px + env(safe-area-inset-bottom))" }}>
      {activeTab === "system" ? (
        <div className="bp-tabbed-view bp-tabbed-view-systems" data-active-tab="system">
          {systemPanel}
        </div>
      ) : (
        <div>{sessionsPanel}</div>
      )}

      <div className="bp-tab-nav">
        <button type="button" className={`bp-tab-nav-btn${activeTab === "system" ? " bp-tab-nav-btn-active" : ""}`} onClick={() => setActiveTab("system")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <path d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5z" />
          </svg>
          System
        </button>
        <button type="button" className={`bp-tab-nav-btn${activeTab === "sessions" ? " bp-tab-nav-btn-active" : ""}`} onClick={() => setActiveTab("sessions")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <rect x="4" y="5" width="16" height="16" rx="2" /><path d="M4 10h16M8 3v4M16 3v4" />
          </svg>
          Sessions
        </button>
      </div>
    </div>
  );
}
