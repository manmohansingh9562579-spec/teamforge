import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { WeeklyChallengeClient } from "@/components/challenges/WeeklyChallengeClient";

export const metadata = {
  title: "Weekly Build Challenge | TeamForge",
  description: "Pick up a small project prompt, build with others, and share what you made.",
};

export default function ChallengesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <WeeklyChallengeClient />
      </main>
      <Footer />
    </div>
  );
}
