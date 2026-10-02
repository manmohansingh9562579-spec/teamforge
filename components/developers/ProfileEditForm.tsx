"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label, Input, Textarea, FormError } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Button } from "@/components/ui/Button";
import {
  SUGGESTED_SKILLS,
  ROLES,
  EXPERIENCE_LEVELS,
  AVAILABILITY,
  INTERESTS,
} from "@/lib/constants";
import type { IUser } from "@/models/User";

type FormState = {
  name: string;
  headline: string;
  bio: string;
  location: string;
  college: string;
  graduationYear: string;
  experienceLevel: string;
  availability: string;
  skills: string[];
  preferredRoles: string[];
  interests: string[];
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
};

function toFormState(user: IUser): FormState {
  return {
    name: user.name ?? "",
    headline: user.headline ?? "",
    bio: user.bio ?? "",
    location: user.location ?? "",
    college: user.college ?? "",
    graduationYear: user.graduationYear ? String(user.graduationYear) : "",
    experienceLevel: user.experienceLevel ?? "",
    availability: user.availability ?? "Available",
    skills: user.skills ?? [],
    preferredRoles: user.preferredRoles ?? [],
    interests: user.interests ?? [],
    githubUrl: user.githubUrl ?? "",
    linkedinUrl: user.linkedinUrl ?? "",
    portfolioUrl: user.portfolioUrl ?? "",
  };
}

export function ProfileEditForm({ user }: { user: IUser }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState(user));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.details) setErrors(Object.fromEntries(
          Object.entries(json.details).map(([k, v]) => [k, (v as string[])[0]])
        ));
        toast.error(json.error ?? "Could not save changes");
        return;
      }

      toast.success("Profile updated");
      router.push("/profile");
      router.refresh();
    } catch {
      toast.error("Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-[640px] space-y-6">
      <section className="space-y-4">
        <h2 className="text-[14px] font-medium text-text">Basic information</h2>
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} />
          <FormError>{errors.name}</FormError>
        </div>
        <div>
          <Label htmlFor="headline">Headline</Label>
          <Input
            id="headline"
            value={form.headline}
            onChange={(e) => update("headline", e.target.value)}
            placeholder="Frontend developer who loves clean UI"
          />
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            rows={4}
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="college">College</Label>
            <Input
              id="college"
              value={form.college}
              onChange={(e) => update("college", e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="gradYear">Graduation year</Label>
          <Input
            id="gradYear"
            type="number"
            value={form.graduationYear}
            onChange={(e) => update("graduationYear", e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-4 border-t border-border pt-6">
        <h2 className="text-[14px] font-medium text-text">Skills</h2>
        <MultiSelect
          value={form.skills}
          onChange={(v) => update("skills", v)}
          suggestions={SUGGESTED_SKILLS}
          max={30}
        />
      </section>

      <section className="space-y-4 border-t border-border pt-6">
        <h2 className="text-[14px] font-medium text-text">Roles</h2>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((r) => {
            const selected = form.preferredRoles.includes(r);
            return (
              <button
                type="button"
                key={r}
                onClick={() =>
                  update(
                    "preferredRoles",
                    selected
                      ? form.preferredRoles.filter((x) => x !== r)
                      : [...form.preferredRoles, r]
                  )
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
      </section>

      <section className="grid grid-cols-2 gap-4 border-t border-border pt-6">
        <div>
          <Label htmlFor="experience">Experience level</Label>
          <Select
            id="experience"
            value={form.experienceLevel}
            onChange={(e) => update("experienceLevel", e.target.value)}
          >
            <option value="">Select one</option>
            {EXPERIENCE_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="availability">Availability</Label>
          <Select
            id="availability"
            value={form.availability}
            onChange={(e) => update("availability", e.target.value)}
          >
            {AVAILABILITY.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </div>
      </section>

      <section className="space-y-4 border-t border-border pt-6">
        <h2 className="text-[14px] font-medium text-text">Interests</h2>
        <div className="grid grid-cols-2 gap-2">
          {INTERESTS.map((i) => {
            const selected = form.interests.includes(i);
            return (
              <button
                type="button"
                key={i}
                onClick={() =>
                  update(
                    "interests",
                    selected ? form.interests.filter((x) => x !== i) : [...form.interests, i]
                  )
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
      </section>

      <section className="space-y-4 border-t border-border pt-6">
        <h2 className="text-[14px] font-medium text-text">Links</h2>
        <div>
          <Label htmlFor="github">GitHub URL</Label>
          <Input
            id="github"
            value={form.githubUrl}
            onChange={(e) => update("githubUrl", e.target.value)}
            placeholder="https://github.com/username"
          />
          <FormError>{errors.githubUrl}</FormError>
        </div>
        <div>
          <Label htmlFor="linkedin">LinkedIn URL</Label>
          <Input
            id="linkedin"
            value={form.linkedinUrl}
            onChange={(e) => update("linkedinUrl", e.target.value)}
            placeholder="https://linkedin.com/in/username"
          />
          <FormError>{errors.linkedinUrl}</FormError>
        </div>
        <div>
          <Label htmlFor="portfolio">Portfolio URL</Label>
          <Input
            id="portfolio"
            value={form.portfolioUrl}
            onChange={(e) => update("portfolioUrl", e.target.value)}
            placeholder="https://yoursite.com"
          />
          <FormError>{errors.portfolioUrl}</FormError>
        </div>
      </section>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Button type="submit" loading={saving}>
          Save changes
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/profile")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
