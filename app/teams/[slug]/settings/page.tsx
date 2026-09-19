import { AppShell } from "@/components/layout/AppShell";
import { WorkspaceNav } from "@/components/workspace/WorkspaceNav";
import { TeamSettingsForm } from "@/components/workspace/TeamSettingsForm";
import { requireTeamOwner } from "@/lib/teamAccess";

export const dynamic = "force-dynamic";

export default async function TeamSettingsPage({ params }: { params: { slug: string } }) {
  const { team } = await requireTeamOwner(params.slug);

  return (
    <AppShell>
      <WorkspaceNav slug={team.slug} isOwner />
      <div className="container-page py-8">
        <h1 className="text-lg font-semibold tracking-tight text-text">{team.projectTitle}</h1>
        <p className="mt-1 text-[13px] text-muted">Settings</p>
        <div className="mt-6">
          <TeamSettingsForm team={team} />
        </div>
      </div>
    </AppShell>
  );
}
