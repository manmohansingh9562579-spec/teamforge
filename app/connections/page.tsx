import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ConnectionsPageClient } from "@/components/developers/ConnectionsPageClient";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ConnectionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  return (
    <AppShell>
      <div className="container-page max-w-[1100px] py-8 sm:py-12">
        <div className="max-w-[640px]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Your network</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text sm:text-4xl">Connections</h1>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Meet collaborators, respond to invitations, and keep your project network in one place.
          </p>
        </div>
        <div className="mt-8">
          <ConnectionsPageClient />
        </div>
      </div>
    </AppShell>
  );
}
