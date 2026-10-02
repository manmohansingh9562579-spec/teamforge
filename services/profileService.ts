import { z } from "zod";
import { EXPERIENCE_LEVELS, AVAILABILITY, INTERESTS, ROLES } from "@/lib/constants";
import type { IUser } from "@/models/User";

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  headline: z.string().trim().max(120).optional().default(""),
  bio: z.string().trim().max(600).optional().default(""),
  location: z.string().trim().max(80).optional().default(""),
  college: z.string().trim().max(120).optional().default(""),
  graduationYear: z.coerce.number().int().min(1990).max(2035).optional(),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).optional(),
  availability: z.enum(AVAILABILITY).optional(),
  skills: z.array(z.string().trim().min(1)).max(30).default([]),
  preferredRoles: z.array(z.enum(ROLES)).max(9).default([]),
  interests: z.array(z.enum(INTERESTS)).max(5).default([]),
  githubUrl: z.string().trim().url().optional().or(z.literal("")),
  linkedinUrl: z.string().trim().url().optional().or(z.literal("")),
  portfolioUrl: z.string().trim().url().optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;

/**
 * Calculates profile completion as a percentage, based purely on which
 * fields are actually filled in. Never hardcoded.
 */
export function calculateProfileCompletion(user: Pick<IUser,
  "headline" | "bio" | "skills" | "preferredRoles" | "experienceLevel" |
  "interests" | "githubUrl" | "linkedinUrl" | "portfolioUrl" | "college" | "location"
>): number {
  const checks = [
    !!user.headline,
    !!user.bio,
    user.skills.length > 0,
    user.preferredRoles.length > 0,
    !!user.experienceLevel,
    user.interests.length > 0,
    !!(user.githubUrl || user.linkedinUrl || user.portfolioUrl),
    !!(user.college || user.location),
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}
