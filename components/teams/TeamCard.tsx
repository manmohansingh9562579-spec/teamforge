import Link from "next/link";
import { Users, Clock } from "lucide-react";
import { Badge, SkillBadge } from "@/components/ui/Badge";
import { openPositions } from "@/services/teamHelpers";
import type { ITeam } from "@/models/Team";

export function TeamCard({ team }: { team: Pick<ITeam, "slug" | "name" | "projectTitle" | "description" | "requiredRoles" | "requiredSkills" | "teamSize" | "members" | "projectType" | "deadline" | "status">  }) {
  const open = openPositions(team);

  return (
    <Link
      href={`/teams/${team.slug}`}
      className="block rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-strong hover:bg-surface-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-text">{team.projectTitle}</p>
          <p className="truncate text-[12px] text-muted">{team.name}</p>
        </div>
        <Badge tone="neutral">{team.projectType}</Badge>
      </div>

      <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted">
        {team.description}
      </p>

      {team.requiredSkills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {team.requiredSkills.slice(0, 4).map((s) => (
            <SkillBadge key={s}>{s}</SkillBadge>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[12px] text-muted">
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {open > 0 ? `${open} open position${open === 1 ? "" : "s"}` : "Team full"}
        </span>
        {team.deadline && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {new Date(team.deadline).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </Link>
  );
}
