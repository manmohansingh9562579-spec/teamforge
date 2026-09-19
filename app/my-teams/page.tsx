import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderKanban, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TeamCard } from "@/components/teams/TeamCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { connectDB } from "@/lib/db";
import { Team } from "@/models/Team";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function MyTeamsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  await connectDB();
  const teams = await Team.find({
    $or: [{ ownerId: user._id }, { "members.userId": user._id }],
  }).sort({ createdAt: -1 });

  return (
    <AppShell>
      <div className="container-page max-w-[960px] py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-text">My teams</h1>
          <Link
            href="/teams/create"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-accent px-3 text-[13px] font-medium text-on-accent hover:bg-accent-hover"
          >
            <Plus className="h-3.5 w-3.5" /> Create team
          </Link>
        </div>

        {teams.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={FolderKanban}
              title="You're not part of any team yet"
              description="Create your own team or find one that needs your skills."
              action={
                <div className="flex gap-2">
                  <Link
                    href="/teams/create"
                    className="inline-flex h-9 items-center rounded-md bg-accent px-3 text-[13px] font-medium text-on-accent hover:bg-accent-hover"
                  >
                    Create a team
                  </Link>
                  <Link
                    href="/teams"
                    className="inline-flex h-9 items-center rounded-md border border-border px-3 text-[13px] font-medium text-text hover:bg-surface-hover"
                  >
                    Browse teams
                  </Link>
                </div>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <TeamCard key={team._id.toString()} team={team} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
