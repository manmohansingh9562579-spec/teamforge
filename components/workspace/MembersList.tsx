"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MoreVertical, UserMinus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, SkillBadge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Select";

export interface MemberRow {
  userId: string;
  name: string;
  username: string;
  avatar?: string;
  skills: string[];
  role: string;
  joinedAt: string;
  isOwner: boolean;
}

export function MembersList({
  teamId,
  members,
  viewerIsOwner,
}: {
  teamId: string;
  members: MemberRow[];
  viewerIsOwner: boolean;
}) {
  const router = useRouter();
  const [removeTarget, setRemoveTarget] = useState<MemberRow | null>(null);

  const changeRole = async (userId: string, role: string) => {
    const res = await fetch(`/api/teams/${teamId}/members/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      toast.error("Could not update role");
      return;
    }
    toast.success("Role updated");
    router.refresh();
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-border text-[12px] text-muted">
            <th className="px-4 py-2.5 font-medium">Member</th>
            <th className="px-4 py-2.5 font-medium">Role</th>
            <th className="px-4 py-2.5 font-medium">Skills</th>
            <th className="px-4 py-2.5 font-medium">Joined</th>
            {viewerIsOwner && <th className="px-4 py-2.5" />}
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.userId} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <Link
                  href={`/developers/${m.username}`}
                  className="flex items-center gap-2.5 hover:underline"
                >
                  <Avatar name={m.name} src={m.avatar} size="sm" />
                  <span className="text-text">{m.name}</span>
                  {m.isOwner && <Badge tone="accent">Owner</Badge>}
                </Link>
              </td>
              <td className="px-4 py-3">
                {viewerIsOwner && !m.isOwner ? (
                  <Select
                    value={m.role}
                    onChange={(e) => changeRole(m.userId, e.target.value)}
                    className="h-8 w-auto px-2 py-0 text-[12px]"
                  >
                    <option value={m.role}>{m.role}</option>
                    {[
                      "Frontend Developer",
                      "Backend Developer",
                      "Full Stack Developer",
                      "Mobile Developer",
                      "ML Developer",
                      "UI/UX Designer",
                      "DevOps Engineer",
                      "Product/Project Lead",
                      "Other",
                    ]
                      .filter((r) => r !== m.role)
                      .map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                  </Select>
                ) : (
                  <span className="text-muted">{m.role}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {m.skills.slice(0, 3).map((s) => (
                    <SkillBadge key={s}>{s}</SkillBadge>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-muted">
                {new Date(m.joinedAt).toLocaleDateString()}
              </td>
              {viewerIsOwner && (
                <td className="px-4 py-3 text-right">
                  {!m.isOwner && (
                    <button
                      onClick={() => setRemoveTarget(m)}
                      aria-label={`Remove ${m.name}`}
                      className="rounded-md p-1.5 text-muted hover:bg-surface-hover hover:text-danger"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        title={`Remove ${removeTarget?.name ?? "this member"}?`}
        description="They'll lose access to the team workspace, tasks and activity."
        confirmLabel="Remove member"
        onConfirm={async () => {
          if (!removeTarget) return;
          const res = await fetch(`/api/teams/${teamId}/members/${removeTarget.userId}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            toast.error("Could not remove member");
            return;
          }
          toast.success("Member removed");
          router.refresh();
        }}
      />
    </div>
  );
}
