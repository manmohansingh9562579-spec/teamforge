import { z } from "zod";
import { EXPERIENCE_LEVELS, PROJECT_TYPES, ROLES } from "@/lib/constants";

export const teamMatchSchema = z.object({
  projectName: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10).max(2000),
  requiredSkills: z.array(z.string().trim().min(1).max(50)).max(30).default([]),
  requiredRoles: z.array(z.enum(ROLES)).min(1).max(ROLES.length),
  teamSize: z.coerce.number().int().min(2).max(50),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).optional().or(z.literal("")),
  availability: z.enum(["Available", "Limited"]).optional().or(z.literal("")),
  projectType: z.enum(PROJECT_TYPES).optional().or(z.literal("")),
  resultLimit: z.coerce.number().int().min(1).max(25).optional(),
}).transform((value) => ({
  ...value,
  requiredSkills: [...new Set(value.requiredSkills.map((skill) => skill.trim()))],
  experienceLevel: value.experienceLevel || undefined,
  availability: value.availability || undefined,
  projectType: value.projectType || undefined,
}));

export type TeamMatchInput = z.infer<typeof teamMatchSchema>;

export const teamInvitationSchema = z.object({
  inviteeId: z.string().regex(/^[a-f\d]{24}$/i),
  role: z.string().trim().min(1).max(60).optional(),
  message: z.string().trim().max(500).optional().default(""),
});
