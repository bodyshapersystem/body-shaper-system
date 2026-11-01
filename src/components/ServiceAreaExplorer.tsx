"use client";

import { useState } from "react";
import MiamiMap, { ZONE_OPTIONS } from "@/components/blueprint/MiamiMap";
import { REGIONS, type RegionId } from "@/components/ServiceAreaMap";

/** Service Area: the same interactive Miami map as Build Your Blueprint™, with each region's travel terms. */
function regionFor(id: string | null): RegionId | null {
  if (!id || id === "other") return null;
  if (id === "fort-lauderdale") return "broward";
  if (id === "west-palm-beach") return "palm-beach";
  return "miami-dade";
}

export default function ServiceAreaExplorer() {
  const [zone, setZone] = useState<string | null>(null);
  const region = regionFor(zone);
  const info = region ? REGIONS[region] : null;
  const label = ZONE_OPTIONS.find((z) => z.id === zone)?.label;
  return (
    <div className="sae">
      <MiamiMap value={zone} onChange={setZone} />
      <div className="sae-info" aria-live="polite">
        {info && label ? (
          <>
            <p className="sae-area">{label}</p>
            <div className="sae-row"><span>region</span><b>{info.name}</b></div>
            <div className="sae-row"><span>travel fee</span><b>{info.fee}</b></div>
            <div className="sae-row"><span>availability</span><b>{info.availability}</b></div>
            <div className="sae-row"><span>hours</span><b>{info.hours}</b></div>
          </>
        ) : zone === "other" ? (
          <p className="sae-area">extended areas are available — message us and we&apos;ll confirm your travel details.</p>
        ) : (
          <p className="sae-hint">tap your area on the map, or choose it below, to see travel details.</p>
        )}
      </div>
      <div className="sae-legend">
        {(Object.keys(REGIONS) as RegionId[]).map((r) => (
          <div key={r} className={region === r ? "on" : ""}>
            <b>{REGIONS[r].name}</b>
            <span>{REGIONS[r].fee}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
