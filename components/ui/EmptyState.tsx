import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-hover">
        <Icon className="h-5 w-5 text-muted" strokeWidth={1.75} />
      </div>
      <h3 className="mt-4 text-[15px] font-medium text-text">{title}</h3>
      <p className="mt-1.5 max-w-[36ch] text-sm text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
