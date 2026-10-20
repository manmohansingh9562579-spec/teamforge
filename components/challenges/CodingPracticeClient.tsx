"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { KeyboardEvent } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Code2,
  Flame,
  Lightbulb,
  LoaderCircle,
  LockKeyhole,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { CODE_TEMPLATES, type CodingDifficulty, type CodingLanguage } from "@/lib/codingLanguages";

type PublicProblem = {
  slug: string;
  title: string;
  difficulty: CodingDifficulty;
  topic: string;
  tags: string[];
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: { input: string; output: string; explanation: string }[];
  hints: string[];
};

type ProblemSummary = Pick<PublicProblem, "slug" | "title" | "difficulty" | "topic" | "tags">;
type ProgressEntry = { dateKey: string; problemSlug: string; language: CodingLanguage; attempts: number; solvedAt: string | null };
type CodingData = {
  dateKey: string;
  dailySlug: string;
  selectedProblem: PublicProblem;
  problems: ProblemSummary[];
  languages: { id: CodingLanguage; label: string }[];
  isAuthenticated: boolean;
  todayProgress: { language: CodingLanguage; sourceCode: string; attempts: number; accepted: boolean; solvedAt: string | null } | null;
  acceptedProgress: ProgressEntry[];
};
type RunResult = {
  state: "running" | "finished";
  mode: "run" | "submit";
  accepted?: boolean;
  results: { caseNumber: number; hidden: boolean; statusId: number; verdict: string; time: string | null; memory: number | null; output?: string; error?: string }[];
};

