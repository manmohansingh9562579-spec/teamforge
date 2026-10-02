"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Users,
  FolderKanban,
  Inbox,
  Bell,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/my-teams", label: "My teams", icon: FolderKanban },
  { href: "/requests", label: "Requests", icon: Inbox },
  { href: "/connections", label: "Connections", icon: Network },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export function Sidebar({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border md:block">
      <nav aria-label="Workspace navigation" className="sticky top-16 flex flex-col gap-0.5 p-3">
        {links.map((l) => {
          const active = pathname === l.href || pathname?.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                active
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:bg-surface-hover hover:text-text"
              )}
            >
              <span className="flex items-center gap-2.5">
                <l.icon className="h-4 w-4" />
                {l.label}
              </span>
              {l.href === "/notifications" && unreadCount > 0 && (
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-on-accent">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
