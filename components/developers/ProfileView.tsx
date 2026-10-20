import Link from "next/link";
import { Github, Linkedin, Globe, MapPin, GraduationCap, Pencil, BriefcaseBusiness, Sparkles, MessageCircle, ArrowUpRight, Code2 } from "lucide-react";
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
> & { _id: Types.ObjectId | string };

type ProfileActivity = {
  id: string;
  type: "build" | "question" | "collaboration";
  content: string;
  projectName: string;
  githubUrl: string;
  demoUrl: string;
  skills: string[];
  createdAt: string;
};

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
  recentPosts = [],
}: {
  user: ProfileDisplayUser;
  isOwner?: boolean;
  recentPosts?: ProfileActivity[];
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

      <div className="mt-5 grid gap-5 md:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-5">
          {user.bio && (
            <Card className="p-5 sm:p-6">
              <h2 className="text-base font-semibold tracking-tight text-text">About</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">{user.bio}</p>
            </Card>
          )}

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
          {recentPosts.length > 0 && <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-text">Builds & community activity</h2>
                <p className="mt-1 text-xs text-muted">Recent work shared with TeamForge</p>
              </div>
              <Link href="/feed" aria-label="Open builder feed" className="flex h-8 w-8 items-center justify-center rounded-lg text-accent hover:bg-accent-soft"><ArrowUpRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-4 space-y-3">
              {recentPosts.map((post) => <div key={post.id} className="rounded-lg border border-border bg-bg p-3.5">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent"><Code2 className="h-3.5 w-3.5" />{post.type === "build" ? "Build log" : post.type === "question" ? "Question" : "Team-up"}</div>
                {post.projectName && <p className="mt-2 text-sm font-semibold text-text">{post.projectName}</p>}
                <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs leading-5 text-muted">{post.content}</p>
                {post.skills.length > 0 && <div className="mt-2.5 flex flex-wrap gap-1">{post.skills.slice(0, 4).map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>)}</div>}
                {(post.githubUrl || post.demoUrl) && <div className="mt-3 flex gap-3 text-xs font-medium">
                  {post.githubUrl && <a href={post.githubUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">GitHub</a>}
                  {post.demoUrl && <a href={post.demoUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Live demo</a>}
                </div>}
              </div>)}
            </div>
            <Link href="/feed" className="mt-4 inline-flex text-xs font-medium text-accent hover:underline">Explore the builder feed <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link>
          </Card>}

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
