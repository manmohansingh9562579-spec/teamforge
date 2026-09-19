import Link from "next/link";
import { Github, Linkedin, Globe, MapPin, GraduationCap, Pencil } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, SkillBadge } from "@/components/ui/Badge";
import type { IUser } from "@/models/User";

export function ProfileView({
  user,
  isOwner = false,
}: {
  user: IUser;
  isOwner?: boolean;
}) {
  const links = [
    { href: user.githubUrl, label: "GitHub", icon: Github },
    { href: user.linkedinUrl, label: "LinkedIn", icon: Linkedin },
    { href: user.portfolioUrl, label: "Portfolio", icon: Globe },
  ].filter((l) => l.href);

  return (
    <div className="container-page max-w-[720px] py-12">
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-5">
          <Avatar name={user.name} src={user.avatar} size="xl" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-text">{user.name}</h1>
            <p className="text-[14px] text-muted">@{user.username}</p>
            {user.headline && <p className="mt-1 text-[14px] text-text">{user.headline}</p>}
          </div>
        </div>
        {isOwner && (
          <Link
            href="/profile/edit"
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] font-medium text-text hover:bg-surface-hover"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit profile
          </Link>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-[13px] text-muted">
        {user.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> {user.location}
          </span>
        )}
        {user.college && (
          <span className="flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            {user.college}
            {user.graduationYear ? ` · ${user.graduationYear}` : ""}
          </span>
        )}
      </div>

      {links.length > 0 && (
        <div className="mt-4 flex gap-3">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[13px] text-muted hover:text-accent"
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </a>
          ))}
        </div>
      )}

      {user.bio && (
        <p className="mt-6 max-w-[60ch] text-[14px] leading-relaxed text-text">{user.bio}</p>
      )}

      {user.skills.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[13px] font-medium text-muted">Skills</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {user.skills.map((s) => (
              <SkillBadge key={s}>{s}</SkillBadge>
            ))}
          </div>
        </section>
      )}

      {user.preferredRoles.length > 0 && (
        <section className="mt-6">
          <h2 className="text-[13px] font-medium text-muted">Roles</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {user.preferredRoles.map((r) => (
              <Badge key={r} tone="accent">
                {r}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {user.interests.length > 0 && (
        <section className="mt-6">
          <h2 className="text-[13px] font-medium text-muted">Interested in</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {user.interests.map((i) => (
              <Badge key={i}>{i}</Badge>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-3 text-[13px]">
        {user.experienceLevel && <Badge tone="neutral">{user.experienceLevel}</Badge>}
        {user.availability && <Badge tone="success">{user.availability}</Badge>}
      </div>
    </div>
  );
}
