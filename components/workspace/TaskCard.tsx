"use client";

import { Calendar, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { TASK_STATUS } from "@/lib/constants";

export interface TaskCardData {
  _id: string;
  title: string;
  priority: "Low" | "Medium" | "High";
  status: (typeof TASK_STATUS)[number];
  dueDate?: string;
  assignee?: { _id: string; name: string; avatar?: string } | null;
}

const priorityTone: Record<TaskCardData["priority"], "neutral" | "warning" | "danger"> = {
  Low: "neutral",
  Medium: "warning",
  High: "danger",
};

export function TaskCard({
  task,
  onStatusChange,
  onDelete,
}: {
  task: TaskCardData;
  onStatusChange: (status: string) => void;
  onDelete: () => void;
}) {
  const overdue =
    task.dueDate && task.status !== "Done" && new Date(task.dueDate) < new Date();

  return (
    <div className="rounded-md border border-border bg-bg p-3 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium leading-snug text-text">{task.title}</p>
        <button
          onClick={onDelete}
          aria-label="Delete task"
          className="shrink-0 rounded p-0.5 text-muted hover:text-danger"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <Badge tone={priorityTone[task.priority]}>{task.priority}</Badge>
        {task.dueDate && (
          <span
            className={`flex items-center gap-1 text-[11px] ${
              overdue ? "text-danger" : "text-muted"
            }`}
          >
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <Avatar name={task.assignee.name} src={task.assignee.avatar} size="sm" />
            <span className="text-[11px] text-muted">{task.assignee.name.split(" ")[0]}</span>
          </div>
        ) : (
          <span className="text-[11px] text-muted">Unassigned</span>
        )}

        <Select
          value={task.status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-7 w-auto min-w-0 border-none bg-transparent px-1.5 pr-6 text-[11px] text-muted"
        >
          {TASK_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
