"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            tabIndex={-1}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-[440px] rounded-lg border border-border bg-surface p-6 shadow-raised focus:outline-none"
          >
            <div className="flex items-start justify-between">
              <h2 id="dialog-title" className="text-[15px] font-semibold text-text">
                {title}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-md p-1 text-muted hover:bg-surface-hover hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {description && <p className="mt-1.5 text-[13px] text-muted">{description}</p>}
            {children && <div className="mt-4">{children}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
