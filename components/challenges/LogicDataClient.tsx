"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Calculator,
  Check,
  CheckCircle2,
  CircleHelp,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LocalAICoach } from "@/components/challenges/LocalAICoach";
import type { LogicDataChallenge, LogicDataDifficulty, LogicDataTrack } from "@/lib/logicDataChallenges";
import { generateLogicDataQuestions, type GeneratedLogicDataChallenge } from "@/lib/logicDataQuestionGenerator";

type TrackFilter = "All" | LogicDataTrack;
type DifficultyFilter = "All" | LogicDataDifficulty;
type AnswerState = "correct" | "incorrect" | null;
type PublicChallenge = Omit<LogicDataChallenge, "answerId" | "explanation">;
type ActiveChallenge = PublicChallenge & Partial<Pick<LogicDataChallenge, "answerId" | "explanation">>;
type AccountStats = {
  solvedCount: number;
  totalAttempts: number;
  correctAttempts: number;
  currentStreak: number;
  bestStreak: number;
};
type ChallengeAttempt = { attempts: number; correct: number };

const progressKey = "teamforge-logic-data-solved-v1";
const attemptKey = "teamforge-logic-data-attempts-v1";
const generatedKey = "teamforge-logic-data-generated-v1";
const tracks: TrackFilter[] = ["All", "Data", "Math", "Logic"];
const difficulties: DifficultyFilter[] = ["All", "Easy", "Medium", "Hard", "Advanced"];

