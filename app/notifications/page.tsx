import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { NotificationsPageClient } from "@/components/layout/NotificationsPageClient";
import { getCurrentUser } from "@/lib/session";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  return (
    <AppShell>
      <div className="container-page max-w-[640px] py-10">
        <h1 className="text-xl font-semibold tracking-tight text-text">Notifications</h1>
        <div className="mt-6">
          <NotificationsPageClient />
        </div>
      </div>
    </AppShell>
  );
}
