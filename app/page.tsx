import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, Blocks, Code2, Compass, GitBranch, HeartHandshake,
  LockKeyhole, MessageCircle, Radio, Rocket, Sparkles, Trophy, UsersRound,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HomeHero } from "@/components/marketing/HomeHero";
import { HomeProductShowcase } from "@/components/marketing/HomeProductShowcase";
import { Reveal } from "@/components/marketing/MarketingMotion";

const frictionPoints = [
  { icon: Compass, number: "01", title: "The right people are hard to find", body: "Your next idea needs a skill your circle does not have. Search a network built around what people can build." },
  { icon: MessageCircle, number: "02", title: "Good ideas get lost in chat", body: "A project brief, a teammate request and a useful update deserve a place people can discover later." },
  { icon: Blocks, number: "03", title: "Teams need a way to keep moving", body: "Once you find your people, shared tasks and a clear workspace turn the first conversation into progress." },
];

const flow = [
  { number: "01", icon: UsersRound, title: "Show what you bring", body: "Build a profile around your stack, interests and the kind of team you want to join." },
  { number: "02", icon: Compass, title: "Find the right fit", body: "Discover people and teams through transparent skills, roles and project needs." },
  { number: "03", icon: Radio, title: "Start building in public", body: "Share a build log, ask for feedback or invite collaborators into the conversation." },
  { number: "04", icon: Rocket, title: "Make it real", body: "Bring your team into a workspace, split the work and keep shipping together." },
];

const principles = [
  { icon: Sparkles, title: "Skills are the signal", body: "Make it easy to see what someone knows, what they want to learn and where they can help." },
  { icon: HeartHandshake, title: "People stay in control", body: "Connect and message through the product. Your email remains private unless you decide to share it." },
  { icon: GitBranch, title: "Work speaks for itself", body: "Share GitHub repositories, live demos and project updates right where collaborators meet." },
];

