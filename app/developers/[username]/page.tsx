import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProfileView } from "@/components/developers/ProfileView";
import { connectDB } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { User } from "@/models/User";
import { FeedPost } from "@/models/FeedPost";

export const dynamic = "force-dynamic";

async function getDeveloper(username: string) {
  await connectDB();
  return User.findOne({ username: username.toLowerCase() })
    .select("name username avatar headline bio location college graduationYear experienceLevel availability skills preferredRoles interests githubUrl linkedinUrl portfolioUrl")
    .lean();
}

export default async function DeveloperProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const dev = await getDeveloper(params.username);
  if (!dev) notFound();
  const [session, activity] = await Promise.all([
    getCurrentSession(),
    FeedPost.find({ authorId: dev._id }).sort({ createdAt: -1 }).limit(4)
      .select("type content projectName githubUrl demoUrl skills createdAt").lean(),
  ]);
  const recentPosts = activity.map((post: any) => ({
    id: post._id.toString(),
    type: post.type,
    content: post.content,
    projectName: post.projectName,
    githubUrl: post.githubUrl,
    demoUrl: post.demoUrl,
    skills: post.skills,
    createdAt: post.createdAt.toISOString(),
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <ProfileView user={dev} recentPosts={recentPosts} isOwner={session?.user?.id === dev._id.toString()} />
      </main>
      <Footer />
    </div>
  );
}
