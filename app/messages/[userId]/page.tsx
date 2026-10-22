import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MessageThreadClient } from "@/components/messaging/MessageThreadClient";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function MessagePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  return (
    <AppShell>
      <div className="container-page mx-auto max-w-4xl py-4 sm:py-6">
        <MessageThreadClient
          key={userId}
          developerId={userId}
          viewerId={user._id.toString()}
        />
      </div>
    </AppShell>
  );
}
