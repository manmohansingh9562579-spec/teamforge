"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Check, Clock3, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

type Relationship = {
  status: "pending" | "accepted" | "rejected" | "cancelled";
  direction: "incoming" | "outgoing";
};

export function ContactButton({
  recipientId,
  recipientName,
}: {
  recipientId: string;
  recipientName: string;
}) {
  const { status: authStatus } = useSession();
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [checking, setChecking] = useState(true);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const loadRelationship = useCallback(async () => {
    try {
      const response = await fetch(`/api/contact?with=${encodeURIComponent(recipientId)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not check your connection");
      setRelationship(result.data.relationship);
    } catch {
      setRelationship(null);
    } finally {
      setChecking(false);
    }
  }, [recipientId]);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (authStatus === "unauthenticated") {
      setChecking(false);
      return;
    }
    setChecking(true);
    loadRelationship();
  }, [authStatus, loadRelationship]);

  const closeDialog = useCallback(() => setOpen(false), []);

  const sendRequest = async () => {
    setSending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId, message }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 409) await loadRelationship();
        throw new Error(result.error ?? "Could not send your request");
      }
      setRelationship({ status: "pending", direction: "outgoing" });
      setMessage("");
      closeDialog();
      toast.success(`Request sent to ${recipientName}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send your request");
    } finally {
      setSending(false);
    }
  };

  if (authStatus === "unauthenticated") {
    return (
      <Link
        href="/signin"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <UserRoundPlus className="h-4 w-4" /> Sign in to connect
      </Link>
    );
  }

  if (checking || authStatus === "loading") {
    return <Button loading disabled className="min-w-36">Checking</Button>;
  }

  if (relationship?.status === "accepted") {
    return (
      <Button variant="secondary" disabled className="min-w-36">
        <Check className="h-4 w-4" /> Connected
      </Button>
    );
  }

  if (relationship?.status === "pending" && relationship.direction === "outgoing") {
    return (
      <Button variant="secondary" disabled className="min-w-36">
        <Clock3 className="h-4 w-4" /> Pending
      </Button>
    );
  }

  if (relationship?.status === "pending" && relationship.direction === "incoming") {
    return (
      <Link
        href="/connections"
        className="inline-flex h-11 items-center justify-center rounded-lg border border-border-strong bg-surface px-4 text-sm font-medium text-text transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        Respond to request
      </Link>
    );
  }

  return (
    <>
      <Button className="min-w-36" onClick={() => setOpen(true)}>
        <UserRoundPlus className="h-4 w-4" /> Connect
      </Button>
      <Dialog
        open={open}
        onClose={closeDialog}
        title={`Connect with ${recipientName}`}
        description="Add a short note so they know why you’d like to connect."
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-text">
              Message <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(event) => setMessage(event.target.value.slice(0, 500))}
              rows={4}
              maxLength={500}
              placeholder="Share a little context about what you’re building…"
              className="w-full resize-y rounded-lg border border-border bg-bg px-3 py-2.5 text-sm leading-relaxed text-text placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <p className="mt-1 text-right text-xs text-muted">{message.length}/500</p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={closeDialog} disabled={sending}>Cancel</Button>
            <Button onClick={sendRequest} loading={sending}>Send request</Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
