"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, CheckCircle2, Code2, ExternalLink, Github, Trophy, Users } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, SkillBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input, Label, Textarea } from "@/components/ui/Input";

type Challenge = {
  key: string;
  title: string;
  summary: string;
  brief: string;
  skills: string[];
  startsAt: string;
  endsAt: string;
};

type Submission = {
  id: string;
  projectName: string;
  summary: string;
  repositoryUrl: string;
  demoUrl: string;
  updatedAt: string;
  isMine: boolean;
  user: { name: string; username: string; avatar?: string } | null;
};

type ChallengeResponse = {
  challenge: Challenge;
  submissions: Submission[];
  mySubmission: Submission | null;
  isAuthenticated: boolean;
};

type SubmissionForm = {
  projectName: string;
  summary: string;
  repositoryUrl: string;
  demoUrl: string;
};

const emptyForm: SubmissionForm = {
  projectName: "",
  summary: "",
  repositoryUrl: "",
  demoUrl: "",
};

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(undefined, options).format(new Date(value));
}

export function WeeklyChallengeClient() {
  const [data, setData] = useState<ChallengeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<SubmissionForm>(emptyForm);

  const loadChallenge = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setLoadError(false);

    try {
      const response = await fetch("/api/challenges", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load this week's challenge");
      const json = await response.json();
      const challengeData = json.data as ChallengeResponse;
      setData(challengeData);
      setForm(
        challengeData.mySubmission
          ? {
              projectName: challengeData.mySubmission.projectName,
              summary: challengeData.mySubmission.summary,
              repositoryUrl: challengeData.mySubmission.repositoryUrl,
              demoUrl: challengeData.mySubmission.demoUrl,
            }
          : emptyForm
      );
    } catch {
      setLoadError(true);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChallenge();
  }, [loadChallenge]);

  const updateField = (field: keyof SubmissionForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;

    setSaving(true);
    setFormError("");
    try {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, challengeKey: data.challenge.key }),
      });
      const json = await response.json();
      if (!response.ok) {
        const fieldError = json.details
          ? Object.values(json.details as Record<string, string[]>).flat()[0]
          : undefined;
        throw new Error(fieldError ?? json.error ?? "Could not submit your build");
      }

      toast.success("Your build is on this week's challenge board.");
      await loadChallenge(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not submit your build. Try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="container-page max-w-5xl py-10 sm:py-14">
        <div className="h-4 w-36 animate-pulse rounded bg-surface-hover" />
        <div className="mt-3 h-10 w-72 animate-pulse rounded bg-surface-hover" />
        <div className="mt-8 h-64 animate-pulse rounded-xl border border-border bg-surface" />
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="container-page max-w-5xl py-10 sm:py-14">
        <ErrorState onRetry={() => void loadChallenge()} />
      </div>
    );
  }

  const { challenge, submissions, mySubmission, isAuthenticated } = data;

  return (
    <div className="container-page max-w-5xl py-10 sm:py-14">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Build together, every week</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text sm:text-4xl">Weekly Build Challenge</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          A small prompt, one week, and a place to share what you made. Build solo or find teammates on TeamForge.
        </p>
      </header>

      <Card className="mt-8 overflow-hidden">
        <div className="border-b border-border bg-accent-soft/50 px-5 py-4 sm:px-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent"><Trophy className="mr-1.5 h-3.5 w-3.5" /> This week&apos;s prompt</Badge>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(challenge.startsAt, { month: "short", day: "numeric" })} – {formatDate(challenge.endsAt, { month: "short", day: "numeric" })}
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-text sm:text-3xl">{challenge.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{challenge.summary}</p>
        </div>

        <div className="grid gap-6 px-5 py-5 sm:px-7 sm:py-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h3 className="text-sm font-semibold text-text">Your build prompt</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{challenge.brief}</p>
            <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Suggested skills">
              {challenge.skills.map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>)}
            </div>
          </div>
          <Link
            href="/discover"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border-strong px-4 text-sm font-medium text-text transition-colors hover:bg-surface-hover"
          >
            <Users className="h-4 w-4" /> Find teammates
          </Link>
        </div>
      </Card>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.78fr)]">
        <section aria-labelledby="submissions-heading">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 id="submissions-heading" className="text-lg font-semibold text-text">Community builds</h2>
              <p className="mt-1 text-sm text-muted">{submissions.length} build{submissions.length === 1 ? "" : "s"} shared this week</p>
            </div>
            <Code2 className="h-5 w-5 text-accent" aria-hidden="true" />
          </div>

          {submissions.length === 0 ? (
            <Card className="mt-4 flex flex-col items-center px-5 py-10 text-center">
              <Code2 className="h-7 w-7 text-muted" aria-hidden="true" />
              <h3 className="mt-3 text-sm font-semibold text-text">Be the first to share a build</h3>
              <p className="mt-1 max-w-sm text-sm text-muted">A small demo is enough. Add your project link and let the community see what you made.</p>
            </Card>
          ) : (
            <div className="mt-4 space-y-3">
              {submissions.map((submission) => (
                <Card key={submission.id} className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    {submission.user && (
                      <Link href={`/developers/${submission.user.username}`} aria-label={`View ${submission.user.name}'s profile`}>
                        <Avatar name={submission.user.name} src={submission.user.avatar} size="md" />
                      </Link>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="font-semibold text-text">{submission.projectName}</h3>
                        {submission.isMine && <Badge tone="success"><CheckCircle2 className="mr-1 h-3 w-3" />Your build</Badge>}
                      </div>
                      {submission.user && (
                        <p className="mt-0.5 text-xs text-muted">
                          by <Link href={`/developers/${submission.user.username}`} className="hover:text-accent hover:underline">{submission.user.name}</Link>
                          {" · updated "}{formatDate(submission.updatedAt, { month: "short", day: "numeric" })}
                        </p>
                      )}
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted">{submission.summary}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {submission.repositoryUrl && (
                          <a href={submission.repositoryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-text hover:bg-surface-hover">
                            <Github className="h-3.5 w-3.5" /> Source <ExternalLink className="h-3 w-3 text-muted" />
                          </a>
                        )}
                        {submission.demoUrl && (
                          <a href={submission.demoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-text hover:bg-surface-hover">
                            Live demo <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <aside>
          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-accent" />
              <h2 className="text-base font-semibold text-text">{mySubmission ? "Update your build" : "Share your build"}</h2>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {mySubmission ? "You can edit your entry any time this week." : "Made something for this prompt? Add a short description and a repository or demo link."}
            </p>

            {isAuthenticated ? (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <Label htmlFor="challenge-project-name">Project name</Label>
                  <Input id="challenge-project-name" value={form.projectName} onChange={(event) => updateField("projectName", event.target.value)} maxLength={80} required placeholder="e.g. CampusPulse" />
                </div>
                <div>
                  <Label htmlFor="challenge-summary">What did you build?</Label>
                  <Textarea id="challenge-summary" value={form.summary} onChange={(event) => updateField("summary", event.target.value)} maxLength={500} minLength={10} required rows={4} placeholder="Share what it does and what you learned..." />
                  <p className="mt-1 text-right text-[11px] text-muted">{form.summary.length}/500</p>
                </div>
                <div>
                  <Label htmlFor="challenge-repo">GitHub repository <span className="font-normal text-muted">(optional)</span></Label>
                  <Input id="challenge-repo" type="url" inputMode="url" value={form.repositoryUrl} onChange={(event) => updateField("repositoryUrl", event.target.value)} placeholder="https://github.com/you/project" />
                </div>
                <div>
                  <Label htmlFor="challenge-demo">Live demo <span className="font-normal text-muted">(optional)</span></Label>
                  <Input id="challenge-demo" type="url" inputMode="url" value={form.demoUrl} onChange={(event) => updateField("demoUrl", event.target.value)} placeholder="https://your-demo.vercel.app" />
                </div>
                {formError && <p role="alert" className="text-sm text-danger">{formError}</p>}
                <Button type="submit" loading={saving} className="w-full">
                  {mySubmission ? "Update submission" : "Submit build"}
                </Button>
                <p className="text-center text-xs text-muted">Use at least one https link. Entries are public on this page.</p>
              </form>
            ) : (
              <div className="mt-5 rounded-lg border border-border bg-surface-hover/50 p-4">
                <p className="text-sm text-text">Sign in to share a build. Anyone can browse this week&apos;s entries.</p>
                <div className="mt-3 flex gap-2">
                  <Link href="/signin" className="inline-flex h-9 items-center justify-center rounded-md bg-accent px-3 text-sm font-medium text-on-accent hover:bg-accent-hover">Sign in</Link>
                  <Link href="/signup" className="inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-text hover:bg-surface-hover">Create account</Link>
                </div>
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
