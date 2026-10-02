"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Sparkles, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, SkillBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormError, Input, Label, Textarea } from "@/components/ui/Input";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Select } from "@/components/ui/Select";
import { EXPERIENCE_LEVELS, PROJECT_TYPES, ROLES, SUGGESTED_SKILLS } from "@/lib/constants";

type FormState = {
  projectName: string;
  description: string;
  requiredSkills: string[];
  requiredRoles: string[];
  teamSize: string;
  experienceLevel: string;
  availability: string;
  projectType: string;
};

type Match = {
  userId: string;
  profile: {
    name: string;
    username: string;
    avatar?: string;
    headline?: string;
    skills: string[];
    preferredRoles: string[];
    experienceLevel?: string;
    availability?: string;
  };
  score: number;
  skillScore: number | null;
  roleScore: number;
  projectScore: number;
  experienceScore: number | null;
  availabilityScore: number | null;
  matchedSkills: string[];
  missingSkills: string[];
  matchedRoles: string[];
  recommendedRole?: string;
  relevantProjects: Array<{ title: string; projectType?: string; score: number }>;
  reason: string;
  invitationStatus?: "pending";
};

type MatchResponse = {
  requirements: { skills: string[]; roles: string[] };
  team: { id: string; name: string; projectTitle: string; slug: string; teamSize: number; remainingSlots: number };
  matches: Match[];
  resultLimit: number;
  matchingConfig: { weights: { skill: number; role: number; project: number; experience: number; availability: number } };
};

const emptyForm: FormState = {
  projectName: "",
  description: "",
  requiredSkills: [],
  requiredRoles: [],
  teamSize: "4",
  experienceLevel: "",
  availability: "",
  projectType: "",
};

function ScoreMetric({ label, value, weight }: { label: string; value: number | null; weight: number }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted">{label} <span className="text-[10px]">· {Math.round(weight * 100)}% weight</span></span>
        <span className="font-medium text-text">{value === null ? "No profile data" : `${value}%`}</span>
      </div>
      {value !== null && (
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-hover" aria-hidden="true">
          <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
        </div>
      )}
    </div>
  );
}

