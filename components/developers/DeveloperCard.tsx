import Link from "next/link";
import { MapPin } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { SkillBadge } from "@/components/ui/Badge";

export interface DeveloperCardData {
  username: string;
  name: string;
  avatar?: string;
  headline?: string;
  location?: string;
  skills: string[];
  preferredRoles: string[];
}

export function DeveloperCard({ dev }: { dev: DeveloperCardData }) {
  return (
    <Link
      href={`/developers/${dev.username}`}
      className="block rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-strong hover:bg-surface-hover"
    >
      <div className="flex items-center gap-3">
        <Avatar name={dev.name} src={dev.avatar} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-text">{dev.name}</p>
          <p className="truncate text-[13px] text-muted">@{dev.username}</p>
        </div>
      </div>

      {dev.headline && (
        <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted">
          {dev.headline}
        </p>
      )}

      {dev.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {dev.skills.slice(0, 4).map((s) => (
            <SkillBadge key={s}>{s}</SkillBadge>
          ))}
          {dev.skills.length > 4 && (
            <span className="self-center text-[11px] text-muted">
              +{dev.skills.length - 4}
            </span>
          )}
        </div>
      )}

      {dev.location && (
        <p className="mt-3 flex items-center gap-1 text-[12px] text-muted">
          <MapPin className="h-3 w-3" />
          {dev.location}
        </p>
      )}
    </Link>
  );
}
