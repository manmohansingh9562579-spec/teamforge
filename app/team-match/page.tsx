import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TeamForgeMatchClient } from "@/components/teams/TeamForgeMatchClient";
import { getCurrentUser } from "@/lib/session";

export default async function TeamMatchPage({ searchParams }: { searchParams?: { teamId?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  return (
    <AppShell>
      <div className="container-page max-w-[860px] py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">TEAMFORGE MATCH</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text">Find the right people for your project.</h1>
        <p className="mt-2 max-w-[66ch] text-sm leading-relaxed text-muted">
          Describe what you&apos;re building. TeamForge ranks existing members with a deterministic score based on listed skills, roles, public project history, experience and availability.
        </p>
        <div className="mt-7"><TeamForgeMatchClient initialTeamId={searchParams?.teamId} /></div>
      </div>
    </AppShell>
  );
}
