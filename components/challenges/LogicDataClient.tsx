"use client";

import { useEffect, useMemo, useState } from "react";
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
import type { LogicDataChallenge, LogicDataDifficulty, LogicDataTrack } from "@/lib/logicDataChallenges";

type TrackFilter = "All" | LogicDataTrack;
type DifficultyFilter = "All" | LogicDataDifficulty;
type AnswerState = "correct" | "incorrect" | null;
type PublicChallenge = Omit<LogicDataChallenge, "answerId" | "explanation">;
type AccountStats = {
  solvedCount: number;
  totalAttempts: number;
  correctAttempts: number;
  currentStreak: number;
  bestStreak: number;
};

const progressKey = "teamforge-logic-data-solved-v1";
const tracks: TrackFilter[] = ["All", "Data", "Math", "Logic"];
const difficulties: DifficultyFilter[] = ["All", "Easy", "Medium", "Hard", "Advanced"];

const difficultyTone: Record<LogicDataDifficulty, string> = {
  Easy: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Medium: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Hard: "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  Advanced: "border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

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
  const [accountSolvedIds, setAccountSolvedIds] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accountStats, setAccountStats] = useState<AccountStats | null>(null);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const solvedIds = isAuthenticated
    ? [...new Set([...accountSolvedIds, ...browserSolvedIds])]
    : browserSolvedIds;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(progressKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validIds = parsed.filter((id): id is string =>
            typeof id === "string" && challenges.some((challenge) => challenge.id === id)
          );
          setBrowserSolvedIds([...new Set(validIds)]);
        }
      }
    } catch {
      // Keep the section usable if browser storage is unavailable.
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

  const filteredChallenges = useMemo(() => challenges.filter((challenge) =>
    (trackFilter === "All" || challenge.track === trackFilter)
      && (difficultyFilter === "All" || challenge.difficulty === difficultyFilter)
  ), [challenges, difficultyFilter, trackFilter]);

  const selectedChallenge = filteredChallenges.find((challenge) => challenge.id === selectedId)
    ?? filteredChallenges[0]
    ?? challenges[0];

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
    const nextChallenge = challenges.find((challenge) =>
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
    const nextChallenge = challenges.find((challenge) =>
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
  const progress = Math.round((solvedCount / challenges.length) * 100);
  const selectedSolved = solvedIds.includes(selectedChallenge.id);
  const browserOnlySolvedCount = browserSolvedIds.filter((id) => !accountSolvedIds.includes(id)).length;

  return (
    <div className="container-page max-w-[1240px] pb-16 pt-10 sm:pb-20 sm:pt-14">
      <section className="relative overflow-hidden rounded-[28px] border border-accent/20 bg-gradient-to-br from-accent-soft via-surface to-cyan-500/10 p-6 shadow-card sm:p-9 lg:p-11">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-accent/15 blur-[80px]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-surface/75 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent">
              <Sparkles className="h-3.5 w-3.5" /> Reason with evidence
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.055em] text-text sm:text-5xl">Logic &amp; Data</h1>
            <p className="mt-3 max-w-[58ch] text-sm leading-7 text-muted sm:text-base">
              Practice the thinking behind good decisions. Read the data, do the maths, question the assumption, and choose what to do next.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge tone="accent">No code required</Badge>
              <Badge>Original TeamForge prompts</Badge>
              <Badge>Easy to advanced</Badge>
            </div>
          </div>

          <Card className="border-white/60 bg-surface/75 p-5 backdrop-blur dark:border-white/10 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-muted">Your practice progress</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-text">{solvedCount}<span className="text-base font-medium text-muted"> / {challenges.length}</span></p>
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

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {([
          { name: "Data", count: challenges.filter((challenge) => challenge.track === "Data").length, icon: BarChart3, text: "Read patterns and spot misleading totals" },
          { name: "Math", count: challenges.filter((challenge) => challenge.track === "Math").length, icon: Calculator, text: "Use probability and expected value" },
          { name: "Logic", count: challenges.filter((challenge) => challenge.track === "Logic").length, icon: Brain, text: "Trace rules and check assumptions" },
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
              <h2 id="challenge-list-title" className="mt-1 text-xl font-semibold tracking-tight text-text">Practice set</h2>
            </div>
            <span className="text-xs text-muted">{filteredChallenges.length} available</span>
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
                      <span className="block text-sm font-semibold leading-5 text-text">{challenge.title}</span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted"><TrackIcon track={challenge.track} className="h-3 w-3" />{challenge.track}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${difficultyTone[challenge.difficulty]}`}>{challenge.difficulty}</span>
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
        </section>

        <section aria-labelledby="active-challenge-title" className="min-w-0">
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-surface-hover/40 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent"><TrackIcon track={selectedChallenge.track} className="mr-1.5 h-3 w-3" />{selectedChallenge.track}</Badge>
                <span className={`rounded-sm border px-2 py-0.5 text-xs font-medium ${difficultyTone[selectedChallenge.difficulty]}`}>{selectedChallenge.difficulty}</span>
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

          <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-surface/70 p-3.5 text-xs leading-5 text-muted">
            <RotateCcw className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            These are original practice prompts, not verified questions from any specific company. Signed-in progress syncs to your account; guest progress stays in this browser.
          </div>
        </section>
      </div>
    </div>
  );
}
