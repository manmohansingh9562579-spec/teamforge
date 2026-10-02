import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProfileView } from "@/components/developers/ProfileView";
import { connectDB } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { User } from "@/models/User";

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
  const session = await getCurrentSession();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <ProfileView user={dev} isOwner={session?.user?.id === dev._id.toString()} />
      </main>
      <Footer />
    </div>
  );
}
