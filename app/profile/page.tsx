import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileView } from "@/components/developers/ProfileView";
import { getCurrentUser } from "@/lib/session";
import { DailyCodingProgress } from "@/models/DailyCodingProgress";
import { LogicDataProgress } from "@/models/LogicDataProgress";

export const dynamic = "force-dynamic";

export default async function OwnProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  const [solvedProblems, solvedLogicPrompts] = await Promise.all([
    DailyCodingProgress.distinct("problemSlug", { userId: user._id, accepted: true }),
    LogicDataProgress.distinct("challengeId", { userId: user._id, solvedAt: { $exists: true } }),
  ]);

  return (
    <AppShell>
      <ProfileView user={user} isOwner solvedCount={solvedProblems.length} logicSolvedCount={solvedLogicPrompts.length} />
    </AppShell>
  );
}
