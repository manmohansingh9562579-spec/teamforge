"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, Code2, GitPullRequest, MessageCircle, Search, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

const views = [
  { id: "discover", label: "Discover", title: "Meet people by the work they want to do.", body: "Search by skills, role, availability and project interests. Get a clear view of what each builder brings.", icon: Search, cta: "Explore developers", href: "/discover" },
  { id: "feed", label: "Build feed", title: "Let your work start the conversation.", body: "Share a build log, ask the community or call in collaborators. Keep the conversation attached to real work.", icon: MessageCircle, cta: "Open builder feed", href: "/feed" },
  { id: "workspace", label: "Team workspace", title: "Turn a good match into shipped work.", body: "Bring the team together around clear tasks, ownership and an activity trail that stays in one place.", icon: GitPullRequest, cta: "Explore teams", href: "/teams" },
] as const;

function PreviewScreen({ view }: { view: (typeof views)[number] }) {
  if (view.id === "discover") return <div className="space-y-3">
    <div className="flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2.5 text-xs text-muted"><Search className="h-3.5 w-3.5" /> Find a skill, role or builder</div>
    {[{ mark: "FE", title: "Frontend developer", tags: ["React", "TypeScript"], color: "from-violet-500 to-indigo-400" }, { mark: "BE", title: "Backend engineer", tags: ["Node.js", "MongoDB"], color: "from-cyan-500 to-blue-400" }].map((person) => <div key={person.mark} className="flex items-center gap-3 rounded-xl border border-border bg-bg p-3.5">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${person.color} text-[10px] font-bold text-white`}>{person.mark}</div>
      <div className="min-w-0 flex-1"><div className="text-xs font-semibold text-text">{person.title}</div><div className="mt-1.5 flex flex-wrap gap-1">{person.tags.map((tag) => <span key={tag} className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-[9px] text-accent">{tag}</span>)}</div></div>
      <span className="h-2 w-2 rounded-full bg-success" />
    </div>)}
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-accent/30 bg-accent-soft/30 p-3 text-[10px] text-muted"><UsersRound className="h-4 w-4 text-accent" /> Skill-first matching makes the fit easier to understand.</div>
  </div>;

  if (view.id === "feed") return <div className="rounded-2xl border border-border bg-bg p-4 sm:p-5">
    <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-[9px] font-bold text-white">UX</div><div><div className="text-xs font-semibold text-text">A builder in your community</div><div className="mt-0.5 text-[10px] text-muted">BUILD LOG · just shared</div></div></div><span className="rounded-full bg-accent-soft px-2 py-1 text-[9px] font-semibold text-accent">BUILD</span></div>
    <p className="mt-4 text-sm font-medium leading-6 text-text">“Shipped the first working prototype. Looking for feedback on the onboarding flow before I open it up.”</p>
    <div className="mt-4 rounded-xl border border-border bg-surface p-3"><div className="flex items-center gap-2 text-xs font-semibold text-text"><Code2 className="h-4 w-4 text-accent" /> Project update</div><div className="mt-3 flex gap-1.5"><span className="rounded bg-surface-hover px-2 py-1 font-mono text-[9px] text-muted">Next.js</span><span className="rounded bg-surface-hover px-2 py-1 font-mono text-[9px] text-muted">MongoDB</span><span className="rounded bg-surface-hover px-2 py-1 font-mono text-[9px] text-muted">UX</span></div></div>
    <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-[10px] text-muted"><span className="inline-flex items-center gap-1.5"><Check className="h-3 w-3 text-accent" /> Appreciate</span><span className="inline-flex items-center gap-1.5"><MessageCircle className="h-3 w-3 text-accent" /> Comment</span></div>
  </div>;

  return <div className="grid gap-3 sm:grid-cols-3">
    {[{ title: "To do", tone: "bg-muted/50", tasks: ["Scope API", "Write README"] }, { title: "In progress", tone: "bg-accent", tasks: ["Build onboarding"] }, { title: "Done", tone: "bg-success", tasks: ["Create repo"] }].map((column) => <div key={column.title} className="rounded-xl border border-border bg-bg p-3">
      <div className="mb-3 flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${column.tone}`} /><span className="text-[10px] font-semibold text-muted">{column.title}</span></div>
      <div className="space-y-2">{column.tasks.map((task, index) => <motion.div key={task} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="rounded-lg border border-border bg-surface p-2.5 text-[10px] font-medium text-text"><span className="mb-2 block h-1 w-6 rounded-full bg-accent/30" />{task}<div className="mt-2 flex items-center justify-between"><span className="font-mono text-[8px] text-muted">TASK-{index + 1}</span><span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft text-[8px] font-bold text-accent">{index ? "BE" : "FE"}</span></div></motion.div>)}</div>
    </div>)}
  </div>;
}

export function HomeProductShowcase() {
  const [selectedId, setSelectedId] = useState<(typeof views)[number]["id"]>("discover");
  const selected = views.find((view) => view.id === selectedId) ?? views[0];
  const reduceMotion = useReducedMotion();

  return (
    <section className="container-page max-w-[1240px] py-20 sm:py-28">
      <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">The TeamForge loop</p>
          <h2 className="mt-3 max-w-[14ch] text-3xl font-semibold leading-tight tracking-[-0.045em] text-text sm:text-[2.75rem]">A network that moves from hello to shipped.</h2>
        </div>
        <p className="max-w-[58ch] text-sm leading-7 text-muted sm:text-base">Every part of the product connects to the next: meet a builder, share what you are making, form the team and keep momentum in a shared workspace.</p>
      </div>

      <div className="mt-9 grid gap-4 lg:mt-12 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="flex flex-col gap-2">
          {views.map((view, index) => <motion.button
            key={view.id}
            type="button"
            onClick={() => setSelectedId(view.id)}
            whileHover={reduceMotion ? undefined : { x: 4 }}
            className={cn("group relative flex w-full items-start gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-colors sm:p-5", selectedId === view.id ? "border-accent/35 bg-accent-soft/50" : "border-transparent bg-surface hover:border-border hover:bg-surface-hover")}
          >
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", selectedId === view.id ? "bg-accent text-on-accent" : "bg-bg text-muted group-hover:text-accent")}><view.icon className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-text">{view.label}</span><span className="font-mono text-[10px] text-muted">0{index + 1}</span></span><span className="mt-2 block text-xs leading-5 text-muted">{view.body}</span></span>
            {selectedId === view.id && <motion.span layoutId="active-showcase" className="absolute inset-y-4 left-0 w-[3px] rounded-r-full bg-accent" transition={{ duration: reduceMotion ? 0 : 0.25 }} />}
          </motion.button>)}
        </div>

        <div className="relative overflow-hidden rounded-[26px] border border-border bg-surface p-4 shadow-raised sm:p-6">
          <div className="absolute -right-20 -top-28 h-64 w-64 rounded-full bg-accent/10 blur-[75px]" />
          <div className="relative flex min-h-[410px] flex-col">
            <div className="flex items-center justify-between border-b border-border pb-4"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white"><selected.icon className="h-4 w-4" /></span><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">Product preview</p><p className="text-xs font-medium text-text">{selected.label}</p></div></div><span className="font-mono text-[10px] text-muted">teamforge.app</span></div>
            <div className="grid flex-1 gap-6 py-5 sm:grid-cols-[0.8fr_1.2fr] sm:items-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={selected.id} initial={false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: reduceMotion ? 0.1 : 0.28 }}>
                  <p className="text-xs font-semibold uppercase tracking-[0.13em] text-accent">{selected.label}</p>
                  <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.04em] text-text">{selected.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{selected.body}</p>
                  <Link href={selected.href} className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-accent hover:underline">{selected.cta}<ArrowUpRight className="h-3.5 w-3.5" /></Link>
                </motion.div>
              </AnimatePresence>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={`${selected.id}-preview`} initial={false} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: reduceMotion ? 0.1 : 0.3 }} className="rounded-2xl border border-border bg-surface p-3 shadow-card sm:p-4"><PreviewScreen view={selected} /></motion.div>
              </AnimatePresence>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-[10px] text-muted"><span>Connected by real work</span><span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success" /> No vanity metrics</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