const stack = ["TypeScript", "React", "Next.js", "Node.js", "MongoDB", "Python", "Flutter", "Figma", "Open source", "Side projects", "Hackathons", "Product design"];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1">
        <HomeHero />

        <section aria-label="Builder technologies and interests" className="border-b border-border bg-surface/50 py-4 sm:py-5">
          <div className="container-page flex max-w-[1320px] items-center gap-5">
            <span className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted md:block">Made for builders across</span>
            <div className="home-marquee relative min-w-0 flex-1 overflow-hidden">
              <div className="home-marquee-track flex w-max items-center gap-2.5 pr-2 hover:[animation-play-state:paused]">
                {[...stack, ...stack].map((item, index) => <span key={`${item}-${index}`} aria-hidden={index >= stack.length} className="inline-flex h-8 items-center gap-2 rounded-full border border-border bg-bg px-3 text-[11px] font-medium text-muted"><span className="h-1.5 w-1.5 rounded-full bg-accent/60" />{item}</span>)}
              </div>
            </div>
          </div>
        </section>

        <section className="container-page max-w-[1240px] py-20 sm:py-28">
          <Reveal>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">The problem with building alone</p>
                <h2 className="mt-3 max-w-[17ch] text-3xl font-semibold leading-tight tracking-[-0.05em] text-text sm:text-[2.7rem]">Great projects need more than a group chat.</h2>
              </div>
              <p className="max-w-[42ch] text-sm leading-6 text-muted sm:text-base">Meet people through their skills and ideas, then keep your project moving in the same place.</p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {frictionPoints.map((point, index) => <Reveal key={point.number} delay={index * 0.08}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-raised sm:p-6">
                <div className="flex items-center justify-between"><span className="font-mono text-xs text-muted">/{point.number}</span><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"><point.icon className="h-5 w-5" /></span></div>
                <h3 className="mt-8 text-lg font-semibold tracking-tight text-text">{point.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{point.body}</p>
                <div className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-accent to-cyan-400 transition-transform duration-500 group-hover:scale-x-100" />
              </div>
            </Reveal>)}
          </div>
        </section>

        <HomeProductShowcase />

        <section id="how-it-works" className="relative border-y border-border bg-surface/45 py-20 sm:py-28">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(var(--accent)/0.07),transparent_56%)]" />
          <div className="container-page relative max-w-[1240px]">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">From first hello to first release</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-text sm:text-[2.7rem]">A better way to find your build crew.</h2>
                <p className="mt-3 text-sm leading-6 text-muted sm:text-base">Bring your skills, find a team that needs them and keep the work visible.</p>
              </div>
            </Reveal>
            <div className="relative mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div aria-hidden="true" className="absolute left-[12%] right-[12%] top-6 hidden h-px bg-gradient-to-r from-accent/10 via-accent/45 to-cyan-400/20 lg:block" />
              {flow.map((step, index) => <Reveal key={step.number} delay={index * 0.08}>
                <div className="relative h-full rounded-2xl border border-border bg-bg/80 p-5 backdrop-blur sm:p-6">
                  <div className="flex items-center justify-between"><span className="font-mono text-[11px] font-medium tracking-[0.12em] text-accent">STEP {step.number}</span><span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/15 bg-surface text-accent shadow-card"><step.icon className="h-5 w-5" /></span></div>
                  <h3 className="mt-6 text-base font-semibold text-text">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
                </div>
              </Reveal>)}
            </div>
          </div>
        </section>

        <section className="container-page max-w-[1240px] py-20 sm:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <Reveal>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Professional, without the noise</p>
                <h2 className="mt-3 max-w-[13ch] text-3xl font-semibold leading-tight tracking-[-0.05em] text-text sm:text-[2.7rem]">Build your reputation by building things.</h2>
                <p className="mt-4 max-w-[45ch] text-sm leading-7 text-muted sm:text-base">TeamForge gives developers a place to make their skills, projects and collaborations visible—without making follower counts the point.</p>
                <Link href="/about" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">How TeamForge works <ArrowUpRight className="h-4 w-4" /></Link>
              </div>
            </Reveal>
            <div className="grid gap-3 sm:grid-cols-3">
              {principles.map((principle, index) => <Reveal key={principle.title} delay={index * 0.08}>
                <div className="h-full rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/25 sm:p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent"><principle.icon className="h-5 w-5" /></div>
                  <h3 className="mt-5 text-sm font-semibold text-text">{principle.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted">{principle.body}</p>
                </div>
              </Reveal>)}
            </div>
          </div>
        </section>

        <section className="container-page max-w-[1240px] pb-20 sm:pb-28">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] border border-accent/20 bg-gradient-to-br from-accent-soft via-surface to-cyan-500/10 p-6 shadow-card sm:p-10 lg:p-12">
              <div aria-hidden="true" className="absolute -right-24 -top-36 h-80 w-80 rounded-full bg-accent/15 blur-[85px]" />
              <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-surface/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent"><Trophy className="h-3.5 w-3.5" /> Weekly Build Challenge</span>
                  <h2 className="mt-5 max-w-[16ch] text-3xl font-semibold leading-tight tracking-[-0.05em] text-text sm:text-[2.65rem]">A fresh reason to make something every week.</h2>
                  <p className="mt-3 max-w-[56ch] text-sm leading-6 text-muted sm:text-base">Pick a prompt, team up if you like and share what you learned. Small builds count. Progress is the point.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/challenges" className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-text px-5 text-sm font-semibold text-bg transition-transform hover:-translate-y-0.5">See this week’s challenge <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
                  <Link href="/coding" className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface px-5 text-sm font-semibold text-text transition-transform hover:-translate-y-0.5">Try daily coding <Code2 className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="relative isolate overflow-hidden border-t border-border bg-text py-20 text-bg sm:py-24">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_120%,hsl(var(--accent)/0.5),transparent_56%)]" />
          <Reveal>
            <div className="container-page max-w-[900px] text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300"><LockKeyhole className="h-5 w-5" /></span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Your next build is out there</p>
              <h2 className="mx-auto mt-3 max-w-[16ch] text-3xl font-semibold leading-tight tracking-[-0.05em] sm:text-5xl">Meet the people who make it possible.</h2>
              <p className="mx-auto mt-4 max-w-[52ch] text-sm leading-6 text-bg/65 sm:text-base">Create your builder profile, show your work and start finding the teammates your next idea needs.</p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link href="/signup" className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-cyan-200">Create your profile <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
                <Link href="/feed" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10">Explore the feed</Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </div>
  );
}
