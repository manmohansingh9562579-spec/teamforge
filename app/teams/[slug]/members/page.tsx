import { AppShell } from "@/components/layout/AppShell";
import { WorkspaceNav } from "@/components/workspace/WorkspaceNav";
import { MembersList, type MemberRow } from "@/components/workspace/MembersList";
import { requireTeamAccess } from "@/lib/teamAccess";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

export default async function TeamMembersPage({ params }: { params: { slug: string } }) {
  const { team, isOwner } = await requireTeamAccess(params.slug);

  const memberIds = [team.ownerId, ...team.members.map((m) => m.userId)];
  const users = await User.find({ _id: { $in: memberIds } }).select("name username avatar skills");
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const rows: MemberRow[] = [];
  const owner = userMap.get(team.ownerId.toString());
  if (owner) {
    rows.push({
      userId: owner._id.toString(),
      name: owner.name,
      username: owner.username,
      avatar: owner.avatar,
      skills: owner.skills,
      role: "Owner",
      joinedAt: team.createdAt.toISOString(),
      isOwner: true,
    });
  }
  for (const m of team.members) {
    const u = userMap.get(m.userId.toString());
    if (!u) continue;
    rows.push({
      userId: u._id.toString(),
      name: u.name,
      username: u.username,
      avatar: u.avatar,
      skills: u.skills,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
      isOwner: false,
    });
  }

  return (
    <AppShell>
      <WorkspaceNav slug={team.slug} isOwner={isOwner} />
      <div className="container-page py-8">
        <h1 className="text-lg font-semibold tracking-tight text-text">{team.projectTitle}</h1>
        <p className="mt-1 text-[13px] text-muted">Members · {rows.length}</p>
        <div className="mt-6">
          <MembersList teamId={team._id.toString()} members={rows} viewerIsOwner={isOwner} />
        </div>
      </div>
    </AppShell>
  );
}
