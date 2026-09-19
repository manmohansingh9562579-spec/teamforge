"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Settings, LogOut, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Textarea } from "@/components/ui/Input";

export function TeamActions({
  teamId,
  slug,
  isOwner,
  isMember,
  isFull,
  isSignedIn,
  currentUserId,
}: {
  teamId: string;
  slug: string;
  isOwner: boolean;
  isMember: boolean;
  isFull: boolean;
  isSignedIn: boolean;
  currentUserId?: string;
}) {
  const router = useRouter();
  const [joinOpen, setJoinOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  if (isOwner) {
    return (
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/teams/${slug}/manage`}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-[13px] font-medium text-text hover:bg-surface-hover"
        >
          <Settings className="h-3.5 w-3.5" /> Manage team
        </Link>
        <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-3.5 w-3.5" /> Delete team
        </Button>

        <ConfirmDialog
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          title="Delete this team?"
          description="This permanently deletes the team, its tasks, requests and activity. This can't be undone."
          confirmLabel="Delete team"
          onConfirm={async () => {
            const res = await fetch(`/api/teams/${teamId}`, { method: "DELETE" });
            if (!res.ok) {
              toast.error("Could not delete the team");
              return;
            }
            toast.success("Team deleted");
            router.push("/my-teams");
            router.refresh();
          }}
        />
      </div>
    );
  }

  if (isMember) {
    return (
      <>
        <Button variant="outline" size="sm" onClick={() => setLeaveOpen(true)}>
          <LogOut className="h-3.5 w-3.5" /> Leave team
        </Button>
        <ConfirmDialog
          open={leaveOpen}
          onClose={() => setLeaveOpen(false)}
          title="Leave this team?"
          description="You'll lose access to the team workspace, tasks and activity."
          confirmLabel="Leave team"
          onConfirm={async () => {
            if (!currentUserId) return;
            const res = await fetch(`/api/teams/${teamId}/members/${currentUserId}`, {
              method: "DELETE",
            });
            if (!res.ok) {
              toast.error("Could not leave the team");
              return;
            }
            toast.success("You left the team");
            router.refresh();
          }}
        />
      </>
    );
  }

  return (
    <>
      <Button
        size="sm"
        disabled={isFull}
        onClick={() => (isSignedIn ? setJoinOpen(true) : router.push("/signin"))}
      >
        <UserPlus className="h-3.5 w-3.5" />
        {isFull ? "Team full" : "Request to join"}
      </Button>

      <Dialog
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        title="Request to join"
        description="Tell the team owner why you'd be a good fit."
      >
        <Textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="I've built a few React apps and would love to help with the frontend..."
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setJoinOpen(false)}>
            Cancel
          </Button>
          <Button
            loading={sending}
            onClick={async () => {
              setSending(true);
              try {
                const res = await fetch(`/api/teams/${teamId}/requests`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ message }),
                });
                const json = await res.json();
                if (!res.ok) {
                  toast.error(json.error ?? "Could not send request");
                  return;
                }
                toast.success("Request sent");
                setJoinOpen(false);
                setMessage("");
              } finally {
                setSending(false);
              }
            }}
          >
            Send request
          </Button>
        </div>
      </Dialog>
    </>
  );
}
