import { SkillBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

const columns = [
  { title: "To do", count: 3, tone: "bg-muted/40" },
  { title: "In progress", count: 2, tone: "bg-accent" },
  { title: "Review", count: 1, tone: "bg-warning" },
  { title: "Done", count: 5, tone: "bg-success" },
];

const members = [
  { name: "Priya Nair", role: "Frontend" },
  { name: "Diego Ruiz", role: "Backend" },
  { name: "Amara Boateng", role: "Design" },
];

export function ProductPreview() {
  return (
    <div className="relative rounded-xl border border-border bg-surface p-4 shadow-raised sm:p-5">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <p className="text-sm font-medium text-text">Nocturne — Campus Ride Share</p>
          <p className="text-xs text-muted">Hackathon project · 4 members</p>
        </div>
        <div className="flex -space-x-2">
          {members.map((m) => (
            <Avatar key={m.name} name={m.name} size="sm" className="ring-2 ring-surface" />
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {columns.map((c) => (
          <div key={c.title} className="min-w-0">
            <div className="mb-2 flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${c.tone}`} />
              <span className="truncate text-[11px] font-medium text-muted">{c.title}</span>
            </div>
            <div className="space-y-1.5">
              {Array.from({ length: c.count > 2 ? 2 : c.count }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 rounded-md border border-border bg-bg"
                  style={{ opacity: 1 - i * 0.35 }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
        <span className="text-[11px] text-muted mr-1">Open role: Backend Developer</span>
        <SkillBadge>Node.js</SkillBadge>
        <SkillBadge>MongoDB</SkillBadge>
        <SkillBadge>Express</SkillBadge>
      </div>
    </div>
  );
}
