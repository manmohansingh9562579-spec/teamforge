"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface NotificationItem {
  _id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationsPageClient() {
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setItems(json.data.notifications);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    load();
  };

  const markRead = async (id: string) => {
    setItems((prev) => prev?.map((n) => (n._id === id ? { ...n, isRead: true } : n)) ?? null);
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
  };

  if (error) return <ErrorState onRetry={load} />;

  if (items === null) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No notifications yet"
        description="You'll see updates here when something happens on your teams."
      />
    );
  }

  const unread = items.some((n) => !n.isRead);

  return (
    <div>
      {unread && (
        <div className="mb-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
          </Button>
        </div>
      )}
      <div className="space-y-1">
        {items.map((n) => (
          <button
            key={n._id}
            onClick={() => !n.isRead && markRead(n._id)}
            className={cn(
              "flex w-full items-start gap-3 rounded-md p-3 text-left transition-colors hover:bg-surface-hover",
              !n.isRead && "bg-accent-soft/40"
            )}
          >
            {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />}
            <div className={cn("flex-1", n.isRead && "pl-5")}>
              <p className="text-[13px] text-text">{n.message}</p>
              <p className="mt-0.5 text-[12px] text-muted">{timeAgo(n.createdAt)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
