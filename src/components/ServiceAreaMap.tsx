"use client";

import { useRef, useState } from "react";

type RegionId = "miami-dade" | "broward" | "palm-beach";

const REGIONS: Record<
  RegionId,
  { name: string; fill: string; fee: string; availability: string; hours: string }
> = {
  "miami-dade": {
    name: "Miami-Dade",
    fill: "#6B5240",
    fee: "Included",
    availability: "Full Availability",
    hours: "Mon – Sat, 9am – 7pm",
  },
  broward: {
    name: "Broward",
    fill: "#D8CEC0",
    fee: "$25 Travel Fee",
    availability: "Limited Availability",
    hours: "Tue – Sat, 10am – 6pm",
  },
  "palm-beach": {
    name: "Palm Beach",
    fill: "#8A8B6C",
    fee: "$50 Travel Fee",
    availability: "By Appointment",
    hours: "Select Weekdays",
  },
};

export default function ServiceAreaMap() {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState<RegionId | null>(null);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  function clampScale(s: number) {
    return Math.min(2.4, Math.max(0.8, s));
  }

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
  }

  function onPointerUp() {
    dragging.current = false;
  }

  function zoomIn() {
    setScale((s) => clampScale(s + 0.25));
  }
  function zoomOut() {
    setScale((s) => clampScale(s - 0.25));
  }
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    setScale((s) => clampScale(s - e.deltaY * 0.001));
  }

  function selectRegion(id: RegionId) {
    setActive((cur) => (cur === id ? null : id));
  }

  const info = active ? REGIONS[active] : null;

  return (
    <div className="sam-wrap">
      <div
        className={`sam-canvas${dragging.current ? " dragging" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        <svg
          className="sam-svg"
          viewBox="0 0 400 500"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: dragging.current ? "none" : "transform .2s ease",
          }}
        >
          {/* Palm Beach (north) */}
          <path
            className={`sam-region${active === "palm-beach" ? " active" : ""}`}
            d="M120 40 L280 40 L270 150 L250 165 L140 165 L110 120 Z"
            fill={REGIONS["palm-beach"].fill}
            onClick={() => selectRegion("palm-beach")}
          />
          <text x="195" y="105" textAnchor="middle" className="sam-region-label" fill="#F5EEE4">
            Palm Beach
          </text>

          {/* Broward (middle) */}
          <path
            className={`sam-region${active === "broward" ? " active" : ""}`}
            d="M140 165 L250 165 L245 270 L225 285 L155 285 L135 245 Z"
            fill={REGIONS["broward"].fill}
            onClick={() => selectRegion("broward")}
          />
          <text x="192" y="228" textAnchor="middle" className="sam-region-label">
            Broward
          </text>

          {/* Miami-Dade (south) */}
          <path
            className={`sam-region${active === "miami-dade" ? " active" : ""}`}
            d="M155 285 L225 285 L235 380 L210 440 L165 460 L130 400 L140 320 Z"
            fill={REGIONS["miami-dade"].fill}
            onClick={() => selectRegion("miami-dade")}
          />
          <text x="185" y="370" textAnchor="middle" className="sam-region-label" fill="#F5EEE4">
            Miami-Dade
          </text>

          {/* Pin marker */}
          <g className="sam-pin" onClick={() => selectRegion("miami-dade")}>
            <circle cx="182" cy="345" r="6" className="sam-pin-dot" />
            <circle cx="182" cy="345" r="12" fill="none" stroke="#8B2E3A" strokeWidth="1" opacity="0.5" />
            <text x="182" y="318" textAnchor="middle" className="sam-pin-label">
              We come to you.
            </text>
          </g>
        </svg>
      </div>

      <div className="sam-legend">
        <div className="row">
          <span className="swatch" style={{ background: REGIONS["miami-dade"].fill }} />
          Miami-Dade
        </div>
        <div className="row">
          <span className="swatch" style={{ background: REGIONS["broward"].fill }} />
          Broward
        </div>
        <div className="row">
          <span className="swatch" style={{ background: REGIONS["palm-beach"].fill }} />
          Palm Beach
        </div>
      </div>

      <div className="sam-controls">
        <button onClick={zoomIn} aria-label="Zoom in">+</button>
        <button onClick={zoomOut} aria-label="Zoom out">–</button>
      </div>

      {info && (
        <div className="sam-popup">
          <button className="close" onClick={() => setActive(null)} aria-label="Close">
            ✕
          </button>
          <h4>{info.name}</h4>
          <div className="row">
            <span className="lbl">Travel Fee</span>
            <span className="val">{info.fee}</span>
          </div>
          <div className="row">
            <span className="lbl">Availability</span>
            <span className="val">{info.availability}</span>
          </div>
          <div className="row">
            <span className="lbl">Hours</span>
            <span className="val">{info.hours}</span>
          </div>
        </div>
      )}
    </div>
  );
}