const difficultyTone: Record<LogicDataDifficulty, string> = {
  Easy: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Medium: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Hard: "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  Advanced: "border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

function isGeneratedChallenge(value: unknown): value is GeneratedLogicDataChallenge {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Partial<GeneratedLogicDataChallenge>;
  return typeof item.id === "string" && item.id.startsWith("logic-generated-")
    && typeof item.title === "string" && item.title.length <= 140
    && (item.track === "Data" || item.track === "Math" || item.track === "Logic")
    && (item.difficulty === "Easy" || item.difficulty === "Medium" || item.difficulty === "Hard" || item.difficulty === "Advanced")
    && typeof item.prompt === "string" && item.prompt.length <= 2000
    && Array.isArray(item.options) && item.options.length === 4
    && item.options.every((option) => option && typeof option.id === "string" && typeof option.label === "string" && option.label.length <= 240)
    && typeof item.answerId === "string" && item.options.some((option) => option.id === item.answerId)
    && typeof item.hint === "string" && item.hint.length <= 800
    && typeof item.explanation === "string" && item.explanation.length <= 1200
    && typeof item.focus === "string" && item.focus.length <= 80 && item.generated === true;
}

function TrackIcon({ track, className }: { track: LogicDataTrack; className?: string }) {
  if (track === "Data") return <BarChart3 className={className} />;
  if (track === "Math") return <Calculator className={className} />;
  return <Brain className={className} />;
}

export function LogicDataClient({ challenges }: { challenges: PublicChallenge[] }) {
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("All");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("All");
  const [selectedId, setSelectedId] = useState(challenges[0]?.id ?? "");
  const [selectedOption, setSelectedOption] = useState("");
  const [answerState, setAnswerState] = useState<AnswerState>(null);
  const [answerExplanation, setAnswerExplanation] = useState("");
  const [answerError, setAnswerError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [browserSolvedIds, setBrowserSolvedIds] = useState<string[]>([]);
  const [attemptHistory, setAttemptHistory] = useState<Record<string, ChallengeAttempt>>({});
  const [generatedChallenges, setGeneratedChallenges] = useState<GeneratedLogicDataChallenge[]>([]);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [generationError, setGenerationError] = useState(false);
  const [accountSolvedIds, setAccountSolvedIds] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accountStats, setAccountStats] = useState<AccountStats | null>(null);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const generatingRef = useRef(false);
  const solvedIds = isAuthenticated
    ? [...new Set([...accountSolvedIds, ...browserSolvedIds])]
    : browserSolvedIds;
  const allChallenges = useMemo<ActiveChallenge[]>(() => [...challenges, ...generatedChallenges], [challenges, generatedChallenges]);

  useEffect(() => {
    try {
      const generatedSaved = window.localStorage.getItem(generatedKey);
      const parsedGenerated: unknown = generatedSaved ? JSON.parse(generatedSaved) : [];
      const restoredGenerated = Array.isArray(parsedGenerated)
        ? parsedGenerated.filter(isGeneratedChallenge).slice(-300)
        : [];
      setGeneratedChallenges(restoredGenerated);
      const knownIds = new Set([...challenges.map((challenge) => challenge.id), ...restoredGenerated.map((challenge) => challenge.id)]);

      const savedProgress = window.localStorage.getItem(progressKey);
      if (savedProgress) {
        const parsed: unknown = JSON.parse(savedProgress);
        if (Array.isArray(parsed)) {
          const validIds = parsed.filter((id): id is string => typeof id === "string" && knownIds.has(id));
          setBrowserSolvedIds([...new Set(validIds)]);
        }
      }
      const savedAttempts = window.localStorage.getItem(attemptKey);
      if (savedAttempts) {
        const parsed: unknown = JSON.parse(savedAttempts);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const validEntries = Object.entries(parsed).filter(([id, value]) =>
            knownIds.has(id)
            && value && typeof value === "object"
            && Number.isSafeInteger((value as ChallengeAttempt).attempts)
            && (value as ChallengeAttempt).attempts >= 0
            && Number.isSafeInteger((value as ChallengeAttempt).correct)
            && (value as ChallengeAttempt).correct >= 0
            && (value as ChallengeAttempt).correct <= (value as ChallengeAttempt).attempts
          );
          setAttemptHistory(Object.fromEntries(validEntries) as Record<string, ChallengeAttempt>);
        }
      }
    } catch {
      // Keep local practice usable if browser storage is unavailable.
    } finally {
      setProgressLoaded(true);
    }
  }, [challenges]);

  useEffect(() => {
    if (!progressLoaded) return;
    try {
      window.localStorage.setItem(progressKey, JSON.stringify(browserSolvedIds));
    } catch {
      // Progress remains available for the current visit if storage is full or blocked.
    }
  }, [browserSolvedIds, progressLoaded]);

  useEffect(() => {
    if (!progressLoaded) return;
    try {
      window.localStorage.setItem(attemptKey, JSON.stringify(attemptHistory));
    } catch {
      // The coach remains available for this visit if browser storage is full or blocked.
    }
  }, [attemptHistory, progressLoaded]);

  useEffect(() => {
    if (!progressLoaded) return;
    try {
      window.localStorage.setItem(generatedKey, JSON.stringify(generatedChallenges.slice(-300)));
    } catch {
      // New prompts remain usable for the current session if browser storage is full.
    }
  }, [generatedChallenges, progressLoaded]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/logic-data/progress", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.ok || cancelled) return;
        setIsAuthenticated(Boolean(payload.data.authenticated));
        if (payload.data.authenticated) {
          setAccountSolvedIds(payload.data.solvedIds);
          setAccountStats(payload.data.stats);
        }
      })
      .catch(() => {
        // Browser progress remains available if the account progress service is unavailable.
      });
    return () => { cancelled = true; };
  }, []);

  const filteredChallenges = useMemo(() => allChallenges.filter((challenge) =>
    (trackFilter === "All" || challenge.track === trackFilter)
      && (difficultyFilter === "All" || challenge.difficulty === difficultyFilter)
  ), [allChallenges, difficultyFilter, trackFilter]);

  const selectedChallenge = filteredChallenges.find((challenge) => challenge.id === selectedId)
    ?? filteredChallenges[0]
    ?? allChallenges[0];

  const practiceCoach = (() => {
    const trackStats = (tracks.slice(1) as LogicDataTrack[]).map((track) => {
      const prompts = allChallenges.filter((challenge) => challenge.track === track);
      const attempts = prompts.reduce((sum, challenge) => sum + (attemptHistory[challenge.id]?.attempts ?? 0), 0);
      const correct = prompts.reduce((sum, challenge) => sum + (attemptHistory[challenge.id]?.correct ?? 0), 0);
      const solved = prompts.filter((challenge) => solvedIds.includes(challenge.id)).length;
      return { track, prompts, attempts, correct, solved, score: attempts ? correct / attempts : solved / prompts.length };
    }).filter((item) => item.prompts.length > 0)
      .sort((a, b) => a.score - b.score || a.solved - b.solved || a.track.localeCompare(b.track));
    const focus = trackStats[0];
    if (!focus?.prompts.length) return null;

    const difficultyRank: Record<LogicDataDifficulty, number> = { Easy: 0, Medium: 1, Hard: 2, Advanced: 3 };
    const recommended = focus.prompts
      .filter((challenge) => !solvedIds.includes(challenge.id))
      .sort((a, b) => difficultyRank[a.difficulty] - difficultyRank[b.difficulty])[0]
      ?? [...focus.prompts].sort((a, b) => {
        const aAttempts = attemptHistory[a.id]?.attempts ?? 0;
        const bAttempts = attemptHistory[b.id]?.attempts ?? 0;
        const aAccuracy = aAttempts ? (attemptHistory[a.id]?.correct ?? 0) / aAttempts : 1;
        const bAccuracy = bAttempts ? (attemptHistory[b.id]?.correct ?? 0) / bAttempts : 1;
        return aAccuracy - bAccuracy || aAttempts - bAttempts;
      })[0];
    if (!recommended) return null;

    return {
      track: focus.track,
      challenge: recommended,
      reason: focus.attempts
        ? `${focus.attempts - focus.correct} missed answer${focus.attempts - focus.correct === 1 ? "" : "s"} in ${focus.track} show where another round can help.`
        : `You’ve solved ${focus.solved} of ${focus.prompts.length} ${focus.track} prompts. A short practice round will build coverage.`,
    };
  })();

  const generateMoreQuestions = useCallback(() => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setIsGeneratingMore(true);
    setGenerationError(false);
    try {
      const seedWords = new Uint32Array(1);
      const seed = typeof window !== "undefined" && window.crypto?.getRandomValues
        ? window.crypto.getRandomValues(seedWords)[0]
        : Math.floor(Math.random() * 0xffffffff);
      const batch = generateLogicDataQuestions({
        seed,
        startAt: allChallenges.length,
        track: trackFilter,
        difficulty: difficultyFilter,
      });
      setGeneratedChallenges((current) => [...current, ...batch]);
    } catch {
      setGenerationError(true);
    } finally {
      generatingRef.current = false;
      setIsGeneratingMore(false);
    }
  }, [allChallenges.length, difficultyFilter, trackFilter]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) generateMoreQuestions();
    }, { rootMargin: "320px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [filteredChallenges.length, generateMoreQuestions]);

  if (!selectedChallenge) {
    return <div className="container-page py-16 text-sm text-muted">No practice prompts are available right now.</div>;
  }

  function chooseChallenge(id: string) {
    setSelectedId(id);
    setSelectedOption("");
    setAnswerState(null);
    setAnswerExplanation("");
    setAnswerError("");
    setShowHint(false);
  }

  function chooseTrack(track: TrackFilter) {
    const nextTrack = trackFilter === track ? "All" : track;
    setTrackFilter(nextTrack);
    const nextChallenge = allChallenges.find((challenge) =>
      (nextTrack === "All" || challenge.track === nextTrack)
        && (difficultyFilter === "All" || challenge.difficulty === difficultyFilter)
    );
    if (nextChallenge) setSelectedId(nextChallenge.id);
    setSelectedOption("");
    setAnswerState(null);
    setAnswerExplanation("");
    setAnswerError("");
    setShowHint(false);
  }

  function chooseDifficulty(difficulty: DifficultyFilter) {
    setDifficultyFilter(difficulty);
    const nextChallenge = allChallenges.find((challenge) =>
      (trackFilter === "All" || challenge.track === trackFilter)
        && (difficulty === "All" || challenge.difficulty === difficulty)
    );
    if (nextChallenge) setSelectedId(nextChallenge.id);
    setSelectedOption("");
    setAnswerState(null);
    setAnswerExplanation("");
    setAnswerError("");
    setShowHint(false);
  }

  async function submitAnswer() {
    if (!selectedOption) return;
    const checkedChallengeId = selectedChallenge.id;
    setIsChecking(true);
    setAnswerError("");
    try {
      if (selectedChallenge.generated && selectedChallenge.answerId) {
        const correct = selectedOption === selectedChallenge.answerId;
        setAttemptHistory((current) => {
          const previous = current[checkedChallengeId] ?? { attempts: 0, correct: 0 };
          return { ...current, [checkedChallengeId]: { attempts: previous.attempts + 1, correct: previous.correct + (correct ? 1 : 0) } };
        });
        setAnswerState(correct ? "correct" : "incorrect");
        setAnswerExplanation(correct ? selectedChallenge.explanation ?? "Correct. Review the reasoning and keep going." : "");
        if (correct) setBrowserSolvedIds((current) => current.includes(checkedChallengeId) ? current : [...current, checkedChallengeId]);
        return;
      }

      const response = await fetch("/api/logic-data/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: checkedChallengeId, optionId: selectedOption }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Could not check your answer. Please try again.");
      }

      if (payload.data.authenticated) {
        setIsAuthenticated(true);
        setAccountSolvedIds(payload.data.solvedIds);
        setAccountStats(payload.data.stats);
      }

      setAttemptHistory((current) => {
        const previous = current[checkedChallengeId] ?? { attempts: 0, correct: 0 };
        return {
          ...current,
          [checkedChallengeId]: {
            attempts: previous.attempts + 1,
            correct: previous.correct + (payload.data.correct ? 1 : 0),
          },
        };
      });

      if (selectedId === checkedChallengeId) {
        setAnswerState(payload.data.correct ? "correct" : "incorrect");
        setAnswerExplanation(payload.data.explanation ?? "");
        if (payload.data.correct && !payload.data.authenticated) {
          setBrowserSolvedIds((current) => current.includes(checkedChallengeId) ? current : [...current, checkedChallengeId]);
        }
      }
    } catch (error) {
      setAnswerError(error instanceof Error ? error.message : "Could not check your answer. Please try again.");
    } finally {
      setIsChecking(false);
    }
  }

  function nextChallenge() {
    if (!filteredChallenges.length) return;
    const currentIndex = filteredChallenges.findIndex((challenge) => challenge.id === selectedChallenge.id);
    const next = filteredChallenges[(currentIndex + 1) % filteredChallenges.length];
    chooseChallenge(next.id);
  }

  const solvedCount = solvedIds.length;
  const progress = Math.round((solvedCount / allChallenges.length) * 100);
  const selectedSolved = solvedIds.includes(selectedChallenge.id);
  const browserOnlySolvedCount = browserSolvedIds.filter((id) => !accountSolvedIds.includes(id)).length;

  return (
    <div className="container-page max-w-[1240px] pb-16 pt-10 sm:pb-20 sm:pt-14">
      <section className="relative overflow-hidden rounded-[28px] border border-accent/20 bg-gradient-to-br from-accent-soft via-surface to-cyan-500/10 p-6 shadow-card sm:p-9 lg:p-11">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-accent/15 blur-[80px]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-surface/75 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent">
              <Sparkles className="h-3.5 w-3.5" /> Big-tech reasoning lab
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.055em] text-text sm:text-5xl">Logic &amp; Data</h1>
            <p className="mt-3 max-w-[58ch] text-sm leading-7 text-muted sm:text-base">
              Build the thinking behind high-stakes product and AI decisions. Read the data, do the maths, test assumptions, and explain your call.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge tone="accent">Product analytics</Badge>
              <Badge>Experiments &amp; AI metrics</Badge>
              <Badge>Systems math · Easy to advanced</Badge>
            </div>
            <p className="mt-3 max-w-[65ch] text-xs leading-5 text-muted">Interview-style practice inspired by broad skills across Microsoft, Google, OpenAI, and NVIDIA roles. Every prompt is an original TeamForge scenario.</p>
          </div>

          <Card className="border-white/60 bg-surface/75 p-5 backdrop-blur dark:border-white/10 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-muted">Your practice progress</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-text">{solvedCount}<span className="text-base font-medium text-muted"> / {allChallenges.length}</span></p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Target className="h-5 w-5" /></span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-hover">
              <div className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-500 transition-[width] duration-500" style={{ width: `${progress}%` }} />
            </div>
            {isAuthenticated ? (
              <div className="mt-2 text-xs leading-5 text-muted">
                <p>Account sync · {accountStats?.currentStreak ?? 0} day streak · best {accountStats?.bestStreak ?? 0}</p>
                {browserOnlySolvedCount > 0 && <p>{browserOnlySolvedCount} earlier browser solve{browserOnlySolvedCount === 1 ? "" : "s"} stay on this device; solve them again while signed in to add them to your profile.</p>}
              </div>
            ) : (
              <p className="mt-2 text-xs leading-5 text-muted">
                Saved in this browser. <Link href="/signin?callbackUrl=%2Flogic-data" className="font-medium text-accent hover:underline">Sign in to sync across devices</Link>.
              </p>
            )}
          </Card>
        </div>
      </section>

      {practiceCoach && (
        <Card className="mt-5 overflow-hidden border-accent/20 bg-gradient-to-r from-accent-soft/55 via-surface to-surface p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><Sparkles className="h-4 w-4" /></span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-text">Practice coach</h2>
                </div>
                <p className="mt-1 text-sm font-medium text-text">Focus next: {practiceCoach.track} · {practiceCoach.challenge.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{practiceCoach.reason} Recommendations use answers saved in this browser.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setTrackFilter(practiceCoach.track);
                setDifficultyFilter("All");
                chooseChallenge(practiceCoach.challenge.id);
                requestAnimationFrame(() => document.getElementById("active-challenge-title")?.scrollIntoView({ behavior: "smooth", block: "start" }));
              }}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
            >
              Try this prompt <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </Card>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {([
          { name: "Data", count: allChallenges.filter((challenge) => challenge.track === "Data").length, icon: BarChart3, text: "Read patterns and spot misleading totals" },
          { name: "Math", count: allChallenges.filter((challenge) => challenge.track === "Math").length, icon: Calculator, text: "Use probability and expected value" },
          { name: "Logic", count: allChallenges.filter((challenge) => challenge.track === "Logic").length, icon: Brain, text: "Trace rules and check assumptions" },
        ]).map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => chooseTrack(trackFilter === item.name ? "All" : item.name as LogicDataTrack)}
            aria-pressed={trackFilter === item.name}
            className={`group rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-raised ${trackFilter === item.name ? "border-accent/35 bg-accent-soft/50" : "border-border bg-surface"}`}
          >
            <span className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent"><item.icon className="h-4 w-4" /></span>
              <span className="font-mono text-xs text-muted">{item.count} prompts</span>
            </span>
            <span className="mt-3 block text-sm font-semibold text-text">{item.name}</span>
            <span className="mt-1 block text-xs leading-5 text-muted">{item.text}</span>
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(280px,0.78fr)_minmax(0,1.22fr)] lg:items-start">
        <section aria-labelledby="challenge-list-title">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Choose a prompt</p>
              <h2 id="challenge-list-title" className="mt-1 text-xl font-semibold tracking-tight text-text">Adaptive question bank</h2>
              <p className="mt-1 max-w-sm text-xs leading-5 text-muted">New questions are added as you scroll. The on-device AI Coach can help with every prompt.</p>
            </div>
            <span className="text-xs text-muted">{filteredChallenges.length} ready</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Filter by track">
            {tracks.map((track) => (
              <button key={track} type="button" onClick={() => chooseTrack(track)} aria-pressed={trackFilter === track}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${trackFilter === track ? "bg-accent text-on-accent" : "border border-border bg-surface text-muted hover:text-text"}`}>
                {track}
              </button>
            ))}
          </div>
          <label className="mt-3 flex h-10 items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 text-xs text-muted">
            Difficulty
            <select aria-label="Filter by difficulty" value={difficultyFilter} onChange={(event) => chooseDifficulty(event.target.value as DifficultyFilter)} className="max-w-[150px] bg-transparent text-right font-medium text-text outline-none">
              {difficulties.map((difficulty) => <option key={difficulty} value={difficulty}>{difficulty === "All" ? "All levels" : difficulty}</option>)}
            </select>
          </label>

          <div className="mt-4 space-y-2">
            {filteredChallenges.map((challenge, index) => {
              const isSelected = challenge.id === selectedChallenge.id;
              const isSolved = solvedIds.includes(challenge.id);
              return (
                <button key={challenge.id} type="button" onClick={() => chooseChallenge(challenge.id)} aria-pressed={isSelected}
                  className={`w-full rounded-xl border p-3.5 text-left transition-all hover:border-accent/30 ${isSelected ? "border-accent/35 bg-accent-soft/45 shadow-card" : "border-border bg-surface hover:bg-surface-hover"}`}>
                  <span className="flex items-start gap-3">
                    <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold ${isSolved ? "bg-success/10 text-success" : "bg-surface-hover text-muted"}`}>
                      {isSolved ? <Check className="h-3.5 w-3.5" /> : String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5"><span className="text-sm font-semibold leading-5 text-text">{challenge.title}</span>{challenge.generated && <span className="rounded-full bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-300">Fresh</span>}</span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted"><TrackIcon track={challenge.track} className="h-3 w-3" />{challenge.track}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${difficultyTone[challenge.difficulty]}`}>{challenge.difficulty}</span>
                        {challenge.focus && <span className="text-[10px] text-muted">{challenge.focus}</span>}
                        {isSolved && <span className="text-[10px] font-medium text-success">Solved</span>}
                      </span>
                    </span>
                    <span className="pt-1 text-muted"><ArrowRight className="h-3.5 w-3.5" /></span>
                  </span>
                </button>
              );
            })}
            {!filteredChallenges.length && <Card className="p-5 text-sm text-muted">No prompts match these filters.</Card>}
          </div>
          <div ref={loadMoreRef} className="mt-3 flex min-h-12 items-center justify-center" aria-live="polite">
            {isGeneratingMore ? (
              <span className="inline-flex items-center gap-2 text-xs text-muted"><Sparkles className="h-4 w-4 animate-pulse text-accent" /> Building your next verified question set…</span>
            ) : generationError ? (
              <button type="button" onClick={generateMoreQuestions} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text hover:bg-surface-hover">Try generating again</button>
            ) : (
              <button type="button" onClick={generateMoreQuestions} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted transition-colors hover:border-accent/40 hover:text-accent"><Sparkles className="h-3.5 w-3.5" /> Generate 12 more</button>
            )}
          </div>
        </section>

        <section aria-labelledby="active-challenge-title" className="min-w-0">
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-surface-hover/40 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent"><TrackIcon track={selectedChallenge.track} className="mr-1.5 h-3 w-3" />{selectedChallenge.track}</Badge>
                <span className={`rounded-sm border px-2 py-0.5 text-xs font-medium ${difficultyTone[selectedChallenge.difficulty]}`}>{selectedChallenge.difficulty}</span>
                {selectedChallenge.focus && <span className="rounded-full bg-surface px-2 py-1 text-[10px] font-medium text-muted">{selectedChallenge.focus}</span>}
                <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted">{selectedChallenge.minutes} min</span>
              </div>
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">Reason it out</p>
              <h2 id="active-challenge-title" className="mt-1 text-2xl font-semibold tracking-tight text-text">{selectedChallenge.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{selectedChallenge.prompt}</p>
            </div>

            <div className="p-5 sm:p-6">
              {selectedChallenge.table && (
                <div className="mb-5 overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-[280px] border-collapse text-left text-xs">
                    <thead className="bg-surface-hover/70 text-muted">
                      <tr>{selectedChallenge.table.headers.map((header) => <th key={header} scope="col" className="px-3 py-2.5 font-semibold">{header}</th>)}</tr>
                    </thead>
                    <tbody>
                      {selectedChallenge.table.rows.map((row, rowIndex) => (
                        <tr key={`${selectedChallenge.id}-${rowIndex}`} className="border-t border-border">
                          {row.map((cell, cellIndex) => <td key={`${selectedChallenge.id}-${rowIndex}-${cellIndex}`} className="px-3 py-2.5 text-text">{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <fieldset>
                <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Choose the best answer</legend>
                <div className="space-y-2">
                  {selectedChallenge.options.map((option) => {
                    const selected = selectedOption === option.id;
                    const isCorrectOption = answerState === "correct" && option.id === selectedOption;
                    return (
                    <button key={option.id} type="button" disabled={isChecking} onClick={() => { setSelectedOption(option.id); setAnswerState(null); setAnswerExplanation(""); setAnswerError(""); }}
                        aria-pressed={selected}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm leading-6 transition-colors disabled:cursor-wait ${isCorrectOption ? "border-success/35 bg-success/5" : selected ? "border-accent/40 bg-accent-soft/50" : "border-border bg-bg hover:bg-surface-hover"}`}>
                        <span className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? "border-accent bg-accent" : "border-border-strong"}`}>
                          {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                        <span className="flex-1 text-text">{option.label}</span>
                        {isCorrectOption && <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-success" />}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {showHint && (
                <div className="mt-4 flex gap-2.5 rounded-lg border border-warning/20 bg-warning/5 p-3.5 text-sm leading-6 text-text">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <p>{selectedChallenge.hint}</p>
                </div>
              )}

              {answerState && (
                <div aria-live="polite" className={`mt-4 rounded-xl border p-4 ${answerState === "correct" ? "border-success/25 bg-success/5" : "border-warning/25 bg-warning/5"}`}>
                  <p className={`flex items-center gap-2 text-sm font-semibold ${answerState === "correct" ? "text-success" : "text-warning"}`}>
                    {answerState === "correct" ? <CheckCircle2 className="h-4 w-4" /> : <CircleHelp className="h-4 w-4" />}
                    {answerState === "correct" ? "That’s right" : "Not quite—try once more"}
                  </p>
                  {answerState === "correct" && <p className="mt-2 text-sm leading-6 text-text">{answerExplanation}</p>}
                </div>
              )}

              {answerError && <p role="alert" className="mt-4 rounded-lg border border-rose-500/25 bg-rose-500/5 px-3.5 py-3 text-sm text-rose-600 dark:text-rose-400">{answerError}</p>}

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <button type="button" onClick={submitAnswer} disabled={!selectedOption || isChecking}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50">
                  {isChecking ? "Checking…" : "Check answer"} <Check className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setShowHint((value) => !value)}
                  aria-expanded={showHint}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3.5 text-sm font-medium text-text transition-colors hover:bg-surface-hover">
                  <Lightbulb className="h-4 w-4 text-warning" /> {showHint ? "Hide hint" : "Get a hint"}
                </button>
                {answerState === "correct" && (
                  <button type="button" onClick={nextChallenge} className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-accent hover:bg-accent-soft">
                    Next prompt <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {selectedSolved && !answerState && <p className="mt-4 flex items-center gap-2 text-xs text-success"><CheckCircle2 className="h-4 w-4" />You have solved this prompt before. Try it again to review the reasoning.</p>}
            </div>
          </Card>

          <LocalAICoach
            mode="logic-data"
            contextKey={selectedChallenge.id}
            context={[
              `Challenge: ${selectedChallenge.title}`,
              `Track: ${selectedChallenge.track}`,
              `Difficulty: ${selectedChallenge.difficulty}`,
              `Prompt: ${selectedChallenge.prompt}`,
              selectedChallenge.table ? `Data table: ${selectedChallenge.table.headers.join(" | ")}\n${selectedChallenge.table.rows.map((row) => row.join(" | ")).join("\n")}` : "",
              `Options: ${selectedChallenge.options.map((option) => option.label).join(" | ")}`,
            ].filter(Boolean).join("\n")}
          />

          <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-surface/70 p-3.5 text-xs leading-5 text-muted">
            <RotateCcw className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Company-inspired skill practice uses original TeamForge prompts. Generated questions are checked locally; signed-in progress syncs for the official set, while new generated-question progress stays in this browser.
          </div>
        </section>
      </div>

    </div>
  );
}

