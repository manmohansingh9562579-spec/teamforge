import Link from "next/link";
import { Users, CheckCircle2, Circle, Calendar } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { WorkspaceNav } from "@/components/workspace/WorkspaceNav";
import { Avatar } from "@/components/ui/Avatar";
import { requireTeamAccess } from "@/lib/teamAccess";
import { Task } from "@/models/Task";
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

export default async function WorkspaceOverviewPage({ params }: { params: { slug: string } }) {
  const { team, isOwner } = await requireTeamAccess(params.slug);

  const [tasks, recentActivity] = await Promise.all([
    Task.find({ teamId: team._id }),
    Activity.find({ teamId: team._id }).sort({ createdAt: -1 }).limit(8),
  ]);

  const actorIds = [...new Set(recentActivity.map((a) => a.actorId.toString()))];
  const actors = await User.find({ _id: { $in: actorIds } }).select("name avatar");
  const actorMap = new Map(actors.map((a) => [a._id.toString(), a]));

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Done").length;
  const openTasks = totalTasks - completedTasks;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const upcoming = tasks
    .filter((t) => t.dueDate && t.status !== "Done")
    .sort((a, b) => (a.dueDate! > b.dueDate! ? 1 : -1))
    .slice(0, 4);

  const memberCount = team.members.length + 1; // + owner

  return (
    <AppShell>
      <WorkspaceNav slug={team.slug} isOwner={isOwner} />
      <div className="container-page py-8">
        <h1 className="text-lg font-semibold tracking-tight text-text">{team.projectTitle}</h1>
        <p className="mt-1 text-[13px] text-muted">Overview</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center gap-2 text-muted">
              <Users className="h-4 w-4" />
              <span className="text-[12px]">Members</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-text">{memberCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center gap-2 text-muted">
              <Circle className="h-4 w-4" />
              <span className="text-[12px]">Open tasks</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-text">{openTasks}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center gap-2 text-muted">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-[12px]">Completed</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-text">{completedTasks}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center gap-2 text-muted">
              <Calendar className="h-4 w-4" />
              <span className="text-[12px]">Progress</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-text">{progress}%</p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-surface p-4">
          <p className="text-[12px] font-medium text-muted">Overall progress</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
            <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section>
            <h2 className="text-[13px] font-medium text-text">Upcoming deadlines</h2>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-[13px] text-muted">No upcoming deadlines.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {upcoming.map((t) => (
                  <li
                    key={t._id.toString()}
                    className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2"
                  >
                    <span className="text-[13px] text-text">{t.title}</span>
                    <span className="text-[12px] text-muted">
                      {new Date(t.dueDate!).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-[13px] font-medium text-text">Recent activity</h2>
            {recentActivity.length === 0 ? (
              <p className="mt-3 text-[13px] text-muted">Nothing has happened yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {recentActivity.map((a) => {
                  const actor = actorMap.get(a.actorId.toString());
                  return (
                    <li key={a._id.toString()} className="flex items-start gap-2.5">
                      <Avatar name={actor?.name ?? "Someone"} src={actor?.avatar} size="sm" />
                      <p className="text-[13px] text-text">
                        <span className="font-medium">{actor?.name ?? "Someone"}</span>{" "}
                        <span className="text-muted">{a.action}</span>
                        <span className="ml-1.5 text-[11px] text-muted">
                          {timeAgo(a.createdAt)}
                        </span>
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link
              href={`/teams/${team.slug}/activity`}
              className="mt-3 inline-block text-[12px] text-accent hover:underline"
            >
              View all activity
            </Link>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
