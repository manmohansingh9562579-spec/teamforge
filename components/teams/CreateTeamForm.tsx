"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label, Input, Textarea, FormError } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Button } from "@/components/ui/Button";
import { PROJECT_TYPES, ROLES, SUGGESTED_SKILLS, TEAM_VISIBILITY } from "@/lib/constants";

type FormState = {
  name: string;
  projectTitle: string;
  description: string;
  projectType: string;
  requiredRoles: string[];
  requiredSkills: string[];
  techStack: string[];
  teamSize: string;
  deadline: string;
  visibility: string;
};

const initial: FormState = {
  name: "",
  projectTitle: "",
  description: "",
  projectType: "",
  requiredRoles: [],
  requiredSkills: [],
  techStack: [],
  teamSize: "4",
  deadline: "",
  visibility: "public",
};

export function CreateTeamForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.details) {
          setErrors(
            Object.fromEntries(Object.entries(json.details).map(([k, v]) => [k, (v as string[])[0]]))
          );
        } else {
          toast.error(json.error ?? "Could not create team");
        }
        return;
      }

      toast.success("Team created");
      router.push(`/teams/${json.data.slug}`);
      router.refresh();
    } catch {
      toast.error("Could not create team. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-[640px] space-y-5">
      <div>
        <Label htmlFor="name">Team name</Label>
        <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} />
        <FormError>{errors.name}</FormError>
      </div>

      <div>
        <Label htmlFor="projectTitle">Project title</Label>
        <Input
          id="projectTitle"
          value={form.projectTitle}
          onChange={(e) => update("projectTitle", e.target.value)}
        />
        <FormError>{errors.projectTitle}</FormError>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
        <FormError>{errors.description}</FormError>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="projectType">Project type</Label>
          <Select
            id="projectType"
            value={form.projectType}
            onChange={(e) => update("projectType", e.target.value)}
          >
            <option value="">Select one</option>
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <FormError>{errors.projectType}</FormError>
        </div>
        <div>
          <Label htmlFor="teamSize">Maximum team size</Label>
          <Input
            id="teamSize"
            type="number"
            min={1}
            max={50}
            value={form.teamSize}
            onChange={(e) => update("teamSize", e.target.value)}
          />
          <FormError>{errors.teamSize}</FormError>
        </div>
      </div>

      <div>
        <Label>Required roles</Label>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((r) => {
            const selected = form.requiredRoles.includes(r);
            return (
              <button
                type="button"
                key={r}
                onClick={() =>
                  update(
                    "requiredRoles",
                    selected
                      ? form.requiredRoles.filter((x) => x !== r)
                      : [...form.requiredRoles, r]
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
        <FormError>{errors.requiredRoles}</FormError>
      </div>

      <div>
        <Label>Required skills</Label>
        <MultiSelect
          value={form.requiredSkills}
          onChange={(v) => update("requiredSkills", v)}
          suggestions={SUGGESTED_SKILLS}
        />
      </div>

      <div>
        <Label>Tech stack</Label>
        <MultiSelect
          value={form.techStack}
          onChange={(v) => update("techStack", v)}
          suggestions={SUGGESTED_SKILLS}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="deadline">Deadline (optional)</Label>
          <Input
            id="deadline"
            type="date"
            value={form.deadline}
            onChange={(e) => update("deadline", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="visibility">Visibility</Label>
          <Select
            id="visibility"
            value={form.visibility}
            onChange={(e) => update("visibility", e.target.value)}
          >
            {TEAM_VISIBILITY.map((v) => (
              <option key={v} value={v}>
                {v === "public" ? "Public — anyone can find it" : "Private — invite only"}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <Button type="submit" loading={saving}>
          Create team
        </Button>
      </div>
    </form>
  );
}
