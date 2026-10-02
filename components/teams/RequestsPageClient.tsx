"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Inbox, Check, X, Ban } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";

interface IncomingRequest {
  _id: string;
  message: string;
  status: string;
  createdAt: string;
  senderId: { _id: string; name: string; username: string; avatar?: string; headline?: string };
  teamId: { _id: string; name: string; projectTitle: string; slug: string };
}

interface SentRequest {
  _id: string;
  message: string;
  status: string;
  createdAt: string;
  teamId: { name: string; projectTitle: string; slug: string };
}

export function RequestsPageClient() {
  const [incoming, setIncoming] = useState<IncomingRequest[] | null>(null);
  const [sent, setSent] = useState<SentRequest[] | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(false);
    try {
      const [incRes, sentRes] = await Promise.all([
        fetch("/api/requests?type=incoming"),
        fetch("/api/requests?type=sent"),
      ]);
      if (!incRes.ok || !sentRes.ok) throw new Error();
      setIncoming((await incRes.json()).data);
      setSent((await sentRes.json()).data);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const respond = async (id: string, status: "accepted" | "rejected" | "cancelled") => {
    setBusy(id);
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Could not update the request");
        return;
      }
      toast.success(
        status === "accepted" ? "Request accepted" : status === "rejected" ? "Request declined" : "Request cancelled"
      );
      load();
    } finally {
      setBusy(null);
    }
  };

  if (error) return <ErrorState onRetry={load} />;

  return (
    <Tabs
      tabs={[
        { id: "incoming", label: "Incoming", count: incoming?.length },
        { id: "sent", label: "Sent", count: sent?.length },
      ]}
    >
      {(tab) => {
        if (tab === "incoming") {
          if (incoming === null) {
            return (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            );
          }
          if (incoming.length === 0) {
            return (
              <EmptyState
                icon={Inbox}
                title="No pending requests"
                description="When someone asks to join one of your teams, it'll show up here."
              />
            );
          }
          return (
            <div className="space-y-3">
              {incoming.map((r) => (
                <div key={r._id} className="rounded-lg border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar name={r.senderId.name} src={r.senderId.avatar} size="md" />
                      <div>
                        <p className="text-[13px] font-medium text-text">
                          {r.senderId.name}{" "}
                          <span className="font-normal text-muted">
                            wants to join{" "}
                            <Link href={`/teams/${r.teamId.slug}`} className="text-accent hover:underline">
                              {r.teamId.projectTitle}
                            </Link>
                          </span>
                        </p>
                        {r.message && (
                          <p className="mt-1 max-w-[52ch] text-[13px] text-muted">{r.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      loading={busy === r._id}
                      onClick={() => respond(r._id, "accepted")}
                    >
                      <Check className="h-3.5 w-3.5" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      loading={busy === r._id}
                      onClick={() => respond(r._id, "rejected")}
                    >
                      <X className="h-3.5 w-3.5" /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (sent === null) {
          return (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          );
        }
        if (sent.length === 0) {
          return (
            <EmptyState
              icon={Inbox}
              title="You haven't requested to join any teams"
              description="Browse open teams and send a request to get started."
              action={
                <Link
                  href="/teams"
                  className="inline-flex h-9 items-center rounded-md bg-accent px-3 text-[13px] font-medium text-on-accent hover:bg-accent-hover"
                >
                  Browse teams
                </Link>
              }
            />
          );
        }
        return (
          <div className="space-y-3">
            {sent.map((r) => (
              <div
                key={r._id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface p-4"
              >
                <div>
                  <p className="text-[13px] font-medium text-text">
                    <Link href={`/teams/${r.teamId.slug}`} className="hover:underline">
                      {r.teamId.projectTitle}
                    </Link>
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted">{r.teamId.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    tone={
                      r.status === "accepted"
                        ? "success"
                        : r.status === "rejected"
                        ? "danger"
                        : r.status === "cancelled"
                        ? "neutral"
                        : "warning"
                    }
                  >
                    {r.status}
                  </Badge>
                  {r.status === "pending" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={busy === r._id}
                      onClick={() => respond(r._id, "cancelled")}
                    >
                      <Ban className="h-3.5 w-3.5" /> Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      }}
    </Tabs>
  );
}
