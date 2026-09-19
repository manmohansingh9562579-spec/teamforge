import Link from "next/link";
import {
  Users,
  Search,
  Sparkles,
  UserPlus,
  KanbanSquare,
  Bell,
  Activity,
  LayoutGrid,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductPreview } from "@/components/marketing/ProductPreview";
import { Card } from "@/components/ui/Card";

const problems = [
  {
    title: "Missing skills",
    body: "Your project needs a backend developer, but everyone in your circle already writes frontend code.",
  },
  {
    title: "Last-minute teams",
    body: "Hackathons form teams in the first hour, and the good matches happen before you've met anyone.",
  },
  {
    title: "Scattered communities",
    body: "Discord servers, WhatsApp groups, campus boards — the right person is out there, just not where you're looking.",
  },
  {
    title: "Unclear requirements",
    body: "Team posts rarely say what's actually needed, so you message people who were never a fit.",
  },
];

const steps = [
  { n: "01", title: "Create your profile", body: "Add your skills, roles and the kind of projects you want to work on." },
  { n: "02", title: "Showcase your skills", body: "List what you can build and how experienced you are at it." },
  { n: "03", title: "Discover people and teams", body: "Filter by skill, role, availability and project type." },
  { n: "04", title: "Build together", body: "Request to join, get accepted, and start shipping in a shared workspace." },
];

const features = [
  { icon: Users, title: "Developer profiles", body: "A focused profile built around skills, roles and interests — not vanity metrics." },
  { icon: Search, title: "Team discovery", body: "Browse open teams filtered by required skills, tech stack and deadline." },
  { icon: Sparkles, title: "Skill matching", body: "A transparent, deterministic compatibility score with the reasons behind it." },
  { icon: UserPlus, title: "Join requests", body: "Send a request with a message. Owners accept or decline with one click." },
  { icon: LayoutGrid, title: "Project workspace", body: "A shared space for every team, with members, tasks and activity in one place." },
  { icon: KanbanSquare, title: "Task tracking", body: "A Kanban board with priorities, assignees and due dates." },
  { icon: Bell, title: "Notifications", body: "Know the moment someone requests to join or a task gets assigned to you." },
  { icon: Activity, title: "Activity timeline", body: "A running record of what changed on your team, and who changed it." },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="container-page pt-14 pb-16 sm:pt-20 sm:pb-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <h1 className="text-[2.5rem] font-semibold leading-[1.1] tracking-tight text-text sm:text-5xl">
                Find people. Build teams. Ship projects.
              </h1>
              <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-muted">
                Discover developers, designers and builders for your next hackathon,
                college project or side project — matched by skill, not luck.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/discover"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-[14px] font-medium text-on-accent transition-colors hover:bg-accent-hover"
                >
                  Find teammates
                </Link>
                <Link
                  href="/teams/create"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-border-strong px-5 text-[14px] font-medium text-text transition-colors hover:bg-surface-hover"
                >
                  Create a team
                </Link>
              </div>
            </div>
            <ProductPreview />
          </div>
        </section>

        {/* Problem */}
        <section className="border-t border-border bg-surface/40">
          <div className="container-page py-16 sm:py-20">
            <div className="max-w-[52ch]">
              <h2 className="text-2xl font-semibold tracking-tight text-text sm:text-[28px]">
                Finding the right teammate is harder than it should be
              </h2>
            </div>
            <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
              {problems.map((p) => (
                <div key={p.title} className="bg-bg p-6">
                  <h3 className="text-[15px] font-medium text-text">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="container-page py-16 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-text sm:text-[28px]">
            How it works
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n}>
                <span className="font-mono text-sm text-accent">{s.n}</span>
                <h3 className="mt-2 text-[15px] font-medium text-text">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-surface/40">
          <div className="container-page py-16 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight text-text sm:text-[28px]">
              Everything a project team actually needs
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <Card key={f.title} className="p-5">
                  <f.icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
                  <h3 className="mt-3 text-[14px] font-medium text-text">{f.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{f.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container-page py-16 sm:py-20">
          <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-border bg-surface p-8 sm:flex-row sm:items-center sm:p-10">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-text sm:text-2xl">
                Your next project needs one more person
              </h2>
              <p className="mt-2 max-w-[48ch] text-sm text-muted">
                Create your profile in a few minutes and start finding teammates today.
              </p>
            </div>
            <Link
              href="/signup"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-accent px-6 text-[14px] font-medium text-on-accent transition-colors hover:bg-accent-hover"
            >
              Get started
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
