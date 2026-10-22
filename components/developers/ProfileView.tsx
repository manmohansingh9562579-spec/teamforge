import Link from "next/link";
import { Github, Linkedin, Globe, MapPin, GraduationCap, Pencil, BriefcaseBusiness, Sparkles, MessageCircle, ArrowUpRight, Code2, Brain, Award, FileText, ExternalLink } from "lucide-react";
import { Types } from "mongoose";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, SkillBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ContactButton } from "@/components/developers/ContactButton";
import type { IUser } from "@/models/User";

type ProfileDisplayUser = Pick<
  IUser,
  | "name"
  | "username"
  | "avatar"
  | "headline"
  | "bio"
  | "location"
  | "college"
  | "graduationYear"
  | "experienceLevel"
  | "availability"
  | "skills"
  | "preferredRoles"
  | "interests"
  | "githubUrl"
  | "linkedinUrl"
  | "portfolioUrl"
  | "achievements"
> & { _id: Types.ObjectId | string };

function safeExternalUrl(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function ProfileView({
  user,
  isOwner = false,
  solvedCount = 0,
  logicSolvedCount = 0,
}: {
  user: ProfileDisplayUser;
  isOwner?: boolean;
  solvedCount?: number;
  logicSolvedCount?: number;
}) {
  const links = [
    { href: safeExternalUrl(user.githubUrl), label: "GitHub", icon: Github },
    { href: safeExternalUrl(user.linkedinUrl), label: "LinkedIn", icon: Linkedin },
    { href: safeExternalUrl(user.portfolioUrl), label: "Portfolio", icon: Globe },
  ].filter((link) => link.href);

  return (
    <div className="container-page max-w-[960px] py-8 sm:py-12">
      <Card className="p-5 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-5 sm:gap-6">
            <Avatar name={user.name} src={user.avatar} size="xxl" className="ring-4 ring-accent-soft" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Developer profile</p>
              <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                {user.name}
              </h1>
              <p className="mt-1 text-sm text-muted">@{user.username}</p>
              {user.headline && (
                <p className="mt-3 max-w-[55ch] text-base leading-relaxed text-text sm:text-lg">
                  {user.headline}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:pt-5">
            {isOwner ? (
              <Link
                href="/profile/edit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface px-4 text-sm font-medium text-text transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                <Pencil className="h-4 w-4" /> Edit profile
              </Link>
            ) : (
              <>
                <ContactButton recipientId={String(user._id)} recipientName={user.name} />
                <Link
                  href={`/messages/${user._id}`}
                  className="inline-flex h-10 min-w-36 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-text transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.98]"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> Message
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-5 text-sm text-muted">
          {user.location && (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" aria-hidden="true" /> {user.location}
            </span>
          )}
          {user.college && (
            <span className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
              {user.college}{user.graduationYear ? ` · ${user.graduationYear}` : ""}
            </span>
          )}
        </div>

        {links.length > 0 && (
          <nav aria-label="External profiles" className="mt-5 flex flex-wrap gap-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-text transition-colors hover:border-border-strong hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                <link.icon className="h-4 w-4 text-muted" aria-hidden="true" /> {link.label}
              </a>
            ))}
          </nav>
        )}
      </Card>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Coder highlights">
        <Card className="flex items-center gap-4 p-5 sm:p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"><Brain className="h-5 w-5" /></div>
          <div>
            <p className="text-xs font-medium text-muted">Logic &amp; Data solved</p>
            <p className="mt-0.5 text-3xl font-semibold tracking-tight text-text">{logicSolvedCount}</p>
          </div>
          <Link href="/logic-data" className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">Practice <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </Card>
        <Card className="flex items-center gap-4 p-5 sm:p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><Code2 className="h-5 w-5" /></div>
          <div>
            <p className="text-xs font-medium text-muted">TeamForge problems solved</p>
            <p className="mt-0.5 text-3xl font-semibold tracking-tight text-text">{solvedCount}</p>
          </div>
          <Link href="/coding" className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">Practice <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </Card>
        <Card className="flex items-center gap-4 p-5 sm:p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500"><Award className="h-5 w-5" /></div>
          <div>
            <p className="text-xs font-medium text-muted">Achievements shared</p>
            <p className="mt-0.5 text-3xl font-semibold tracking-tight text-text">{user.achievements?.length ?? 0}</p>
          </div>
          {isOwner && <Link href="/profile/edit#achievements" className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">Add achievement <ArrowUpRight className="h-3.5 w-3.5" /></Link>}
        </Card>
      </section>

      <div className="mt-5 grid gap-5 md:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-5">
          {user.bio && (
            <Card className="p-5 sm:p-6">
              <h2 className="text-base font-semibold tracking-tight text-text">About</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">{user.bio}</p>
            </Card>
          )}

          <Card id="achievements" className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2"><Award className="h-4 w-4 text-amber-500" /><h2 className="text-base font-semibold tracking-tight text-text">Achievements & credentials</h2></div>
                <p className="mt-1 text-xs text-muted">Awards, certificates, and competition results shared by this developer.</p>
              </div>
              {isOwner && <Link href="/profile/edit#achievements" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"><Pencil className="h-3.5 w-3.5" /> Manage</Link>}
            </div>
            {user.achievements?.length ? (
              <div className="mt-5 space-y-3">
                {user.achievements.map((achievement, index) => {
                  const referenceLink = safeExternalUrl(achievement.link);
                  const documentLink = safeExternalUrl(achievement.documentUrl);
                  return <article key={`${achievement.title}-${index}`} className="rounded-xl border border-border bg-bg p-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500"><Award className="h-4 w-4" /></span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-text">{achievement.title}</h3>
                        {(achievement.issuer || achievement.date) && <p className="mt-1 text-xs text-muted">{[achievement.issuer, achievement.date].filter(Boolean).join(" · ")}</p>}
                        {achievement.description && <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted">{achievement.description}</p>}
                        {(referenceLink || documentLink) && <div className="mt-3 flex flex-wrap gap-2">
                          {referenceLink && <a href={referenceLink} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium text-text hover:bg-surface-hover"><ExternalLink className="h-3.5 w-3.5 text-accent" /> Achievement link</a>}
                          {documentLink && <a href={documentLink} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium text-text hover:bg-surface-hover"><FileText className="h-3.5 w-3.5 text-accent" /> View document</a>}
                        </div>}
                      </div>
                    </div>
                  </article>;
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-border px-4 py-6 text-center">
                <p className="text-sm font-medium text-text">No achievements added yet</p>
                <p className="mt-1 text-xs text-muted">Certificates and project milestones will appear here.</p>
                {isOwner && <Link href="/profile/edit#achievements" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">Add your first achievement <ArrowUpRight className="h-3.5 w-3.5" /></Link>}
              </div>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-semibold tracking-tight text-text">Skills</h2>
            {user.skills.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {user.skills.map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>)}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">No skills added yet.</p>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <BriefcaseBusiness className="h-4 w-4 text-accent" aria-hidden="true" />
              <h2 className="text-base font-semibold tracking-tight text-text">Working preferences</h2>
            </div>
            <div className="mt-4 space-y-4">
              {user.preferredRoles.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Preferred roles</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {user.preferredRoles.map((role) => <Badge key={role} tone="accent">{role}</Badge>)}
                  </div>
                </div>
              )}
              {user.availability && (
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Availability</h3>
                  <Badge className="mt-2" tone={user.availability === "Available" ? "success" : "neutral"}>
                    {user.availability}
                  </Badge>
                </div>
              )}
              {user.experienceLevel && (
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Experience</h3>
                  <Badge className="mt-2">{user.experienceLevel}</Badge>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
              <h2 className="text-base font-semibold tracking-tight text-text">Interests</h2>
            </div>
            {user.interests.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {user.interests.map((interest) => <Badge key={interest}>{interest}</Badge>)}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">No interests added yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
