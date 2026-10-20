"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown, ArrowRight, ArrowUpRight, Code2, GitBranch, Layers3,
  MessageSquareText, Radio, Sparkles, UsersRound,
} from "lucide-react";

const collaborators = [
  { label: "Frontend", mark: "FE", tone: "from-violet-500 to-indigo-400", x: "left-[2%] top-[18%]" },
  { label: "Backend", mark: "BE", tone: "from-cyan-500 to-blue-400", x: "right-[1%] top-[34%]" },
  { label: "Design", mark: "UX", tone: "from-orange-400 to-pink-500", x: "left-[7%] bottom-[14%]" },
];

export function HomeHero() {
  const reduceMotion = useReducedMotion();
  const enter = reduceMotion ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <div className="home-grid pointer-events-none absolute inset-0 -z-10 opacity-70" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-44 -top-64 -z-10 h-[620px] w-[620px] rounded-full bg-accent/15 blur-[120px]"
        animate={reduceMotion ? undefined : { x: [0, -28, 0], y: [0, 24, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-80 left-[18%] -z-10 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-[120px]"
        animate={reduceMotion ? undefined : { x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container-page grid min-h-[650px] max-w-[1320px] items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 lg:py-24">
        <motion.div {...enter} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 max-w-[670px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-surface/75 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-accent shadow-card backdrop-blur">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40" /><span className="relative inline-flex h-2 w-2 rounded-full bg-accent" /></span>
            The network for builders
          </div>

          <h1 className="mt-7 max-w-[13ch] text-[3.25rem] font-semibold leading-[0.98] tracking-[-0.065em] text-text sm:text-[4.6rem] lg:text-[5.45rem]">
            Find your people.
            <span className="mt-1 block bg-gradient-to-r from-accent via-violet-500 to-cyan-500 bg-clip-text pb-2 text-transparent">Ship what’s next.</span>
          </h1>
          <p className="mt-6 max-w-[52ch] text-base leading-7 text-muted sm:text-lg sm:leading-8">
            A professional network built around the work you want to do: meet coders by skill, show what you are making and build a team that gets it.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/feed" className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-on-accent shadow-[0_12px_35px_hsl(var(--accent)/0.25)] transition-all hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_16px_40px_hsl(var(--accent)/0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2">
              Explore the builder feed <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/discover" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface/70 px-5 text-sm font-semibold text-text backdrop-blur transition-colors hover:bg-surface-hover">
              Find teammates <UsersRound className="h-4 w-4 text-accent" />
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-muted">
            <span className="inline-flex items-center gap-2"><Code2 className="h-4 w-4 text-accent" /> Skills over follower counts</span>
            <span className="hidden h-4 w-px bg-border-strong sm:block" />
            <span className="inline-flex items-center gap-2"><GitBranch className="h-4 w-4 text-accent" /> Built around real projects</span>
          </div>

          <a href="#how-it-works" className="mt-11 inline-flex items-center gap-2 text-xs font-medium text-muted transition-colors hover:text-text">
            See how TeamForge works <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
          </a>
        </motion.div>

        <div className="relative mx-auto w-full max-w-[610px] lg:mr-0">
          <div aria-hidden="true" className="absolute inset-[13%] rounded-full bg-accent/15 blur-[75px]" />
          <svg aria-hidden="true" viewBox="0 0 640 520" fill="none" className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible opacity-80">
            <motion.path d="M110 112 C180 180 245 204 320 258 C410 326 488 176 548 184" stroke="url(#network-line)" strokeWidth="1.5" strokeDasharray="6 8" animate={reduceMotion ? undefined : { strokeDashoffset: [0, -56] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} />
            <motion.path d="M143 416 C220 330 239 310 320 258 C400 208 449 372 520 386" stroke="url(#network-line)" strokeWidth="1.5" strokeDasharray="5 9" animate={reduceMotion ? undefined : { strokeDashoffset: [0, 70] }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }} />
            <defs><linearGradient id="network-line" x1="96" y1="128" x2="560" y2="402" gradientUnits="userSpaceOnUse"><stop stopColor="#818cf8" stopOpacity=".2" /><stop offset=".5" stopColor="#8b5cf6" stopOpacity=".9" /><stop offset="1" stopColor="#22d3ee" stopOpacity=".35" /></linearGradient></defs>
          </svg>

          <motion.div
            {...(reduceMotion ? {} : { initial: { opacity: 0, scale: 0.94, rotate: 1.2 }, animate: { opacity: 1, scale: 1, rotate: 0 } })}
            transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            whileHover={reduceMotion ? undefined : { y: -5, rotate: -0.35 }}
            className="relative z-10 rounded-[28px] border border-border/90 bg-surface/90 p-3 shadow-[0_30px_100px_hsl(var(--shadow)/0.22)] backdrop-blur-xl sm:p-4"
          >
            <div className="flex items-center justify-between border-b border-border px-2 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5"><span className="h-2 w-2 rounded-full bg-danger/80" /><span className="h-2 w-2 rounded-full bg-warning/80" /><span className="h-2 w-2 rounded-full bg-success/80" /></div>
                <span className="ml-2 font-mono text-[10px] text-muted">teamforge / discover</span>
              </div>
              <span className="rounded-full border border-accent/20 bg-accent-soft px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-accent">Interface preview</span>
            </div>

            <div className="grid gap-3 p-1 pt-4 sm:grid-cols-[1fr_0.8fr]">
              <div className="rounded-2xl border border-border bg-bg p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">Find your next teammate</p><p className="mt-1 text-sm font-semibold text-text">People who build</p></div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent"><UsersRound className="h-4 w-4" /></div>
                </div>
                <div className="mt-4 flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-[10px] text-muted"><span className="h-2.5 w-2.5 rounded-full border border-muted/70" /> Skills, roles, interests…</div>
                <div className="mt-4 space-y-2.5">
                  <div className="rounded-xl border border-accent/25 bg-surface p-3 shadow-card">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-400 text-[10px] font-bold text-white">FE</div>
                      <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-text">Frontend builder</p><p className="mt-0.5 text-[10px] text-muted">Open to side projects</p></div>
                      <span className="h-2 w-2 rounded-full bg-success" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5"><span className="rounded-md bg-accent-soft px-2 py-1 font-mono text-[9px] text-accent">React</span><span className="rounded-md bg-accent-soft px-2 py-1 font-mono text-[9px] text-accent">TypeScript</span><span className="rounded-md bg-accent-soft px-2 py-1 font-mono text-[9px] text-accent">Next.js</span></div>
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-3">
                    <div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-400 text-[10px] font-bold text-white">BE</div><div><p className="text-xs font-semibold text-text">Backend engineer</p><p className="mt-0.5 text-[10px] text-muted">Interested in open source</p></div></div>
                    <div className="mt-3 flex gap-1.5"><span className="rounded-md bg-surface-hover px-2 py-1 font-mono text-[9px] text-muted">Node.js</span><span className="rounded-md bg-surface-hover px-2 py-1 font-mono text-[9px] text-muted">MongoDB</span></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex-1 rounded-2xl border border-border bg-gradient-to-br from-accent-soft/75 via-surface to-surface p-4">
                  <div className="flex items-center justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-lg shadow-accent/20"><Radio className="h-4 w-4" /></div><Sparkles className="h-4 w-4 text-accent" /></div>
                  <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">Builder feed</p>
                  <p className="mt-1 text-base font-semibold leading-snug tracking-tight text-text">Share the work. Find your people.</p>
                  <div className="mt-4 rounded-xl border border-border/80 bg-surface/90 p-3 shadow-card">
                    <div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-[9px] font-bold text-white">UX</div><div className="h-2 w-20 rounded-full bg-muted/30" /></div>
                    <div className="mt-3 h-2 w-full rounded-full bg-muted/20" /><div className="mt-1.5 h-2 w-4/5 rounded-full bg-muted/15" />
                    <div className="mt-3 flex items-center gap-2 text-[9px] text-muted"><MessageSquareText className="h-3 w-3 text-accent" /> Build logs · Questions · Team-ups</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success"><Layers3 className="h-4 w-4" /></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">A shared goal</p><p className="text-xs font-semibold text-text">From idea to shipped project</p></div></div>
                  <div className="mt-4 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-hover"><motion.div className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-400" animate={reduceMotion ? undefined : { width: ["38%", "68%", "52%", "82%"] }} transition={{ duration: 9, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }} style={{ width: "62%" }} /></div><span className="font-mono text-[9px] text-muted">team workspace</span></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border px-2 pt-3 text-[10px] text-muted"><span>Profiles · Projects · Teams</span><span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Made for builders</span></div>
          </motion.div>

          {collaborators.map((node, index) => <motion.div
            key={node.label}
            className={`absolute ${node.x} z-20 hidden items-center gap-2 rounded-full border border-border bg-surface/90 p-1.5 pr-3 shadow-raised backdrop-blur sm:flex`}
            animate={reduceMotion ? undefined : { y: [0, index % 2 ? -9 : 8, 0] }}
            transition={{ duration: 5 + index, delay: index * 0.3, repeat: Infinity, ease: "easeInOut" }}
          ><span className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${node.tone} text-[9px] font-bold text-white`}>{node.mark}</span><span className="text-[10px] font-medium text-text">{node.label}</span><ArrowUpRight className="h-3 w-3 text-muted" /></motion.div>)}
        </div>
      </div>
    </section>
  );
}
