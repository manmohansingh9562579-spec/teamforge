import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BuildFeed } from "@/components/feed/BuildFeed";

export const metadata = {
  title: "Builder Community | TeamForge",
  description: "Share what you are building, trade ideas, and find your next collaborator.",
};

export default function FeedPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <BuildFeed />
      </main>
      <Footer />
    </div>
  );
}
