import Link from "next/link";
import { Github, Linkedin, Globe, MapPin, GraduationCap, Pencil, BriefcaseBusiness, Sparkles } from "lucide-react";
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
}: {
  user: ProfileDisplayUser;
  isOwner?: boolean;
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
          <div className="shrink-0 sm:pt-5">
            {isOwner ? (
              <Link
                href="/profile/edit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface px-4 text-sm font-medium text-text transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                <Pencil className="h-4 w-4" /> Edit profile
              </Link>
            ) : (
              <ContactButton recipientId={String(user._id)} recipientName={user.name} />
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