const difficultyClass: Record<CodingDifficulty, string> = {
  Easy: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Medium: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Hard: "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

function dateKeyFor(date: Date) {
  return date.toISOString().slice(0, 10);
}

function shiftDateKey(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return dateKeyFor(date);
}

function formatChallengeDate(dateKey: string) {
  return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" })
    .format(new Date(`${dateKey}T00:00:00.000Z`));
}

function calculateStreaks(accepted: ProgressEntry[], dateKey: string) {
  const days = new Set(accepted.map((entry) => entry.dateKey));
  let cursor = days.has(dateKey) ? dateKey : shiftDateKey(dateKey, -1);
  let current = 0;
  while (days.has(cursor)) {
    current += 1;
    cursor = shiftDateKey(cursor, -1);
  }

  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let previous = "";
  for (const day of sorted) {
    run = previous && shiftDateKey(previous, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }
  return { current, best, solved: days.size };
}

function getErrorMessage(json: any, fallback: string) {
  return typeof json?.error === "string" ? json.error : fallback;
}

export function CodingPracticeClient() {
  const [data, setData] = useState<CodingData | null>(null);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [language, setLanguage] = useState<CodingLanguage>("python");
  const [code, setCode] = useState(CODE_TEMPLATES.python);
  const [difficultyFilter, setDifficultyFilter] = useState<"All" | CodingDifficulty>("All");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runId, setRunId] = useState("");
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [runnerError, setRunnerError] = useState("");
  const [showHints, setShowHints] = useState(false);
  const drafts = useRef<Record<string, string>>({});
  const languageRef = useRef<CodingLanguage>("python");
  const requestId = useRef(0);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const loadData = useCallback(async (slug?: string, showLoading = true) => {
    const currentRequest = ++requestId.current;
    if (showLoading) setLoading(true);
    setLoadError(false);
    try {
      const response = await fetch(`/api/coding${slug ? `?slug=${encodeURIComponent(slug)}` : ""}`, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(json, "Could not load coding practice"));
      const next = json.data as CodingData;
      if (currentRequest !== requestId.current) return;

      const nextSlug = next.selectedProblem.slug;
      const nextLanguage = next.todayProgress?.language ?? languageRef.current;
      const draftKey = `${nextSlug}:${nextLanguage}`;
      const nextCode = drafts.current[draftKey] ?? next.todayProgress?.sourceCode ?? CODE_TEMPLATES[nextLanguage];

      setData(next);
      setSelectedSlug(nextSlug);
      setLanguage(nextLanguage);
      languageRef.current = nextLanguage;
      setCode(nextCode);
    } catch {
      if (currentRequest === requestId.current) setLoadError(true);
    } finally {
      if (showLoading && currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const problem = data?.selectedProblem;
  const streaks = useMemo(
    () => data ? calculateStreaks(data.acceptedProgress, data.dateKey) : { current: 0, best: 0, solved: 0 },
    [data]
  );
  const filteredProblems = useMemo(() => data?.problems.filter((item) =>
    difficultyFilter === "All" || item.difficulty === difficultyFilter
  ) ?? [], [data, difficultyFilter]);
  const solvedToday = data?.acceptedProgress.some((entry) => entry.dateKey === data.dateKey) ?? false;
  const solvedTodaySlugs = useMemo(() => new Set(
    data?.acceptedProgress.filter((entry) => entry.dateKey === data.dateKey).map((entry) => entry.problemSlug) ?? []
  ), [data]);

  function onCodeChange(value: string) {
    setCode(value);
    if (problem) drafts.current[`${problem.slug}:${language}`] = value;
  }

  function onLanguageChange(nextLanguage: CodingLanguage) {
    if (!problem) return;
    drafts.current[`${problem.slug}:${language}`] = code;
    const nextCode = drafts.current[`${problem.slug}:${nextLanguage}`] ?? CODE_TEMPLATES[nextLanguage];
    setLanguage(nextLanguage);
    languageRef.current = nextLanguage;
    setCode(nextCode);
    drafts.current[`${problem.slug}:${nextLanguage}`] = nextCode;
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Tab") return;
    event.preventDefault();
    const editor = event.currentTarget;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const nextCode = `${code.slice(0, start)}  ${code.slice(end)}`;
    onCodeChange(nextCode);
    requestAnimationFrame(() => {
      editorRef.current?.setSelectionRange(start + 2, start + 2);
    });
  }

  async function pollRun(id: string) {
    setIsRunning(true);
    setRunnerError("");
    try {
      for (let attempt = 0; attempt < 40; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 250 : 800));
        const response = await fetch(`/api/coding/execute/result?runId=${encodeURIComponent(id)}`, { cache: "no-store" });
        const json = await response.json();
        if (!response.ok) throw new Error(getErrorMessage(json, "Could not read the run result"));
        const next = json.data as RunResult;
        setRunResult(next);
        if (next.state === "finished") {
          setRunId("");
          if (next.mode === "submit" && next.accepted) {
            toast.success("Challenge solved. Your coding streak is updated.");
            await loadData(selectedSlug || undefined, false);
          } else if (next.mode === "run" && next.results.every((result) => result.statusId === 3)) {
            toast.success("Sample tests passed. Submit to check hidden tests.");
          }
          return;
        }
      }
      setRunnerError("The judge is taking longer than usual. Check the result again in a moment.");
    } catch (error) {
      setRunnerError(error instanceof Error ? error.message : "Could not check this run");
    } finally {
      setIsRunning(false);
    }
  }

  async function startRun(mode: "run" | "submit") {
    if (!problem || !data) return;
    if (!data.isAuthenticated) {
      toast.error("Sign in before running code so your streak can be saved.");
      return;
    }
    setIsRunning(true);
    setRunnerError("");
    setRunResult(null);
    setRunResult({ state: "running", mode, results: [] });
    try {
      const response = await fetch("/api/coding/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemSlug: problem.slug, language, sourceCode: code, mode }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(json, "Could not start the code runner"));
      const nextRunId = json.data.runId as string;
      setRunId(nextRunId);
      setRunResult({ state: "running", mode, results: [] });
      await pollRun(nextRunId);
    } catch (error) {
      setRunnerError(error instanceof Error ? error.message : "Could not start the code runner");
      setIsRunning(false);
    }
  }

  if (loading) {
    return (
      <div className="container-page max-w-[1440px] py-10">
        <div className="h-8 w-64 animate-pulse rounded bg-surface-hover" />
        <div className="mt-5 h-24 animate-pulse rounded-2xl border border-border bg-surface" />
        <div className="mt-6 grid gap-5 lg:grid-cols-2"><div className="h-[520px] animate-pulse rounded-2xl border border-border bg-surface" /><div className="h-[520px] animate-pulse rounded-2xl border border-border bg-surface" /></div>
      </div>
    );
  }

  if (loadError || !data || !problem) {
    return <div className="container-page max-w-5xl py-10"><ErrorState onRetry={() => void loadData()} /></div>;
  }

  const isDailyProblem = problem.slug === data.dailySlug;

  return (
    <div className="container-page max-w-[1440px] py-8 pb-24 sm:py-10">
      <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent"><Code2 className="mr-1.5 h-3.5 w-3.5" /> Daily coding</Badge>
            <span className="text-xs text-muted">{formatChallengeDate(data.dateKey)} · Resets at 00:00 UTC</span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">Build your problem-solving streak.</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            One fresh coding question every day. Practice across languages, submit against hidden tests, and keep your streak alive.
          </p>
        </div>
        <Link href="/challenges" className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-border px-3.5 text-sm font-medium text-text transition-colors hover:bg-surface-hover">
          <Trophy className="h-4 w-4 text-accent" /> Weekly build challenge <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      <section className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="Coding progress">
        <Card className="flex items-center gap-4 p-4 sm:p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500"><Flame className="h-5 w-5" /></div>
          <div><p className="text-xs font-medium text-muted">Current streak</p><p className="mt-0.5 text-2xl font-semibold text-text">{streaks.current} <span className="text-sm font-medium text-muted">days</span></p></div>
          <div className="ml-auto flex gap-1" aria-label="Last seven days">
            {Array.from({ length: 7 }, (_, index) => {
              const day = shiftDateKey(data.dateKey, index - 6);
              const done = data.acceptedProgress.some((entry) => entry.dateKey === day);
              return <span key={day} title={`${day}${done ? " solved" : " not solved"}`} className={`h-2.5 w-2.5 rounded-full ${done ? "bg-emerald-500" : "bg-border-strong"}`} />;
            })}
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-4 sm:p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><CheckCircle2 className="h-5 w-5" /></div>
          <div><p className="text-xs font-medium text-muted">Problems solved</p><p className="mt-0.5 text-2xl font-semibold text-text">{streaks.solved}</p></div>
          <span className="ml-auto text-xs text-muted">all time</span>
        </Card>
        <Card className="flex items-center gap-4 p-4 sm:p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500"><Trophy className="h-5 w-5" /></div>
          <div><p className="text-xs font-medium text-muted">Personal best</p><p className="mt-0.5 text-2xl font-semibold text-text">{streaks.best} <span className="text-sm font-medium text-muted">days</span></p></div>
          <span className={`ml-auto inline-flex items-center gap-1 text-xs font-medium ${solvedToday ? "text-emerald-600 dark:text-emerald-400" : "text-muted"}`}>
            {solvedToday ? <><Check className="h-3.5 w-3.5" /> today done</> : <><Clock3 className="h-3.5 w-3.5" /> keep it going</>}
          </span>
        </Card>
      </section>

      {!data.isAuthenticated && (
        <div className="mt-5 flex flex-col justify-between gap-3 rounded-xl border border-accent/20 bg-accent-soft/50 p-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><p className="text-sm text-text">Sign in to run code and save your daily streak.</p></div>
          <Link href="/signin" className="inline-flex h-9 w-fit items-center rounded-lg bg-accent px-3.5 text-sm font-medium text-on-accent hover:bg-accent-hover">Sign in</Link>
        </div>
      )}

      <div className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section aria-labelledby="problem-title" className="min-w-0">
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-gradient-to-r from-accent-soft/90 via-surface to-surface px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${difficultyClass[problem.difficulty]}`}>{problem.difficulty}</span>
                <span className="rounded-full border border-border bg-surface/80 px-2.5 py-1 text-xs text-muted">{problem.topic}</span>
                {isDailyProblem && <Badge tone="accent"><Sparkles className="mr-1 h-3 w-3" /> Today&apos;s question</Badge>}
                {!isDailyProblem && <Badge tone="neutral">Practice</Badge>}
                {data.todayProgress?.accepted && isDailyProblem && <Badge tone="success"><CheckCircle2 className="mr-1 h-3 w-3" /> Solved</Badge>}
              </div>
              <h2 id="problem-title" className="mt-3 text-2xl font-semibold tracking-tight text-text">{problem.title}</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">{problem.tags.map((tag) => <span key={tag} className="rounded-md bg-surface/80 px-2 py-1 text-[11px] font-medium text-muted">{tag}</span>)}</div>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              <p className="text-sm leading-7 text-text/90">{problem.statement}</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-surface-hover/50 p-3.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Input</h3>
                  <p className="mt-2 text-sm leading-6 text-text">{problem.inputFormat}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface-hover/50 p-3.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Output</h3>
                  <p className="mt-2 text-sm leading-6 text-text">{problem.outputFormat}</p>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2"><BookOpen className="h-4 w-4 text-accent" /><h3 className="text-sm font-semibold text-text">Examples</h3></div>
                <div className="space-y-3">
                  {problem.examples.map((example, index) => (
                    <div key={`${problem.slug}-example-${index}`} className="overflow-hidden rounded-xl border border-border bg-surface-hover/30">
                      <div className="border-b border-border px-3.5 py-2 text-xs font-semibold text-muted">Example {index + 1}</div>
                      <div className="grid gap-3 p-3.5 sm:grid-cols-2">
                        <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">Input</p><pre className="whitespace-pre-wrap break-all font-mono text-xs leading-5 text-text">{example.input}</pre></div>
                        <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">Output</p><pre className="whitespace-pre-wrap break-all font-mono text-xs leading-5 text-text">{example.output}</pre></div>
                      </div>
                      <p className="px-3.5 pb-3 text-xs leading-5 text-muted"><span className="font-semibold text-text">Explanation: </span>{example.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text">Constraints</h3>
                <ul className="mt-2 space-y-1.5 pl-5 text-sm text-muted marker:text-accent">
                  {problem.constraints.map((constraint) => <li key={constraint} className="list-disc">{constraint}</li>)}
                </ul>
              </div>

              <div className="rounded-xl border border-border">
                <button type="button" onClick={() => setShowHints((value) => !value)} aria-expanded={showHints} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-text hover:bg-surface-hover">
                  <span className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" /> Need a hint?</span>
                  <ChevronDown className={`h-4 w-4 text-muted transition-transform ${showHints ? "rotate-180" : ""}`} />
                </button>
                {showHints && <ol className="space-y-2 border-t border-border px-4 py-3 pl-9 text-sm leading-6 text-muted">{problem.hints.map((hint) => <li key={hint} className="list-decimal">{hint}</li>)}</ol>}
              </div>
            </div>
          </Card>
        </section>

        <section aria-label="Code editor" className="min-w-0 xl:sticky xl:top-20">
          <Card className="overflow-hidden border-border-strong">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-hover/60 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2"><Terminal className="h-4 w-4 text-accent" /><h2 className="text-sm font-semibold text-text">Your solution</h2></div>
              <label className="flex items-center gap-2 text-xs font-medium text-muted">
                Language
                <select value={language} onChange={(event) => onLanguageChange(event.target.value as CodingLanguage)} className="h-9 min-w-36 rounded-lg border border-border-strong bg-surface px-3 text-xs font-semibold text-text outline-none focus:border-accent">
                  {data.languages.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
            </div>
            <div className="relative bg-[#0c1018]">
              <div className="flex items-center gap-2 border-b border-white/[0.08] px-4 py-2.5 text-[11px] text-slate-400"><span className="h-2 w-2 rounded-full bg-rose-400" /><span className="h-2 w-2 rounded-full bg-amber-400" /><span className="h-2 w-2 rounded-full bg-emerald-400" /><span className="ml-2 font-mono">solution.{language === "python" ? "py" : language === "javascript" ? "js" : language === "typescript" ? "ts" : language === "java" ? "java" : language === "cpp" ? "cpp" : language === "go" ? "go" : "c"}</span></div>
              <textarea
                ref={editorRef}
                aria-label="Write your solution code"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                value={code}
                onChange={(event) => onCodeChange(event.target.value)}
                onKeyDown={handleEditorKeyDown}
                className="block min-h-[360px] w-full resize-y bg-transparent px-5 py-4 font-mono text-[13px] leading-6 text-slate-100 outline-none placeholder:text-slate-500 focus:ring-0 sm:min-h-[440px]"
                placeholder="Write your solution here..."
              />
              <div className="pointer-events-none absolute bottom-3 right-4 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-slate-500">{code.split("\n").length} lines</div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-hover/40 px-4 py-3 sm:px-5">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Runs in an isolated Judge0 sandbox</span>
              <div className="flex flex-wrap items-center gap-2">
                {runId && !isRunning && <button type="button" onClick={() => void pollRun(runId)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border-strong px-3 text-xs font-semibold text-text hover:bg-surface-hover"><Clock3 className="h-3.5 w-3.5" /> Check result</button>}
                <button type="button" disabled={isRunning || !data.isAuthenticated} onClick={() => void startRun("run")} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border-strong px-3 text-xs font-semibold text-text transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50">
                  {isRunning && runResult?.mode === "run" ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />} Run samples
                </button>
                <button type="button" disabled={isRunning || !data.isAuthenticated} onClick={() => void startRun("submit")} className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3.5 text-xs font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50">
                  {isRunning && runResult?.mode === "submit" ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Submit solution
                </button>
              </div>
            </div>
            <div className="border-t border-border px-4 py-3 sm:px-5">
              <p className="flex items-start gap-2 text-[11px] leading-5 text-muted"><CircleHelp className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Code is sent to the Judge0 runner for compilation and testing. Don&apos;t include passwords, API keys, or other secrets.</p>
            </div>
            {(runResult || runnerError) && (
              <div className="border-t border-border bg-surface-hover/25 p-4 sm:p-5" aria-live="polite">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-text">{runnerError ? "Runner status" : runResult?.state === "running" ? "Checking your code…" : runResult?.accepted ? "Accepted · All tests passed" : runResult?.mode === "run" && runResult.results.every((item) => item.statusId === 3) ? "Samples passed" : "Submission results"}</h3>
                  {runResult?.state === "running" && <span className="inline-flex items-center gap-1.5 text-xs text-muted"><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> In queue or running</span>}
                </div>
                {runnerError && <p role="alert" className="mt-2 text-sm text-amber-600 dark:text-amber-400">{runnerError}</p>}
                {runResult?.mode === "run" && runResult.state === "finished" && runResult.results.every((item) => item.statusId === 3) && <p className="mt-1 text-xs text-muted">Visible examples passed. Submit your solution to check hidden cases and update your streak.</p>}
                {runResult?.results.length ? <div className="mt-3 space-y-2">
                  {runResult.results.map((result) => {
                    const success = result.statusId === 3;
                    return <div key={`${runResult.mode}-${result.caseNumber}`} className="flex flex-col gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 sm:flex-row sm:items-center">
                      <span className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md text-xs font-semibold ${success ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : result.statusId < 3 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"}`}>{success ? <Check className="h-4 w-4" /> : result.caseNumber}</span>
                      <div className="min-w-0 flex-1"><p className={`text-xs font-semibold ${success ? "text-emerald-600 dark:text-emerald-400" : result.statusId < 3 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}`}>{result.hidden ? "Hidden test" : `Test case ${result.caseNumber}`} · {result.verdict}</p>
                        {!result.hidden && result.error && <pre className="mt-1 max-h-20 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] text-rose-500">{result.error}</pre>}
                        {!result.hidden && result.output && !success && <pre className="mt-1 max-h-20 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] text-muted">Output: {result.output}</pre>}
                        {result.hidden && result.error && <p className="mt-1 text-[11px] text-muted">{result.error}</p>}
                      </div>
                      {result.time && <span className="shrink-0 text-[10px] text-muted">{result.time}s · {result.memory ?? "–"} KB</span>}
                    </div>;
                  })}
                </div> : null}
              </div>
            )}
          </Card>
        </section>
      </div>

      <section className="mt-9" aria-labelledby="problem-bank-heading">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-accent">Keep practicing</p><h2 id="problem-bank-heading" className="mt-1 text-xl font-semibold tracking-tight text-text">Problem bank</h2><p className="mt-1 text-sm text-muted">Pick a question. Solving any one today keeps your daily streak moving.</p></div>
          <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1" role="group" aria-label="Filter by difficulty">
            {(["All", "Easy", "Medium", "Hard"] as const).map((item) => <button key={item} type="button" onClick={() => setDifficultyFilter(item)} aria-pressed={difficultyFilter === item} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${difficultyFilter === item ? "bg-accent-soft text-accent" : "text-muted hover:text-text"}`}>{item}</button>)}
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProblems.map((item) => {
            const active = item.slug === selectedSlug;
            const isDaily = item.slug === data.dailySlug;
            const solved = solvedTodaySlugs.has(item.slug);
            return <button key={item.slug} type="button" onClick={() => { setRunResult(null); setRunId(""); setRunnerError(""); void loadData(item.slug); }} aria-current={active ? "true" : undefined} className={`group rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-raised ${active ? "border-accent/50 bg-accent-soft/40" : "border-border bg-surface"}`}>
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="truncate text-sm font-semibold text-text">{item.title}</span>{isDaily && <Sparkles className="h-3.5 w-3.5 text-accent" />}</div><p className="mt-1 text-xs text-muted">{item.topic}</p></div>{solved && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}</div>
              <div className="mt-3 flex items-center justify-between gap-2"><span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${difficultyClass[item.difficulty]}`}>{item.difficulty}</span><span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted group-hover:text-accent">{solved ? "Solved today" : isDaily ? "Today" : "Practice"}<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" /></span></div>
            </button>;
          })}
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-2 rounded-xl border border-border bg-surface-hover/40 p-4 sm:flex-row sm:items-center">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs leading-5 text-muted">The judge sandbox compiles and runs submissions with resource limits and networking disabled. Runner availability depends on the public Judge0 service.</p>
        <Link href="/challenges" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-accent hover:underline">Share a weekly build <ArrowRight className="h-3 w-3" /></Link>
      </div>
    </div>
  );
}