function MatchCard({
  match,
  team,
  weights,
  remainingSlots,
  onInvitationSent,
}: {
  match: Match;
  team: MatchResponse["team"];
  weights: MatchResponse["matchingConfig"]["weights"];
  remainingSlots: number;
  onInvitationSent: () => void;
}) {
  const [invited, setInvited] = useState(match.invitationStatus === "pending");
  const [sending, setSending] = useState(false);

  const invite = async () => {
    setSending(true);
    try {
      const response = await fetch(`/api/teams/${team.id}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteeId: match.userId,
          role: match.recommendedRole,
          message: match.reason,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not send team invitation");
      setInvited(true);
      onInvitationSent();
      toast.success(`Invitation sent to ${match.profile.name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send team invitation");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={match.profile.name} src={match.profile.avatar} size="lg" />
            <div className="min-w-0">
              <Link href={`/developers/${match.profile.username}`} className="font-semibold text-text hover:text-accent hover:underline">
                {match.profile.name}
              </Link>
              <p className="mt-0.5 truncate text-sm text-muted">{match.profile.headline || match.recommendedRole || match.profile.preferredRoles[0] || "TeamForge member"}</p>
              {match.profile.experienceLevel && <p className="mt-1 text-xs text-muted">{match.profile.experienceLevel} experience</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-accent-soft px-3 py-2 text-accent">
            <Sparkles className="h-4 w-4" />
            <span className="text-lg font-bold tabular-nums">{match.score}%</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide">match</span>
          </div>
        </div>
          {match.recommendedRole && <p className="mt-1 text-xs text-muted">Role fit: {match.recommendedRole}</p>}
          {!match.recommendedRole && match.profile.preferredRoles[0] && <p className="mt-1 text-xs text-muted">Preferred role: {match.profile.preferredRoles[0]}</p>}
          <p className="mt-4 text-sm leading-relaxed text-muted">{match.reason}</p>
      </CardHeader>

      <CardBody>
        <div className="grid gap-x-6 gap-y-4 border-t border-border py-4 sm:grid-cols-2">
          <ScoreMetric label="Skill match" value={match.skillScore} weight={weights.skill} />
          <ScoreMetric label="Role match" value={match.roleScore} weight={weights.role} />
          <ScoreMetric label="Project relevance" value={match.projectScore} weight={weights.project} />
          <ScoreMetric label="Experience" value={match.experienceScore} weight={weights.experience} />
          <ScoreMetric label="Availability" value={match.availabilityScore} weight={weights.availability} />
        </div>
        <p className="border-t border-border pb-3 pt-2 text-[11px] text-muted">The final score renormalizes the configured weights when a profile field is unavailable.</p>

        {match.profile.skills.length > 0 && (
          <section className="border-t border-border py-4">
            <h3 className="text-xs font-medium text-muted">Skills</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {match.profile.skills.slice(0, 8).map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>)}
            </div>
          </section>
        )}

        {match.matchedSkills.length > 0 && (
          <section className="border-t border-border py-4">
            <h3 className="text-xs font-medium text-muted">Matched skills · {match.matchedSkills.length}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {match.matchedSkills.map((skill) => <Badge key={skill} tone="success"><Check className="mr-1 h-3 w-3" />{skill}</Badge>)}
            </div>
          </section>
        )}

        {match.missingSkills.length > 0 && (
          <section className="border-t border-border py-4">
            <h3 className="text-xs font-medium text-muted">Skills not listed on this profile</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {match.missingSkills.map((skill) => <Badge key={skill} tone="neutral"><X className="mr-1 h-3 w-3" />{skill}</Badge>)}
            </div>
          </section>
        )}

        {match.relevantProjects.length > 0 && (
          <section className="border-t border-border py-4">
            <h3 className="text-xs font-medium text-muted">Relevant public TeamForge projects</h3>
            <ul className="mt-2 space-y-1.5">
              {match.relevantProjects.map((project) => (
                <li key={`${project.title}-${project.projectType ?? ""}`} className="flex flex-wrap items-center justify-between gap-2 text-sm text-text">
                  <span>{project.title}{project.projectType ? <span className="ml-2 text-xs text-muted">{project.projectType}</span> : null}</span>
                  <span className="text-xs text-muted">{project.score}% overlap</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Link href={`/developers/${match.profile.username}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-[13px] font-medium text-text hover:bg-surface-hover">
            View profile <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Button size="sm" disabled={invited || remainingSlots === 0} loading={sending} onClick={invite}>
            {invited ? <><Check className="h-3.5 w-3.5" /> Invitation sent</> : remainingSlots === 0 ? "Team full" : <><Users className="h-3.5 w-3.5" /> Invite to team</>}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

export function TeamForgeMatchClient({ initialTeamId }: { initialTeamId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(Boolean(initialTeamId));
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [remainingSlots, setRemainingSlots] = useState(0);
  const [loadError, setLoadError] = useState("");

  const reloadTeamMatches = useCallback(async () => {
    if (!initialTeamId) return;
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(`/api/team-match?teamId=${encodeURIComponent(initialTeamId)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not load matches for this team");
      setResult(data.data);
      setRemainingSlots(data.data.team.remainingSlots);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load matches for this team");
    } finally {
      setLoading(false);
    }
  }, [initialTeamId]);

  useEffect(() => {
    if (initialTeamId) reloadTeamMatches();
  }, [initialTeamId, reloadTeamMatches]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    if (form.requiredRoles.length === 0) {
      setErrors({ requiredRoles: "Select at least one role" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/team-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.details) {
          setErrors(Object.fromEntries(Object.entries(data.details).map(([key, value]) => [key, (value as string[])[0]])));
        } else {
          toast.error(data.error ?? "Could not find teammates");
        }
        return;
      }
      setResult(data.data);
      setRemainingSlots(data.data.team.remainingSlots);
      router.replace(`/team-match?teamId=${encodeURIComponent(data.data.team.id)}`);
      toast.success("Private team created and matches are ready");
    } catch {
      toast.error("Could not find teammates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialTeamId && loading && !result) {
    return <p className="rounded-lg border border-border bg-surface p-5 text-sm text-muted">Finding teammates for this team…</p>;
  }

  if (initialTeamId && loadError && !result) {
    return (
      <div className="rounded-lg border border-border bg-surface p-5">
        <p className="text-sm text-text">{loadError}</p>
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={reloadTeamMatches}>Try again</Button>
          <Link href="/my-teams" className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-[13px] font-medium text-text hover:bg-surface-hover">My teams</Link>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-border bg-surface p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Private team created</p>
            <h2 className="mt-1 text-xl font-semibold text-text">{result.team.projectTitle}</h2>
            <p className="mt-1 text-sm text-muted">{result.matches.length} match{result.matches.length === 1 ? "" : "es"} · {remainingSlots} invite spot{remainingSlots === 1 ? "" : "s"} left</p>
            {result.requirements.skills.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{result.requirements.skills.map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>)}</div>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/teams/${result.team.slug}`} className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-[13px] font-medium text-text hover:bg-surface-hover">View private team</Link>
            <Button variant="secondary" size="sm" onClick={() => { setResult(null); setForm(emptyForm); setRemainingSlots(0); router.replace("/team-match"); }}>
              Find another team
            </Button>
          </div>
        </div>

        {result.matches.length === 0 ? (
          <EmptyState icon={Users} title="No matching profiles yet" description="Try another role or skill in a new match, or browse developers to find someone manually." action={<Link href="/discover" className="inline-flex h-9 items-center rounded-md border border-border px-3 text-[13px] font-medium text-text hover:bg-surface-hover">Browse developers</Link>} />
        ) : (
          <div className="space-y-4">
            {result.matches.map((match) => (
              <MatchCard
                key={match.userId}
                match={match}
                team={result.team}
                weights={result.matchingConfig.weights}
                remainingSlots={remainingSlots}
                onInvitationSent={() => setRemainingSlots((count) => Math.max(0, count - 1))}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 rounded-lg border border-accent/20 bg-accent-soft/50 p-4 text-sm leading-relaxed text-text">
        Finding matches creates a private, forming team from these requirements. You can invite matched developers and manage their replies in Requests.
      </div>
      <form onSubmit={submit} className="max-w-[720px] space-y-5">
        <div>
          <Label htmlFor="projectName">Project name</Label>
          <Input id="projectName" maxLength={80} value={form.projectName} onChange={(event) => update("projectName", event.target.value)} required />
          <FormError>{errors.projectName}</FormError>
        </div>

        <div>
          <Label htmlFor="projectDescription">Project description</Label>
          <Textarea id="projectDescription" rows={4} maxLength={2000} value={form.description} onChange={(event) => update("description", event.target.value)} required />
          <FormError>{errors.description}</FormError>
          <p className="mt-1 text-xs text-muted">Known skill names and aliases in the description are added to the requirements automatically.</p>
        </div>

        <div>
          <Label>Required skills</Label>
          <MultiSelect value={form.requiredSkills} onChange={(skills) => update("requiredSkills", skills)} suggestions={SUGGESTED_SKILLS} max={30} />
          <FormError>{errors.requiredSkills}</FormError>
        </div>

        <div>
          <Label>Required roles</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ROLES.filter((role) => role !== "Other").map((role) => {
              const selected = form.requiredRoles.includes(role);
              return <button type="button" key={role} aria-pressed={selected} onClick={() => update("requiredRoles", selected ? form.requiredRoles.filter((item) => item !== role) : [...form.requiredRoles, role])} className={`min-h-10 rounded-md border px-3 py-2 text-left text-[13px] transition-colors ${selected ? "border-accent bg-accent-soft text-accent" : "border-border text-text hover:bg-surface-hover"}`}>{role}</button>;
            })}
          </div>
          <FormError>{errors.requiredRoles}</FormError>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="teamSize">Team size, including you</Label>
            <Input id="teamSize" type="number" min={2} max={50} value={form.teamSize} onChange={(event) => update("teamSize", event.target.value)} />
            <FormError>{errors.teamSize}</FormError>
          </div>
          <div>
            <Label htmlFor="projectType">Hackathon / project type <span className="font-normal text-muted">(optional)</span></Label>
            <Select id="projectType" value={form.projectType} onChange={(event) => update("projectType", event.target.value)}>
              <option value="">No preference</option>
              {PROJECT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="experienceLevel">Minimum experience <span className="font-normal text-muted">(optional)</span></Label>
            <Select id="experienceLevel" value={form.experienceLevel} onChange={(event) => update("experienceLevel", event.target.value)}>
              <option value="">Any experience</option>
              {EXPERIENCE_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="availability">Minimum availability <span className="font-normal text-muted">(optional)</span></Label>
            <Select id="availability" value={form.availability} onChange={(event) => update("availability", event.target.value)}>
              <option value="">Any availability</option>
              <option value="Available">Available</option>
              <option value="Limited">Limited</option>
            </Select>
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <Button type="submit" loading={loading}><Sparkles className="h-4 w-4" /> Create private team & find matches</Button>
        </div>
      </form>
    </div>
  );
}
