import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { LogicDataClient } from "@/components/challenges/LogicDataClient";
import { LOGIC_DATA_CHALLENGES } from "@/lib/logicDataChallenges";

export const metadata = {
  title: "Logic & Data | TeamForge",
  description: "Practice clear reasoning with original data, maths, and logic challenges.",
};

export default function LogicDataPage() {
  const challenges = LOGIC_DATA_CHALLENGES.map((challenge) => ({
    id: challenge.id,
    title: challenge.title,
    track: challenge.track,
    difficulty: challenge.difficulty,
    minutes: challenge.minutes,
    prompt: challenge.prompt,
    table: challenge.table,
    options: challenge.options,
    hint: challenge.hint,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <LogicDataClient challenges={challenges} />
      </main>
      <Footer />
    </div>
  );
}
