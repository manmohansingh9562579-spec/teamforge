"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, KanbanSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { TaskCard, type TaskCardData } from "./TaskCard";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";

interface TeamMemberOption {
  _id: string;
  name: string;
}

export function KanbanBoard({
  teamId,
  members,
}: {
  teamId: string;
  members: TeamMemberOption[];
}) {
  const [tasks, setTasks] = useState<TaskCardData[] | null>(null);
  const [error, setError] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    assignee: "",
    dueDate: "",
  });

  const load = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch(`/api/tasks?teamId=${teamId}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setTasks(json.data);
    } catch {
      setError(true);
    }
  }, [teamId]);

  useEffect(() => {
    load();
  }, [load]);

  const createTask = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, ...form }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Could not create task");
        return;
      }
      toast.success("Task created");
      setCreateOpen(false);
      setForm({ title: "", description: "", priority: "Medium", assignee: "", dueDate: "" });
      load();
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (id: string, status: string) => {
    setTasks((prev) => prev?.map((t) => (t._id === id ? { ...t, status: status as any } : t)) ?? null);
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Could not update task status");
      load();
    } else {
      toast.success("Task updated");
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev?.filter((t) => t._id !== id) ?? null);
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete task");
      load();
    } else {
      toast.success("Task deleted");
    }
  };

  if (error) return <ErrorState onRetry={load} />;

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> New task
        </Button>
      </div>

      {tasks === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TASK_STATUS.map((s) => (
            <div key={s} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={KanbanSquare}
          title="No tasks yet"
          description="Break the project down into tasks and assign them to your team."
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Create the first task
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-4">
          {TASK_STATUS.map((status) => {
            const columnTasks = tasks.filter((t) => t.status === status);
            return (
              <div key={status} className="min-w-0">
                <div className="mb-2.5 flex items-center gap-1.5">
                  <span className="text-[12px] font-medium text-muted">{status}</span>
                  <span className="text-[11px] text-muted">({columnTasks.length})</span>
                </div>
                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onStatusChange={(s) => changeStatus(task._id, s)}
                      onDelete={() => deleteTask(task._id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="New task">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                id="priority"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {TASK_PRIORITY.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="assignee">Assignee</Label>
            <Select
              id="assignee"
              value={form.assignee}
              onChange={(e) => setForm({ ...form, assignee: e.target.value })}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} disabled={!form.title.trim()} onClick={createTask}>
              Create task
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
