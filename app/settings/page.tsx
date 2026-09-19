import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { SettingsPageClient } from "@/components/layout/SettingsPageClient";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  return (
    <AppShell>
      <div className="container-page max-w-[720px] py-10">
        <h1 className="text-xl font-semibold tracking-tight text-text">Settings</h1>
        <div className="mt-6">
          <SettingsPageClient name={user.name} email={user.email} />
        </div>
      </div>
    </AppShell>
  );
}
