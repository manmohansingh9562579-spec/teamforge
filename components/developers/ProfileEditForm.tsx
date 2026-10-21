"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Award, FileText, ImagePlus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Label, Input, Textarea, FormError } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
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
  achievements: AchievementInput[];
};

type AchievementInput = {
  title: string;
  issuer: string;
  date: string;
  description: string;
  link: string;
  documentUrl: string;
};

async function optimizeProfilePhoto(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file");
  if (file.size > 10 * 1024 * 1024) throw new Error("Choose an image smaller than 10 MB");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This image could not be opened. Try a JPG, PNG, or WebP file.");
  }

  try {
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > 40_000_000) {
      throw new Error("This image is too large to process");
    }

    const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare this image");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const optimized = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.82)
    );
    if (!optimized || optimized.type !== "image/webp") {
      throw new Error("Your browser could not optimize this image");
    }
    if (optimized.size > 512 * 1024) {
      throw new Error("This image is still too large after resizing. Try a simpler photo.");
    }
    return optimized;
  } finally {
    bitmap.close();
  }
}

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
    achievements: (user.achievements ?? []).map((achievement) => ({
      title: achievement.title ?? "",
      issuer: achievement.issuer ?? "",
      date: achievement.date ?? "",
      description: achievement.description ?? "",
      link: achievement.link ?? "",
      documentUrl: achievement.documentUrl ?? "",
    })),
  };
}

