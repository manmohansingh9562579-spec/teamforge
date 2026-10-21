import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { LogicDataClient } from "@/components/challenges/LogicDataClient";

export const metadata = {
  title: "Logic & Data | TeamForge",
  description: "Practice clear reasoning with original data, maths, and logic challenges.",
};

export default function LogicDataPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <LogicDataClient />
      </main>
      <Footer />
    </div>
  );
}
