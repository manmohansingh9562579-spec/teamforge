import { z } from "zod";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";

export const createTaskSchema = z.object({
  teamId: z.string().min(1),
  title: z.string().trim().min(2, "Title is required").max(140),
  description: z.string().trim().max(2000).optional().default(""),
  priority: z.enum(TASK_PRIORITY).default("Medium"),
  assignee: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(2).max(140).optional(),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(TASK_STATUS).optional(),
  priority: z.enum(TASK_PRIORITY).optional(),
  assignee: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});
