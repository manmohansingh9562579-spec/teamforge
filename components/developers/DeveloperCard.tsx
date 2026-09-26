import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, SkillBadge } from "@/components/ui/Badge";

export interface DeveloperCardData {
  username: string;
  name: string;
  avatar?: string;
  headline?: string;
  location?: string;
  skills: string[];
  preferredRoles: string[];
  experienceLevel?: string;
  availability?: string;
}

export function DeveloperCard({ dev }: { dev: DeveloperCardData }) {
  return (
    <Link
      href={`/developers/${dev.username}`}
      aria-label={`View ${dev.name}'s profile`}
      className="group flex h-full flex-col rounded-xl border border-border bg-surface p-5 shadow-card transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <Avatar name={dev.name} src={dev.avatar} size="lg" />
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold tracking-tight text-text">{dev.name}</h2>
            <p className="truncate text-sm text-muted">@{dev.username}</p>
          </div>
        </div>
        {dev.availability && (
          <span className="shrink-0 pt-1">
            <Badge tone={dev.availability === "Available" ? "success" : "neutral"}>{dev.availability}</Badge>
          </span>
        )}
      </div>

      {dev.headline ? (
        <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-relaxed text-muted">{dev.headline}</p>
      ) : (
        <p className="mt-4 min-h-10 text-sm text-muted">Open to collaborating on new projects.</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {dev.preferredRoles.slice(0, 1).map((role) => <Badge key={role} tone="accent">{role}</Badge>)}
        {dev.experienceLevel && <Badge>{dev.experienceLevel}</Badge>}
      </div>

      {dev.skills.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {dev.skills.slice(0, 4).map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>)}
          {dev.skills.length > 4 && (
            <span className="self-center px-1 text-xs text-muted">+{dev.skills.length - 4}</span>
          )}
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted">Skills not listed</p>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
        {dev.location ? (
          <p className="flex min-w-0 items-center gap-1.5 truncate text-xs text-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {dev.location}
          </p>
        ) : <span />}
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-accent">
          View profile <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
