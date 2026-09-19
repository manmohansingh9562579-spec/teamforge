"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function WorkspaceNav({ slug, isOwner }: { slug: string; isOwner: boolean }) {
  const pathname = usePathname();
  const base = `/teams/${slug}`;

  const items = [
    { href: `${base}/workspace`, label: "Overview" },
    { href: `${base}/tasks`, label: "Tasks" },
    { href: `${base}/members`, label: "Members" },
    { href: `${base}/activity`, label: "Activity" },
    ...(isOwner ? [{ href: `${base}/settings`, label: "Settings" }] : []),
  ];

  return (
    <div className="border-b border-border">
      <div className="container-page flex gap-1 overflow-x-auto">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap border-b-2 px-3 py-3 text-[13px] font-medium transition-colors",
                active
                  ? "border-accent text-text"
                  : "border-transparent text-muted hover:text-text"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
