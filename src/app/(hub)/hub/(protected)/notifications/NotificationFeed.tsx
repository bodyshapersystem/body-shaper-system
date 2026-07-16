"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { markNotificationRead, markAllNotificationsRead, getRecentNotifications } from "./actions";

type NotificationItem = {
  id: string;
  clientId: string | null;
  clientName: string | null;
  category: string;
  description: string;
  linkUrl: string | null;
  readAt: string | null;
  createdAt: string;
};

const CATEGORY_ICONS: Record<string, string> = {
  PORTAL: "🟢",
  FORMS: "📝",
  APPOINTMENTS: "📅",
  PAYMENTS: "💳",
  DOCUMENTS: "📋",
  REWARDS: "⭐",
  GENERAL: "🔔",
};

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function NotificationFeed({ initialNotifications }: { initialNotifications: NotificationItem[] }) {
  const [items, setItems] = useState(initialNotifications);
  const [filter, setFilter] = useState<string>("");

  // Polling, not a websocket/Supabase Realtime subscription — refreshes
  // every 20s so the feed feels live without a manual page reload,
  // without the added complexity of a true push-based subscription.
  const refresh = useCallback(async () => {
    const result = await getRecentNotifications(50);
    if (result?.success) setItems(result.notifications.map((n) => ({
      id: n.id,
      clientId: n.clientId,
      clientName: n.client ? `${n.client.firstName} ${n.client.lastName}` : null,
      category: n.category,
      description: n.description,
      linkUrl: n.linkUrl,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    })));
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 20000);
    return () => clearInterval(interval);
  }, [refresh]);

  async function handleMarkRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    await markNotificationRead(id);
  }

  async function handleMarkAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    await markAllNotificationsRead();
  }

  const categories = Array.from(new Set(items.map((n) => n.category)));
  const filtered = filter ? items.filter((n) => n.category === filter) : items;
  const unreadCount = items.filter((n) => !n.readAt).length;

  return (
    <div>
      <div className="notif-toolbar">
        <div className="notif-filters">
          <button type="button" className={`notif-filter-pill ${!filter ? "notif-filter-pill-active" : ""}`} onClick={() => setFilter("")}>
            All
          </button>
          {categories.map((c) => (
            <button key={c} type="button" className={`notif-filter-pill ${filter === c ? "notif-filter-pill-active" : ""}`} onClick={() => setFilter(c)}>
              {CATEGORY_ICONS[c] ?? ""} {c.charAt(0) + c.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <button type="button" className="dash-view-btn" onClick={handleMarkAllRead}>
            Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      <div className="notif-list">
        {filtered.length === 0 && <div className="module-empty">No activity yet.</div>}
        {filtered.map((n) => (
          <div key={n.id} className={`notif-item ${!n.readAt ? "notif-item-unread" : ""}`}>
            <span className="notif-icon">{CATEGORY_ICONS[n.category] ?? "🔔"}</span>
            <div className="notif-body">
              <p className="notif-desc">{n.description}</p>
              <p className="notif-meta">{relativeTime(n.createdAt)}</p>
            </div>
            <div className="notif-actions">
              {n.linkUrl && (
                <Link href={n.linkUrl} className="notif-link" onClick={() => !n.readAt && handleMarkRead(n.id)}>
                  View Client →
                </Link>
              )}
              {!n.readAt && (
                <button type="button" className="notif-mark-read" onClick={() => handleMarkRead(n.id)}>
                  Mark read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
