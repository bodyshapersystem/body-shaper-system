"use client";

import { useState } from "react";
import type { MonthlySummary, TimelineEvent, InsightMoment } from "@/lib/body-response-timeline";
import { IconByKey } from "@/components/DTJIcons";

type TimelineItem = TimelineEvent & { dayLabel: string; timeLabel: string };

export default function InsightsView({ summary, timeline, insightMoments }: { summary: MonthlySummary; timeline: TimelineItem[]; insightMoments: InsightMoment[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? timeline : timeline.slice(0, 6);
  const monthName = new Date().toLocaleDateString("en-US", { month: "long" }).toLowerCase();

  return (
    <div className="dtj-today">
      <p className="dtj-page-title">insights</p>

      <div className="dtj-summary-card">
        <p className="dtj-mini-label">{monthName} summary</p>
        <div className="dtj-summary-stats">
          <div>
            <strong>{summary.consistency}%</strong>
            <span>consistency</span>
          </div>
          <div>
            <strong>{summary.treatmentsCompleted}</strong>
            <span>treatments</span>
          </div>
          <div>
            <strong>{summary.progressDelta >= 0 ? "+" : ""}{summary.progressDelta}%</strong>
            <span>progress</span>
          </div>
        </div>
      </div>

      {insightMoments.map((m, i) => (
        <div key={i} className="dtj-insight-moment-card">
          <p className="dtj-insight-moment-headline">{m.headline}</p>
          <p className="dtj-insight-moment-body">{m.body}</p>
        </div>
      ))}

      <p className="dtj-field-label">body response timeline™</p>

      {timeline.length === 0 && (
        <p className="pay-history-meta">Nothing logged yet — your timeline will build as you track.</p>
      )}

      <div className="dtj-timeline">
        {visible.map((event, i) => (
          <div key={event.id} className="dtj-timeline-row">
            <div className="dtj-timeline-marker-col">
              <span className="dtj-timeline-icon"><IconByKey iconKey={event.icon} /></span>
              {i < visible.length - 1 && <span className="dtj-timeline-line" />}
            </div>
            <div className="dtj-timeline-content">
              <p className="dtj-timeline-when">{event.dayLabel}, {event.timeLabel}</p>
              <p className="dtj-timeline-title">{event.title}</p>
              <p className="dtj-timeline-detail">{event.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {!showAll && timeline.length > 6 && (
        <button type="button" className="dtj-view-all-btn" onClick={() => setShowAll(true)}>
          view full timeline
        </button>
      )}

      <p className="dtj-footer-tag">bodyshapersystem.com</p>
    </div>
  );
}
