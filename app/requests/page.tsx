import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { RequestsPageClient } from "@/components/teams/RequestsPageClient";
import { getCurrentUser } from "@/lib/session";

export default async function RequestsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  return (
    <AppShell>
      <div className="container-page max-w-[720px] py-10">
        <h1 className="text-xl font-semibold tracking-tight text-text">Requests</h1>
        <p className="mt-1 text-sm text-muted">
          Manage join requests for your teams, and track requests you've sent.
        </p>
        <div className="mt-6">
          <RequestsPageClient />
        </div>
      </div>
    </AppShell>
  );
}
