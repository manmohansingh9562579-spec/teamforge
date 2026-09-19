import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileView } from "@/components/developers/ProfileView";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function OwnProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  return (
    <AppShell>
      <ProfileView user={user} isOwner />
    </AppShell>
  );
}