export function ProfileEditForm({ user }: { user: IUser }) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [form, setForm] = useState<FormState>(toFormState(user));
  const [avatar, setAvatar] = useState(user.avatar ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const uploadPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const optimized = await optimizeProfilePhoto(file);
      const body = new FormData();
      body.append("file", optimized, "profile-photo.webp");
      const response = await fetch("/api/profile/avatar", { method: "PUT", body });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Could not upload photo");

      const nextAvatar = json.data.avatar as string;
      setAvatar(nextAvatar);
      try {
        await updateSession({ image: nextAvatar });
      } catch {
        // The saved profile photo is still available after the next session refresh.
      }
      router.refresh();
      toast.success("Profile photo updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = async () => {
    setRemovingPhoto(true);
    try {
      const response = await fetch("/api/profile/avatar", { method: "DELETE" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Could not remove photo");

      setAvatar("");
      try {
        await updateSession({ image: null });
      } catch {
        // The profile and public avatar will use initials even if the session refresh is delayed.
      }
      router.refresh();
      toast.success("Profile photo removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove photo");
    } finally {
      setRemovingPhoto(false);
    }
  };

  const updateAchievement = (index: number, key: keyof AchievementInput, value: string) => {
    setForm((current) => ({
      ...current,
      achievements: current.achievements.map((achievement, itemIndex) =>
        itemIndex === index ? { ...achievement, [key]: value } : achievement
      ),
    }));
  };

  const addAchievement = () => {
    if (form.achievements.length >= 10) return;
    update("achievements", [...form.achievements, {
      title: "", issuer: "", date: "", description: "", link: "", documentUrl: "",
    }]);
  };

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
          experienceLevel: form.experienceLevel || undefined,
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
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface/50 p-4 sm:flex-row sm:items-center">
          <Avatar name={form.name || user.name} src={avatar} size="xxl" className="ring-2 ring-accent-soft" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text">Profile photo</p>
            <p className="mt-1 text-xs leading-5 text-muted">Shown on your public TeamForge profile. Images are resized before being saved.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                ref={photoInput}
                type="file"
                accept="image/*"
                onChange={uploadPhoto}
                className="sr-only"
                aria-label="Choose a profile photo"
              />
              <Button type="button" variant="outline" size="sm" loading={uploadingPhoto} onClick={() => photoInput.current?.click()}>
                <ImagePlus className="h-4 w-4" /> {uploadingPhoto ? "Uploading" : avatar ? "Change photo" : "Add photo"}
              </Button>
              {avatar && (
                <Button type="button" variant="ghost" size="sm" loading={removingPhoto} disabled={uploadingPhoto} onClick={removePhoto}>
                  <Trash2 className="h-4 w-4" /> Remove
                </Button>
              )}
            </div>
            <p className="mt-2 text-[11px] leading-5 text-muted">JPG, PNG, or WebP · up to 10 MB before resizing · saved as WebP up to 512 KB.</p>
          </div>
        </div>
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

      <section id="achievements" className="space-y-4 border-t border-border pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[14px] font-medium text-text">Achievements & certificates</h2>
            <p className="mt-1 text-xs leading-5 text-muted">Show awards, contest results, certifications, or shipped milestones on your coder profile.</p>
          </div>
          <button
            type="button"
            onClick={addAchievement}
            disabled={form.achievements.length >= 10}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-text transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" /> Add achievement
          </button>
        </div>

        {form.achievements.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-5 text-center">
            <Award className="mx-auto h-5 w-5 text-accent" />
            <p className="mt-2 text-sm font-medium text-text">Your work deserves proof</p>
            <p className="mt-1 text-xs text-muted">Add a certificate, competition result, or milestone with a supporting link or document.</p>
          </div>
        ) : form.achievements.map((achievement, index) => (
          <div key={`achievement-${index}`} className="space-y-3 rounded-xl border border-border bg-surface/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-text"><Award className="h-4 w-4 text-accent" /> Achievement {index + 1}</span>
              <button
                type="button"
                aria-label={`Remove achievement ${index + 1}`}
                onClick={() => update("achievements", form.achievements.filter((_, itemIndex) => itemIndex !== index))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-danger/10 hover:text-danger"
              ><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor={`achievement-title-${index}`}>Achievement title</Label>
                <Input id={`achievement-title-${index}`} required minLength={2} maxLength={100} value={achievement.title} onChange={(event) => updateAchievement(index, "title", event.target.value)} placeholder="Top 10 — Hackathon name" />
              </div>
              <div>
                <Label htmlFor={`achievement-issuer-${index}`}>Organization / issuer</Label>
                <Input id={`achievement-issuer-${index}`} maxLength={100} value={achievement.issuer} onChange={(event) => updateAchievement(index, "issuer", event.target.value)} placeholder="Organizer, university, or platform" />
              </div>
              <div>
                <Label htmlFor={`achievement-date-${index}`}>Date</Label>
                <Input id={`achievement-date-${index}`} maxLength={30} value={achievement.date} onChange={(event) => updateAchievement(index, "date", event.target.value)} placeholder="e.g. Sep 2026" />
              </div>
              <div>
                <Label htmlFor={`achievement-link-${index}`}>Reference link</Label>
                <Input id={`achievement-link-${index}`} type="url" value={achievement.link} onChange={(event) => updateAchievement(index, "link", event.target.value)} placeholder="https://…" />
              </div>
            </div>
            <div>
              <Label htmlFor={`achievement-description-${index}`}>What did you achieve?</Label>
              <Textarea id={`achievement-description-${index}`} rows={2} maxLength={400} value={achievement.description} onChange={(event) => updateAchievement(index, "description", event.target.value)} placeholder="Add a short detail that helps people understand the achievement." />
            </div>
            <div>
              <Label htmlFor={`achievement-document-${index}`}>Certificate / document link</Label>
              <div className="relative">
                <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" />
                <Input id={`achievement-document-${index}`} className="pl-9" type="url" value={achievement.documentUrl} onChange={(event) => updateAchievement(index, "documentUrl", event.target.value)} placeholder="Public PDF or shared Drive / OneDrive link" />
              </div>
              <p className="mt-1 text-[11px] leading-5 text-muted">Use a public or shareable document link. Anyone viewing your profile can open it.</p>
            </div>
          </div>
        ))}
        <FormError>{errors.achievements}</FormError>
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
