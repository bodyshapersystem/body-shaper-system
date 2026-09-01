"use client";

import { useState } from "react";

const BLUEPRINT_TABS: { key: string; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "composition", label: "Composition" },
  { key: "measurements", label: "Measurements" },
  { key: "bodytype", label: "Body Type" },
  { key: "photos", label: "Photos" },
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
    <div>
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
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
