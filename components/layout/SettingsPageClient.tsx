"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Sun, Moon, Monitor, LogOut, Trash2, ShieldCheck } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useTheme } from "@/components/layout/ThemeProvider";
import { cn } from "@/lib/utils";

export function SettingsPageClient({ name, email }: { name: string; email: string }) {
  const { theme, setTheme } = useTheme();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <Tabs
      tabs={[
        { id: "account", label: "Account" },
        { id: "appearance", label: "Appearance" },
        { id: "notifications", label: "Notifications" },
        { id: "privacy", label: "Privacy" },
        { id: "security", label: "Security" },
      ]}
    >
      {(tab) => {
        if (tab === "account") {
          return (
            <div className="max-w-[480px] space-y-6">
              <div>
                <p className="text-[12px] font-medium text-muted">Name</p>
                <p className="mt-1 text-[14px] text-text">{name}</p>
              </div>
              <div>
                <p className="text-[12px] font-medium text-muted">Email</p>
                <p className="mt-1 text-[14px] text-text">{email}</p>
              </div>
              <div className="border-t border-border pt-5">
                <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="h-3.5 w-3.5" /> Log out
                </Button>
              </div>

              <div className="rounded-lg border border-danger/30 bg-danger/5 p-4">
                <h3 className="text-[13px] font-medium text-text">Delete account</h3>
                <p className="mt-1 text-[12px] text-muted">
                  Permanently deletes your account, teams you own, and your membership in
                  other teams. This can&apos;t be undone.
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  className="mt-3"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete account
                </Button>
              </div>

              <ConfirmDialog
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                title="Delete your account?"
                description="This permanently deletes your account and everything tied to it. This can't be undone."
                confirmLabel="Delete account"
                onConfirm={async () => {
                  const res = await fetch("/api/account", { method: "DELETE" });
                  if (!res.ok) {
                    toast.error("Could not delete your account");
                    return;
                  }
                  await signOut({ callbackUrl: "/" });
                }}
              />
            </div>
          );
        }

        if (tab === "appearance") {
          const options = [
            { value: "light", label: "Light", icon: Sun },
            { value: "dark", label: "Dark", icon: Moon },
            { value: "system", label: "System", icon: Monitor },
          ] as const;
          return (
            <div className="max-w-[480px]">
              <p className="text-[12px] font-medium text-muted">Theme</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {options.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setTheme(o.value)}
                    aria-pressed={theme === o.value}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-md border px-3 py-4 text-[12px] font-medium transition-colors",
                      theme === o.value
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border text-muted hover:bg-surface-hover"
                    )}
                  >
                    <o.icon className="h-4 w-4" />
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          );
        }

        if (tab === "notifications") {
          return (
            <div className="max-w-[480px] space-y-3 text-[13px] text-muted">
              <p>
                You&apos;re notified about join requests, contact requests and responses, team
                membership changes, and task assignments as they happen.
              </p>
              <p>
                Manage what you&apos;ve already received on the{" "}
                <a href="/notifications" className="text-accent hover:underline">
                  notifications page
                </a>
                .
              </p>
            </div>
          );
        }

        if (tab === "privacy") {
          return (
            <div className="max-w-[480px] space-y-3 text-[13px] text-muted">
              <p>
                Your developer profile — name, headline, bio, skills, roles and links — is
                public and discoverable on TeamForge so teams can find you.
              </p>
              <p>Your email address is never shown on your public profile.</p>
            </div>
          );
        }

        return (
          <div className="max-w-[480px] space-y-3">
            <div className="flex items-center gap-2 text-[13px] text-text">
              <ShieldCheck className="h-4 w-4 text-success" />
              Your password is hashed and never stored in plain text.
            </div>
            <p className="text-[13px] text-muted">
              Signed in as <span className="text-text">{email}</span>.
            </p>
          </div>
        );
      }}
    </Tabs>
  );
}
