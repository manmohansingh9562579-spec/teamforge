"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  defaultTab,
  children,
}: {
  tabs: { id: string; label: string; count?: number }[];
  defaultTab?: string;
  children: (activeTab: string) => ReactNode;
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  return (
    <div>
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={cn(
              "relative px-3 py-2.5 text-[13px] font-medium transition-colors",
              active === t.id ? "text-text" : "text-muted hover:text-text"
            )}
          >
            <span className="flex items-center gap-1.5">
              {t.label}
              {typeof t.count === "number" && t.count > 0 && (
                <span className="rounded-full bg-surface-hover px-1.5 text-[11px] text-muted">
                  {t.count}
                </span>
              )}
            </span>
            {active === t.id && (
              <motion.div
                layoutId="tab-underline"
                className="absolute inset-x-0 -bottom-px h-0.5 bg-accent"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </div>
      <div className="pt-5">{children(active)}</div>
    </div>
  );
}
