import { Team } from "@/models/Team";
import { slugify } from "@/lib/utils";

/**
 * Server-only: generates a unique, URL-safe slug for a new team by
 * checking the database. Do not import this file from client components —
 * use services/teamHelpers.ts for pure, client-safe team logic instead.
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "team";
  let slug = base;
  let attempt = 1;

  while (await Team.exists({ slug })) {
    attempt += 1;
    slug = `${base}-${attempt}`;
  }

  return slug;
}

export { isTeamOwner, isTeamMember, openPositions } from "./teamHelpers";
