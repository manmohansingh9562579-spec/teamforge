import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProfileView } from "@/components/developers/ProfileView";
import { connectDB } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { User } from "@/models/User";
import { DailyCodingProgress } from "@/models/DailyCodingProgress";
import { LogicDataProgress } from "@/models/LogicDataProgress";

export const dynamic = "force-dynamic";

async function getDeveloper(username: string) {
  await connectDB();
  return User.findOne({ username: username.toLowerCase() })
    .select("name username avatar headline bio location college graduationYear experienceLevel availability skills preferredRoles interests githubUrl linkedinUrl portfolioUrl achievements")
    .lean();
}

export default async function DeveloperProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const dev = await getDeveloper(username);
  if (!dev) notFound();
  const [session, solvedProblems, solvedLogicPrompts] = await Promise.all([
    getCurrentSession(),
    DailyCodingProgress.distinct("problemSlug", { userId: dev._id, accepted: true }),
    LogicDataProgress.distinct("challengeId", { userId: dev._id, solvedAt: { $exists: true } }),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <ProfileView
          user={dev}
          solvedCount={solvedProblems.length}
          logicSolvedCount={solvedLogicPrompts.length}
          isOwner={session?.user?.id === dev._id.toString()}
        />
      </main>
      <Footer />
    </div>
  );
}
