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
    <div>
      {activeTab === "system" ? (
        <div className="bp-tabbed-view bp-tabbed-view-systems" data-active-tab="system">
          {systemPanel}
        </div>
      ) : (
        <div>{sessionsPanel}</div>
      )}

      <div className="bp-tab-nav">
        <button type="button" className={`bp-tab-nav-btn${activeTab === "system" ? " bp-tab-nav-btn-active" : ""}`} onClick={() => setActiveTab("system")}>
          System
        </button>
        <button type="button" className={`bp-tab-nav-btn${activeTab === "sessions" ? " bp-tab-nav-btn-active" : ""}`} onClick={() => setActiveTab("sessions")}>
          Sessions
        </button>
      </div>
    </div>
  );
}
