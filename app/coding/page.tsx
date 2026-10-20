import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CodingPracticeClient } from "@/components/challenges/CodingPracticeClient";

export const metadata = {
  title: "Daily Coding Challenge | TeamForge",
  description: "Solve daily programming questions, practice in multiple languages, and build your coding streak.",
};

export default function CodingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <CodingPracticeClient />
      </main>
      <Footer />
    </div>
  );
}
