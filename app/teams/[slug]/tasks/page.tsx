import { AppShell } from "@/components/layout/AppShell";
import { WorkspaceNav } from "@/components/workspace/WorkspaceNav";
import { KanbanBoard } from "@/components/workspace/KanbanBoard";
import { requireTeamAccess } from "@/lib/teamAccess";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

export default async function TeamTasksPage({ params }: { params: { slug: string } }) {
  const { team, isOwner } = await requireTeamAccess(params.slug);

  const memberIds = [team.ownerId, ...team.members.map((m) => m.userId)];
  const members = await User.find({ _id: { $in: memberIds } }).select("name");

  return (
    <AppShell>
      <WorkspaceNav slug={team.slug} isOwner={isOwner} />
      <div className="container-page py-8">
        <h1 className="text-lg font-semibold tracking-tight text-text">{team.projectTitle}</h1>
        <p className="mt-1 text-[13px] text-muted">Tasks</p>
        <div className="mt-6">
          <KanbanBoard
            teamId={team._id.toString()}
            members={members.map((m) => ({ _id: m._id.toString(), name: m.name }))}
          />
        </div>
      </div>
    </AppShell>
  );
}
