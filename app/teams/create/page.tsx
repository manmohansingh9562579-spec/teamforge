import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { CreateTeamForm } from "@/components/teams/CreateTeamForm";
import { getCurrentUser } from "@/lib/session";

export default async function CreateTeamPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  return (
    <AppShell>
      <div className="container-page max-w-[720px] py-10">
        <h1 className="text-xl font-semibold tracking-tight text-text">Create a team</h1>
        <p className="mt-1 text-sm text-muted">
          Describe your project and what kind of teammates you're looking for.
        </p>
        <div className="mt-8">
          <CreateTeamForm />
        </div>
      </div>
    </AppShell>
  );
}
