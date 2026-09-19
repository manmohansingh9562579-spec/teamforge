import { Sparkles } from "lucide-react";
import type { MatchResult } from "@/services/matchingService";

export function CompatibilityCard({ match }: { match: MatchResult }) {
  return (
    <div className="mt-6 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" />
        <p className="text-[13px] font-medium text-text">{match.score}% compatibility</p>
      </div>
      <p className="mt-1 text-[12px] text-muted">
        Based on your skills, roles, interests and availability — not a quality judgment.
      </p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${match.score}%` }}
        />
      </div>
      {match.reasons.length > 0 && (
        <ul className="mt-3 space-y-1">
          {match.reasons.map((r, i) => (
            <li key={i} className="text-[12px] text-muted">
              · {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
