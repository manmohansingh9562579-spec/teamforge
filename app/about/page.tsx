import Link from "next/link";
import { UserPlus, Sparkles, Search, Users2, ShieldCheck, Scale } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";

const steps = [
  {
    icon: UserPlus,
    title: "Create your profile",
    body: "Add your skills, the roles you want to play, your experience level and what kind of projects you're into.",
  },
  {
    icon: Sparkles,
    title: "Showcase your skills",
    body: "Your profile is what teams see when they're deciding who to bring on — make it specific.",
  },
  {
    icon: Search,
    title: "Discover people and teams",
    body: "Search and filter by skill, role, experience and availability, or browse open teams looking for your skillset.",
  },
  {
    icon: Users2,
    title: "Build together",
    body: "Send a join request, get accepted, and start managing tasks in a shared team workspace.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container-page max-w-[760px] py-14">
          <h1 className="text-3xl font-semibold tracking-tight text-text">
            How TeamForge works
          </h1>
          <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-muted">
            TeamForge helps developers, designers and builders find teammates for
            hackathons, college projects, open source and side projects — based on
            actual skills and roles, not who you happen to already know.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {steps.map((s, i) => (
              <Card key={s.title} className="p-5">
                <span className="font-mono text-xs text-accent">
                  0{i + 1}
                </span>
                <s.icon className="mt-2 h-5 w-5 text-accent" strokeWidth={1.75} />
                <h2 className="mt-3 text-[14px] font-medium text-text">{s.title}</h2>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{s.body}</p>
              </Card>
            ))}
          </div>

          <section className="mt-14 border-t border-border pt-10">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold tracking-tight text-text">
                How matching works
              </h2>
            </div>
            <p className="mt-3 max-w-[60ch] text-[14px] leading-relaxed text-muted">
              TeamForge does not use AI to judge people. Compatibility between you and a
              team is calculated with a transparent, deterministic formula that compares
              your structured profile data against what a team says it needs:
            </p>
            <ul className="mt-4 space-y-1.5 text-[13px] text-muted">
              <li>· Skill overlap — 45%</li>
              <li>· Role compatibility — 25%</li>
              <li>· Interest overlap — 15%</li>
              <li>· Availability — 15%</li>
            </ul>
            <p className="mt-4 max-w-[60ch] text-[14px] leading-relaxed text-muted">
              The result is a 0–100 compatibility score with the specific reasons behind
              it — never a judgment of your ability or worth as a teammate.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold tracking-tight text-text">
                Your data
              </h2>
            </div>
            <p className="mt-3 max-w-[60ch] text-[14px] leading-relaxed text-muted">
              Your profile is public so teams can discover you. Your email and password
              are never shown to anyone, and passwords are hashed — never stored in
              plain text.
            </p>
          </section>

          <div className="mt-14 flex gap-3">
            <Link
              href="/signup"
              className="inline-flex h-11 items-center rounded-md bg-accent px-6 text-[14px] font-medium text-on-accent hover:bg-accent-hover"
            >
              Get started
            </Link>
            <Link
              href="/discover"
              className="inline-flex h-11 items-center rounded-md border border-border-strong px-6 text-[14px] font-medium text-text hover:bg-surface-hover"
            >
              Browse developers
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
