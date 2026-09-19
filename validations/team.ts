import { z } from "zod";
import { PROJECT_TYPES, TEAM_STATUS, TEAM_VISIBILITY } from "@/lib/constants";

export const createTeamSchema = z.object({
  name: z.string().trim().min(2, "Team name is required").max(80),
  projectTitle: z.string().trim().min(2, "Project title is required").max(120),
  description: z.string().trim().min(10, "Add a short description").max(2000),
  projectType: z.enum(PROJECT_TYPES, { errorMap: () => ({ message: "Select a project type" }) }),
  requiredRoles: z.array(z.string()).min(1, "Select at least one required role"),
  requiredSkills: z.array(z.string()).default([]),
  techStack: z.array(z.string()).default([]),
  teamSize: z.coerce.number().int().min(1, "Team size must be at least 1").max(50),
  deadline: z.string().optional().or(z.literal("")),
  visibility: z.enum(TEAM_VISIBILITY).default("public"),
  status: z.enum(TEAM_STATUS).default("forming"),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const updateTeamSchema = createTeamSchema.partial();
