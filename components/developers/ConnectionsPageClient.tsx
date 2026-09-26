"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, Clock3, Inbox, Network, UserRoundPlus, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";

interface ContactPerson {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  headline?: string;
  location?: string;
  skills: string[];
  preferredRoles: string[];
  availability?: string;
}

interface ContactRecord {
  id: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  createdAt: string;
  updatedAt: string;
  person: ContactPerson | null;
}

interface ContactsData {
  incoming: ContactRecord[];
  outgoing: ContactRecord[];
  connections: ContactRecord[];
}

function PersonSummary({ person }: { person: ContactPerson | null }) {
  if (!person) {
    return (
      <div className="min-w-0">
        <p className="font-medium text-text">Profile unavailable</p>
        <p className="mt-1 text-sm text-muted">This account may have been removed.</p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={person.name} src={person.avatar} size="lg" />
      <div className="min-w-0">
        <p className="truncate font-medium text-text">{person.name}</p>
        <p className="truncate text-sm text-muted">@{person.username}</p>
        {person.headline && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{person.headline}</p>}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {person.preferredRoles.slice(0, 1).map((role) => (
            <Badge key={role} tone="accent">{role}</Badge>
          ))}
          {person.location && <Badge>{person.location}</Badge>}
          {person.availability === "Available" && <Badge tone="success">Available</Badge>}
        </div>
      </div>
    </div>
  );
}

function ProfileLink({ person }: { person: ContactPerson | null }) {
  if (!person) return null;
  return (
    <Link
      href={`/developers/${person.username}`}
      className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-accent transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
    >
      View profile
    </Link>
  );
}

export function ConnectionsPageClient() {
  const [data, setData] = useState<ContactsData | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(false);
    try {
      const response = await fetch("/api/contact");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not load your connections");
      setData(result.data as ContactsData);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const respond = async (id: string, action: "accepted" | "rejected" | "cancelled") => {
    setBusy(id);
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not update the request");
      if (action === "accepted") toast.success("You’re now connected");
      if (action === "rejected") toast.success("Request declined");
      if (action === "cancelled") toast.success("Request cancelled");
      await load();
    } catch (actionError) {
      toast.error(actionError instanceof Error ? actionError.message : "Could not update the request");
    } finally {
      setBusy(null);
    }
  };

  if (error) return <ErrorState onRetry={load} />;

  if (data === null) {
    return (
      <div className="grid gap-5 lg:grid-cols-2">
        {[1, 2].map((key) => (
          <div key={key} className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-36 w-full rounded-xl" />
            <Skeleton className="h-36 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="incoming-title">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="incoming-title" className="text-lg font-semibold tracking-tight text-text">Incoming requests</h2>
            <Badge>{data.incoming.length}</Badge>
          </div>
          {data.incoming.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="You’re all caught up"
              description="New connection requests from other developers will appear here."
            />
          ) : (
            <div className="space-y-3">
              {data.incoming.map((request) => (
                <Card key={request.id} className="p-4 transition-shadow hover:shadow-raised sm:p-5">
                  <PersonSummary person={request.person} />
                  {request.message && (
                    <p className="mt-4 rounded-lg bg-bg px-3.5 py-3 text-sm leading-relaxed text-muted">
                      “{request.message}”
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                    <ProfileLink person={request.person} />
                    <div className="flex gap-2">
                      <Button size="sm" loading={busy === request.id} onClick={() => respond(request.id, "accepted")}>
                        <Check className="h-4 w-4" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy === request.id} onClick={() => respond(request.id, "rejected")}>
                        <X className="h-4 w-4" /> Decline
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="outgoing-title">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="outgoing-title" className="text-lg font-semibold tracking-tight text-text">Outgoing requests</h2>
            <Badge>{data.outgoing.length}</Badge>
          </div>
          {data.outgoing.length === 0 ? (
            <EmptyState
              icon={UserRoundPlus}
              title="No pending requests"
              description="When you invite someone to connect, you can follow its status here."
              action={
                <Link href="/discover" className="inline-flex min-h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover">
                  Discover developers
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {data.outgoing.map((request) => (
                <Card key={request.id} className="p-4 transition-shadow hover:shadow-raised sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <PersonSummary person={request.person} />
                    <Badge tone="warning" className="shrink-0"><Clock3 className="mr-1 h-3 w-3" /> Pending</Badge>
                  </div>
                  {request.message && (
                    <p className="mt-4 rounded-lg bg-bg px-3.5 py-3 text-sm leading-relaxed text-muted">
                      “{request.message}”
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <ProfileLink person={request.person} />
                    <Button size="sm" variant="ghost" loading={busy === request.id} onClick={() => respond(request.id, "cancelled")}>
                      Cancel
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      <section aria-labelledby="connections-title">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 id="connections-title" className="text-lg font-semibold tracking-tight text-text">Connected</h2>
            <p className="mt-1 text-sm text-muted">Developers who have accepted your request or invitation.</p>
          </div>
          <Badge tone="success">{data.connections.length}</Badge>
        </div>
        {data.connections.length === 0 ? (
          <EmptyState
            icon={Network}
            title="Your network starts here"
            description="Connect with developers whose skills and interests fit your next project."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.connections.map((connection) => (
              <Card key={connection.id} className="flex items-center justify-between gap-3 p-4 transition-shadow hover:shadow-raised">
                <PersonSummary person={connection.person} />
                <div className="shrink-0 text-right">
                  <Badge tone="success"><Check className="mr-1 h-3 w-3" /> Connected</Badge>
                  {connection.person && (
                    <Link href={`/developers/${connection.person.username}`} className="mt-2 block text-xs font-medium text-accent hover:underline">
                      View profile
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
