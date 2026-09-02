"use client";

import { useState } from "react";
import type { ReactElement } from "react";

const BLUEPRINT_TABS: { key: string; label: string; icon: ReactElement }[] = [
  { key: "overview", label: "Overview", icon: <circle cx="12" cy="12" r="9" /> },
  { key: "composition", label: "Composition", icon: <rect x="4" y="4" width="16" height="16" rx="2" /> },
  { key: "measurements", label: "Measurements", icon: <path d="M4 12h16M4 8v8M20 8v8M9 10v4M15 10v4" /> },
  { key: "bodytype", label: "Body Type", icon: <path d="M12 2v20M8 6c0 2 4 2 4 4s-4 2-4 4 4 2 4 4" /> },
  { key: "photos", label: "Photos", icon: <><rect x="4" y="6" width="16" height="14" rx="2" /><circle cx="12" cy="13" r="3" /></> },
];

/**
 * Real tab filtering for the client-facing Body Blueprint™ — reuses
 * the exact same BlueprintReport markup/data (passed as children,
 * already fetched once), just shows/hides its existing data-bp-tab
 * sections via CSS depending on which tab is active. No section's
 * JSX or data-fetching logic is duplicated or rewritten; the Owner
 * Hub's single-page view (BlueprintReport rendered directly, without
 * this wrapper) is completely unaffected.
 */
export default function BlueprintTabbedView({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div style={{ paddingBottom: "calc(92px + env(safe-area-inset-bottom))" }}>
      <div className={`bp-tabbed-view bp-tabbed-view-blueprint`} data-active-tab={activeTab}>
        {children}
      </div>
      <div className="bp-tab-nav">
        {BLUEPRINT_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`bp-tab-nav-btn${activeTab === t.key ? " bp-tab-nav-btn-active" : ""}`}
            onClick={() => {
              setActiveTab(t.key);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              {t.icon}
            </svg>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
