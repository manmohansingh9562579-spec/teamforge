import { redirect, notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Team, type ITeam } from "@/models/Team";
import { getCurrentUser } from "@/lib/session";
import { isTeamOwner, isTeamMember } from "@/services/teamService";

/**
 * Ensures the current user is signed in and a member (or owner) of the team
 * at the given slug. Never trusts client input — membership is always
 * re-derived from the database on every request.
 */
export async function requireTeamAccess(slug: string): Promise<{
  team: ITeam;
  userId: string;
  isOwner: boolean;
}> {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  await connectDB();
  const team = await Team.findOne({ slug });
  if (!team) notFound();

  const userId = user._id.toString();
  if (!isTeamMember(team, userId)) {
    redirect(`/teams/${slug}`);
  }

  return { team, userId, isOwner: isTeamOwner(team, userId) };
}

export async function requireTeamOwner(slug: string) {
  const result = await requireTeamAccess(slug);
  if (!result.isOwner) redirect(`/teams/${slug}/workspace`);
  return result;
}
