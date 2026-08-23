"use client";

import type { WeekTask } from "@/lib/protocol-sync";
import type { AddonType } from "@/lib/tech-support-config";
import TechSupportSection from "./TechSupportSection";

function consistencyTier(score: number): string {
  if (score >= 90) return "excellent";
  if (score >= 70) return "strong";
  if (score >= 40) return "building";
  return "just getting started";
}

function StatusMark({ status }: { status: WeekTask["status"] }) {
  if (status === "complete") return <span className="dtj-status-mark dtj-status-complete">✓</span>;
  if (status === "skipped") return <span className="dtj-status-mark dtj-status-skipped">–</span>;
  return <span className="dtj-status-mark dtj-status-pending" />;
}

export default function ProtocolSyncView({
  tasks,
  consistencyScore,
  weekDays,
  systemName,
  allowedAddons,
}: {
  tasks: WeekTask[];
  consistencyScore: number;
  weekDays: { label: string; dateNum: number; isToday: boolean }[];
  systemName: string | null;
  allowedAddons: AddonType[];
}) {
  return (
    <div className="dtj-today">
      <p className="dtj-page-title">protocol sync™</p>

      <div className="dtj-consistency-card">
        <div>
          <p className="dtj-mini-label">consistency score</p>
          <p className="dtj-consistency-num">{consistencyScore}%</p>
          <p className="dtj-mini-sub" style={{ textTransform: "capitalize" }}>{consistencyTier(consistencyScore)}</p>
        </div>
        <div className="dtj-consistency-ring" style={{ background: `conic-gradient(var(--rose) ${consistencyScore * 3.6}deg, rgba(107,82,64,0.1) 0)` }}>
          <div className="dtj-consistency-ring-inner">✦</div>
        </div>
      </div>

      <p className="dtj-field-label">this week</p>
      <div className="dtj-week-row">
        {weekDays.map((d, i) => (
          <div key={i} className={`dtj-week-day ${d.isToday ? "dtj-week-day-today" : ""}`}>
            <span>{d.label}</span>
            <span className="dtj-week-daynum">{d.dateNum}</span>
          </div>
        ))}
      </div>

      <div className="dtj-task-list">
        {tasks.length === 0 && <p className="pay-history-meta">Nothing scheduled this week yet.</p>}
        {tasks.map((t) => (
          <div key={t.id} className="dtj-task-row">
            <span className="dtj-task-icon">{t.icon}</span>
            <div className="dtj-task-info">
              <p className="dtj-task-label">{t.label}</p>
              <p className="dtj-task-detail">{t.detail}</p>
            </div>
            <StatusMark status={t.status} />
          </div>
        ))}
      </div>

      <TechSupportSection allowedAddons={allowedAddons} systemName={systemName} />

      <div className="dtj-smart-reminders-card">
        <span>smart reminders</span>
        <p>we'll keep you on track</p>
      </div>

      <p className="dtj-celebration" style={{ fontSize: 14 }}>small steps. one system.</p>
      <p className="dtj-footer-tag">bodyshapersystem.com</p>
    </div>
  );
}
