"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Inbox, Check, X, Ban, UserRoundPlus } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";

interface Person {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  headline?: string;
}

interface TeamSummary {
  _id: string;
  name: string;
  projectTitle: string;
  slug: string;
}

interface IncomingRequest {
  _id: string;
  message: string;
  status: string;
  createdAt: string;
  senderId: Person;
  teamId: TeamSummary;
}

interface IncomingInvitation extends IncomingRequest {
  invitedBy: Person;
}

interface SentRequest {
  _id: string;
  message: string;
  status: string;
  createdAt: string;
  teamId: TeamSummary;
}

interface SentInvitation extends SentRequest {
  senderId: Person;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      tone={
        status === "accepted" ? "success" : status === "rejected" ? "danger" : status === "cancelled" ? "neutral" : "warning"
      }
    >
      {status}
    </Badge>
  );
}

export function RequestsPageClient() {
  const searchParams = useSearchParams();
  const [incoming, setIncoming] = useState<IncomingRequest[] | null>(null);
  const [sent, setSent] = useState<SentRequest[] | null>(null);
  const [receivedInvitations, setReceivedInvitations] = useState<IncomingInvitation[] | null>(null);
  const [sentInvitations, setSentInvitations] = useState<SentInvitation[] | null>(null);
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
      const [incData, sentData] = await Promise.all([incRes.json(), sentRes.json()]);
      setIncoming(incData.data.requests);
      setReceivedInvitations(incData.data.invitations);
      setSent(sentData.data.requests);
      setSentInvitations(sentData.data.invitations);
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
        status === "accepted" ? "Invitation accepted" : status === "rejected" ? "Invitation declined" : "Request cancelled"
      );
      await load();
    } finally {
      setBusy(null);
    }
  };

  if (error) return <ErrorState onRetry={load} />;

  const tabs = [
    { id: "incoming", label: "Join requests", count: incoming?.length },
    { id: "sent", label: "My requests", count: sent?.length },
    { id: "receivedInvites", label: "Invitations", count: receivedInvitations?.filter((item) => item.status === "pending").length },
    { id: "sentInvites", label: "Sent invites", count: sentInvitations?.filter((item) => item.status === "pending").length },
  ];

  return (
    <Tabs tabs={tabs} defaultTab={searchParams.get("tab") === "invites" ? "receivedInvites" : undefined}>
      {(tab) => {
        if (tab === "incoming") {
          if (incoming === null) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
          if (incoming.length === 0) {
            return <EmptyState icon={Inbox} title="No pending join requests" description="Requests from people who want to join your teams will show up here." />;
          }
          return (
            <div className="space-y-3">
              {incoming.map((request) => (
                <div key={request._id} className="rounded-lg border border-border bg-surface p-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={request.senderId.name} src={request.senderId.avatar} size="md" />
                    <div>
                      <p className="text-[13px] font-medium text-text">
                        <Link href={`/developers/${request.senderId.username}`} className="hover:text-accent hover:underline">{request.senderId.name}</Link>{" "}
                        <span className="font-normal text-muted">wants to join{" "}
                          <Link href={`/teams/${request.teamId.slug}`} className="text-accent hover:underline">{request.teamId.projectTitle}</Link>
                        </span>
                      </p>
                      {request.message && <p className="mt-1 max-w-[52ch] text-[13px] text-muted">{request.message}</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" loading={busy === request._id} onClick={() => respond(request._id, "accepted")}><Check className="h-3.5 w-3.5" /> Accept</Button>
                    <Button size="sm" variant="outline" loading={busy === request._id} onClick={() => respond(request._id, "rejected")}><X className="h-3.5 w-3.5" /> Decline</Button>
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (tab === "sent") {
          if (sent === null) return <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
          if (sent.length === 0) {
            return <EmptyState icon={Inbox} title="You haven't requested to join a team" description="Browse open teams and send a request to get started." action={<Link href="/teams" className="inline-flex h-9 items-center rounded-md bg-accent px-3 text-[13px] font-medium text-on-accent hover:bg-accent-hover">Browse teams</Link>} />;
          }
          return (
            <div className="space-y-3">
              {sent.map((request) => (
                <div key={request._id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4">
                  <div>
                    <p className="text-[13px] font-medium text-text"><Link href={`/teams/${request.teamId.slug}`} className="hover:underline">{request.teamId.projectTitle}</Link></p>
                    <p className="mt-0.5 text-[12px] text-muted">{request.teamId.name}</p>
                  </div>
                  <div className="flex items-center gap-2"><StatusBadge status={request.status} />{request.status === "pending" && <Button size="sm" variant="ghost" loading={busy === request._id} onClick={() => respond(request._id, "cancelled")}><Ban className="h-3.5 w-3.5" /> Cancel</Button>}</div>
                </div>
              ))}
            </div>
          );
        }

        if (tab === "receivedInvites") {
          if (receivedInvitations === null) return <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
          if (receivedInvitations.length === 0) {
            return <EmptyState icon={UserRoundPlus} title="No team invitations yet" description="When a team invites you to join, you can review it here." />;
          }
          return (
            <div className="space-y-3">
              {receivedInvitations.map((invitation) => (
                <div key={invitation._id} className="rounded-lg border border-border bg-surface p-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={invitation.invitedBy.name} src={invitation.invitedBy.avatar} size="md" />
                    <div>
                      <p className="text-[13px] font-medium text-text">
                        <Link href={`/developers/${invitation.invitedBy.username}`} className="hover:text-accent hover:underline">{invitation.invitedBy.name}</Link>{" "}
                        <span className="font-normal text-muted">invited you to join{" "}
                          <Link href={`/teams/${invitation.teamId.slug}`} className="text-accent hover:underline">{invitation.teamId.projectTitle}</Link>
                        </span>
                      </p>
                      {invitation.message && <p className="mt-1 max-w-[52ch] text-[13px] text-muted">{invitation.message}</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {invitation.status === "pending" ? (
                      <>
                        <Button size="sm" loading={busy === invitation._id} onClick={() => respond(invitation._id, "accepted")}><Check className="h-3.5 w-3.5" /> Accept</Button>
                        <Button size="sm" variant="outline" loading={busy === invitation._id} onClick={() => respond(invitation._id, "rejected")}><X className="h-3.5 w-3.5" /> Decline</Button>
                      </>
                    ) : <StatusBadge status={invitation.status} />}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (sentInvitations === null) return <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
        if (sentInvitations.length === 0) {
          return <EmptyState icon={UserRoundPlus} title="No team invites sent" description="Use TeamForge Match to find and invite people to one of your projects." action={<Link href="/team-match" className="inline-flex h-9 items-center rounded-md bg-accent px-3 text-[13px] font-medium text-on-accent hover:bg-accent-hover">Find my team</Link>} />;
        }
        return (
          <div className="space-y-3">
            {sentInvitations.map((invitation) => (
              <div key={invitation._id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={invitation.senderId.name} src={invitation.senderId.avatar} size="sm" />
                  <div>
                    <p className="text-[13px] font-medium text-text"><Link href={`/developers/${invitation.senderId.username}`} className="hover:underline">{invitation.senderId.name}</Link></p>
                    <p className="mt-0.5 text-[12px] text-muted"><Link href={`/teams/${invitation.teamId.slug}`} className="hover:text-accent hover:underline">{invitation.teamId.projectTitle}</Link></p>
                  </div>
                </div>
                <div className="flex items-center gap-2"><StatusBadge status={invitation.status} />{invitation.status === "pending" && <Button size="sm" variant="ghost" loading={busy === invitation._id} onClick={() => respond(invitation._id, "cancelled")}><Ban className="h-3.5 w-3.5" /> Cancel</Button>}</div>
              </div>
            ))}
          </div>
        );
      }}
    </Tabs>
  );
}
