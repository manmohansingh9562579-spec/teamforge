import Link from "next/link";
import { Plus, Search, UserCog, Bell, Inbox, FolderKanban } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { TeamCard } from "@/components/teams/TeamCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { connectDB } from "@/lib/db";
import { Team } from "@/models/Team";
import { JoinRequest } from "@/models/Request";
import { Task } from "@/models/Task";
import { Activity } from "@/models/Activity";
import { Notification } from "@/models/Notification";
import { getCurrentUser } from "@/lib/session";
import { calculateProfileCompletion } from "@/services/profileService";
import { Avatar } from "@/components/ui/Avatar";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  await connectDB();

  const [myTeams, ownedTeamIds] = await Promise.all([
    Team.find({ $or: [{ ownerId: user._id }, { "members.userId": user._id }] })
      .sort({ createdAt: -1 })
      .limit(6),
    Team.find({ ownerId: user._id }).distinct("_id"),
  ]);

  const allTeamIds = myTeams.map((t) => t._id);

  const [pendingIncoming, pendingSent, tasks, unreadCount, recentActivity] = await Promise.all([
    JoinRequest.countDocuments({ teamId: { $in: ownedTeamIds }, status: "pending" }),
    JoinRequest.find({ senderId: user._id, status: "pending" }).populate("teamId", "projectTitle slug"),
    Task.find({ teamId: { $in: allTeamIds }, assignee: user._id }),
    Notification.countDocuments({ userId: user._id, isRead: false }),
    Activity.find({ teamId: { $in: allTeamIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("actorId", "name avatar"),
  ]);

  const completion = calculateProfileCompletion(user);
  const openTasks = tasks.filter((t) => t.status !== "Done");
  const upcomingDeadlines = openTasks
    .filter((t) => t.dueDate)
    .sort((a, b) => (a.dueDate! > b.dueDate! ? 1 : -1))
    .slice(0, 3);

  return (
    <AppShell>
      <div className="container-page max-w-[980px] py-8">
        <h1 className="text-xl font-semibold tracking-tight text-text">
          Welcome back, {user.name.split(" ")[0]}
        </h1>

        {completion < 100 && (
          <div className="mt-5 rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-text">
                Your profile is {completion}% complete
              </p>
              <Link href="/profile/edit" className="text-[12px] text-accent hover:underline">
                Complete it
              </Link>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
              <div className="h-full rounded-full bg-accent" style={{ width: `${completion}%` }} />
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Link
            href="/teams/create"
            className="flex items-center gap-2.5 rounded-lg border border-border bg-surface p-4 hover:bg-surface-hover"
          >
            <Plus className="h-4 w-4 text-accent" />
            <span className="text-[13px] font-medium text-text">Create team</span>
          </Link>
          <Link
            href="/discover"
            className="flex items-center gap-2.5 rounded-lg border border-border bg-surface p-4 hover:bg-surface-hover"
          >
            <Search className="h-4 w-4 text-accent" />
            <span className="text-[13px] font-medium text-text">Discover teammates</span>
          </Link>
          <Link
            href="/profile/edit"
            className="flex items-center gap-2.5 rounded-lg border border-border bg-surface p-4 hover:bg-surface-hover"
          >
            <UserCog className="h-4 w-4 text-accent" />
            <span className="text-[13px] font-medium text-text">Complete profile</span>
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link
            href="/requests"
            className="rounded-lg border border-border bg-surface p-4 hover:bg-surface-hover"
          >
            <div className="flex items-center gap-2 text-muted">
              <Inbox className="h-4 w-4" />
              <span className="text-[12px]">Pending requests</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-text">{pendingIncoming}</p>
          </Link>
          <Link
            href="/notifications"
            className="rounded-lg border border-border bg-surface p-4 hover:bg-surface-hover"
          >
            <div className="flex items-center gap-2 text-muted">
              <Bell className="h-4 w-4" />
              <span className="text-[12px]">Unread notifications</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-text">{unreadCount}</p>
          </Link>
          <Link
            href="/my-teams"
            className="rounded-lg border border-border bg-surface p-4 hover:bg-surface-hover"
          >
            <div className="flex items-center gap-2 text-muted">
              <FolderKanban className="h-4 w-4" />
              <span className="text-[12px]">My open tasks</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-text">{openTasks.length}</p>
          </Link>
        </div>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-medium text-text">My teams</h2>
            <Link href="/my-teams" className="text-[12px] text-accent hover:underline">
              View all
            </Link>
          </div>
          {myTeams.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={FolderKanban}
                title="No teams yet"
                description="Create a team or find one that needs your skills."
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myTeams.map((team) => (
                <TeamCard key={team._id.toString()} team={team} />
              ))}
            </div>
          )}
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="text-[14px] font-medium text-text">Upcoming deadlines</h2>
            {upcomingDeadlines.length === 0 ? (
              <p className="mt-3 text-[13px] text-muted">Nothing due soon.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {upcomingDeadlines.map((t) => (
                  <li
                    key={t._id.toString()}
                    className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2"
                  >
                    <span className="text-[13px] text-text">{t.title}</span>
                    <Badge tone="warning">
                      {new Date(t.dueDate!).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-text">Recent activity</h2>
            {recentActivity.length === 0 ? (
              <p className="mt-3 text-[13px] text-muted">No recent activity across your teams.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {recentActivity.map((a: any) => (
                  <li key={a._id.toString()} className="flex items-start gap-2.5">
                    <Avatar name={a.actorId?.name ?? "Someone"} src={a.actorId?.avatar} size="sm" />
                    <p className="text-[13px] text-text">
                      <span className="font-medium">{a.actorId?.name ?? "Someone"}</span>{" "}
                      <span className="text-muted">{a.action}</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
