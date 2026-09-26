"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  PROJECT_TYPES,
  ROLES,
  SUGGESTED_SKILLS,
  TEAM_VISIBILITY,
  TEAM_STATUS,
} from "@/lib/constants";
import type { ITeam } from "@/models/Team";

export function TeamSettingsForm({ team }: { team: ITeam }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: team.name,
    projectTitle: team.projectTitle,
    description: team.description,
    projectType: team.projectType,
    requiredRoles: team.requiredRoles,
    requiredSkills: team.requiredSkills,
    techStack: team.techStack,
    teamSize: String(team.teamSize),
    deadline: team.deadline ? new Date(team.deadline).toISOString().slice(0, 10) : "",
    visibility: team.visibility,
    status: team.status,
  });
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const update = (key: keyof typeof form, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/teams/${team._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Could not save changes");
        return;
      }
      toast.success("Settings updated");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[640px] space-y-6">
      <div>
        <Label htmlFor="name">Team name</Label>
        <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="projectTitle">Project title</Label>
        <Input
          id="projectTitle"
          value={form.projectTitle}
          onChange={(e) => update("projectTitle", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" value={form.status} onChange={(e) => update("status", e.target.value)}>
            {TEAM_STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
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
                {v}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="projectType">Project type</Label>
          <Select
            id="projectType"
            value={form.projectType}
            onChange={(e) => update("projectType", e.target.value)}
          >
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="teamSize">Maximum team size</Label>
          <Input
            id="teamSize"
            type="number"
            value={form.teamSize}
            onChange={(e) => update("teamSize", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="deadline">Deadline</Label>
        <Input
          id="deadline"
          type="date"
          value={form.deadline}
          onChange={(e) => update("deadline", e.target.value)}
        />
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

      <div className="border-t border-border pt-6">
        <Button onClick={save} loading={saving}>
          Save changes
        </Button>
      </div>

      <div className="rounded-lg border border-danger/30 bg-danger/5 p-4">
        <h3 className="text-[13px] font-medium text-text">Delete this team</h3>
        <p className="mt-1 text-[12px] text-muted">
          Permanently deletes the team, its tasks, requests and activity. This can&apos;t be undone.
        </p>
        <Button variant="danger" size="sm" className="mt-3" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-3.5 w-3.5" /> Delete team
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete this team?"
        description="This permanently deletes the team, its tasks, requests and activity. This can't be undone."
        confirmLabel="Delete team"
        onConfirm={async () => {
          const res = await fetch(`/api/teams/${team._id}`, { method: "DELETE" });
          if (!res.ok) {
            toast.error("Could not delete the team");
            return;
          }
          toast.success("Team deleted");
          router.push("/my-teams");
          router.refresh();
        }}
      />
    </div>
  );
}
