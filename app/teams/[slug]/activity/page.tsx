import { AppShell } from "@/components/layout/AppShell";
import { WorkspaceNav } from "@/components/workspace/WorkspaceNav";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Activity as ActivityIcon } from "lucide-react";
import { requireTeamAccess } from "@/lib/teamAccess";
import { Activity } from "@/models/Activity";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function TeamActivityPage({ params }: { params: { slug: string } }) {
  const { team, isOwner } = await requireTeamAccess(params.slug);

  const events = await Activity.find({ teamId: team._id }).sort({ createdAt: -1 }).limit(100);
  const actorIds = [...new Set(events.map((e) => e.actorId.toString()))];
  const actors = await User.find({ _id: { $in: actorIds } }).select("name avatar");
  const actorMap = new Map(actors.map((a) => [a._id.toString(), a]));

  return (
    <AppShell>
      <WorkspaceNav slug={team.slug} isOwner={isOwner} />
      <div className="container-page max-w-[640px] py-8">
        <h1 className="text-lg font-semibold tracking-tight text-text">{team.projectTitle}</h1>
        <p className="mt-1 text-[13px] text-muted">Activity</p>

        <div className="mt-6">
          {events.length === 0 ? (
            <EmptyState
              icon={ActivityIcon}
              title="No activity yet"
              description="Team actions like tasks, members and updates will show up here."
            />
          ) : (
            <ul className="space-y-4">
              {events.map((e) => {
                const actor = actorMap.get(e.actorId.toString());
                return (
                  <li key={e._id.toString()} className="flex items-start gap-3">
                    <Avatar name={actor?.name ?? "Someone"} src={actor?.avatar} size="sm" />
                    <div>
                      <p className="text-[13px] text-text">
                        <span className="font-medium">{actor?.name ?? "Someone"}</span>{" "}
                        <span className="text-muted">{e.action}</span>
                      </p>
                      <p className="mt-0.5 text-[12px] text-muted">{timeAgo(e.createdAt)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
