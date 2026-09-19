"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { MultiSelect } from "@/components/ui/MultiSelect";
import {
  SUGGESTED_SKILLS,
  ROLES,
  EXPERIENCE_LEVELS,
  INTERESTS,
} from "@/lib/constants";

type Draft = {
  headline: string;
  bio: string;
  skills: string[];
  preferredRoles: string[];
  experienceLevel: (typeof EXPERIENCE_LEVELS)[number] | "";
  interests: string[];
};

const STEPS = ["Basic info", "Skills", "Roles", "Experience", "Interests"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    headline: "",
    bio: "",
    skills: [],
    preferredRoles: [],
    experienceLevel: "",
    interests: [],
  });

  const isLast = step === STEPS.length - 1;
  const canAdvance =
    step === 0 ? draft.headline.trim().length > 0 :
    step === 1 ? draft.skills.length > 0 :
    step === 2 ? draft.preferredRoles.length > 0 :
    step === 3 ? draft.experienceLevel !== "" :
    draft.interests.length > 0;

  const finish = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: draft.headline,
          bio: draft.bio,
          skills: draft.skills,
          preferredRoles: draft.preferredRoles,
          experienceLevel: draft.experienceLevel,
          interests: draft.interests,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Profile set up");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface/40 px-4 py-12">
      <div className="w-full max-w-[520px] rounded-xl border border-border bg-surface p-7 shadow-raised sm:p-8">
        <div className="mb-6 flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-accent" : "bg-border"
              }`}
            />
          ))}
        </div>

        <p className="text-xs font-medium text-muted">
          Step {step + 1} of {STEPS.length}
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-text">{STEPS[step]}</h1>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="mt-6"
          >
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    placeholder="Frontend developer who loves clean UI"
                    value={draft.headline}
                    onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio (optional)</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    placeholder="A short bio about what you build and what you're looking for."
                    value={draft.bio}
                    onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <Label>Your skills</Label>
                <MultiSelect
                  value={draft.skills}
                  onChange={(skills) => setDraft({ ...draft, skills })}
                  suggestions={SUGGESTED_SKILLS}
                  placeholder="Add a skill and press Enter"
                  max={30}
                />
              </div>
            )}

            {step === 2 && (
              <div>
                <Label>Roles you want to take on</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => {
                    const selected = draft.preferredRoles.includes(r);
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() =>
                          setDraft({
                            ...draft,
                            preferredRoles: selected
                              ? draft.preferredRoles.filter((x) => x !== r)
                              : [...draft.preferredRoles, r],
                          })
                        }
                        aria-pressed={selected}
                className={`rounded-md border px-3 py-2 text-left text-[13px] transition-colors ${
                          selected
                            ? "border-accent bg-accent-soft text-accent"
                            : "border-border text-text hover:bg-surface-hover"
                        }`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <Label htmlFor="experience">Experience level</Label>
                <Select
                  id="experience"
                  value={draft.experienceLevel}
                  onChange={(e) =>
                    setDraft({ ...draft, experienceLevel: e.target.value as any })
                  }
                >
                  <option value="">Select one</option>
                  {EXPERIENCE_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {step === 4 && (
              <div>
                <Label>What are you interested in?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {INTERESTS.map((i) => {
                    const selected = draft.interests.includes(i);
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() =>
                          setDraft({
                            ...draft,
                            interests: selected
                              ? draft.interests.filter((x) => x !== i)
                              : [...draft.interests, i],
                          })
                        }
                        aria-pressed={selected}
                className={`rounded-md border px-3 py-2 text-left text-[13px] transition-colors ${
                          selected
                            ? "border-accent bg-accent-soft text-accent"
                            : "border-border text-text hover:bg-surface-hover"
                        }`}
                      >
                        {i}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={step === 0 ? "invisible" : ""}
          >
            Back
          </Button>
          {isLast ? (
            <Button type="button" onClick={finish} loading={saving} disabled={!canAdvance}>
              Finish
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance}
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
