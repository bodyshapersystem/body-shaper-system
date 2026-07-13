"use client";

import { useState } from "react";

type Point = { date: string; revenue: number; newClients: number; completedSessions: number };

export default function GrowthChart({ data }: { data: Point[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return <p className="dash-empty">No revenue data in this range yet.</p>;
  }

  const width = 720;
  const height = 220;
  const padding = 30;
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  function pointsFor(key: keyof Point) {
    return data
      .map((d, i) => {
        const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
        const y = height - padding - ((d[key] as number) / maxRevenue) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");
  }

  return (
    <div className="analytics-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="analytics-chart-svg" preserveAspectRatio="none">
        <polyline points={pointsFor("revenue")} fill="none" stroke="#5C1A1F" strokeWidth="2" />
        {data.map((d, i) => {
          const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
          const y = height - padding - (d.revenue / maxRevenue) * (height - padding * 2);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={hoverIdx === i ? 4 : 2.5}
              fill="#5C1A1F"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{ transition: "r 0.15s ease" }}
            />
          );
        })}
      </svg>
      {hoverIdx !== null && (
        <div className="analytics-chart-tooltip">
          <strong>{data[hoverIdx].date}</strong>
          <span>${data[hoverIdx].revenue.toLocaleString()}</span>
        </div>
      )}
      <div className="analytics-chart-axis">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
