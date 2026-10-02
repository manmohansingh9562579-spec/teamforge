import { notFound } from "next/navigation";
import Link from "next/link";
import { Users, Calendar, Layers } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, SkillBadge } from "@/components/ui/Badge";
import { TeamActions } from "@/components/teams/TeamActions";
import { CompatibilityCard } from "@/components/teams/CompatibilityCard";
import { connectDB } from "@/lib/db";
import { Team } from "@/models/Team";
import { User } from "@/models/User";
import { getCurrentSession, getCurrentUser } from "@/lib/session";
import { isTeamOwner, isTeamMember, openPositions } from "@/services/teamService";
import { calculateMatch } from "@/services/matchingService";

export const dynamic = "force-dynamic";

async function getTeamWithPeople(slug: string) {
  await connectDB();
  const team = await Team.findOne({ slug });
  if (!team) return null;

  const owner = await User.findById(team.ownerId).select("name username avatar");
  const members = await User.find({
    _id: { $in: team.members.map((m) => m.userId) },
  }).select("name username avatar");

  return { team, owner, members };
}

export default async function TeamPage({ params }: { params: { slug: string } }) {
  const data = await getTeamWithPeople(params.slug);
  if (!data) notFound();
  const { team, owner, members } = data;

  const session = await getCurrentSession();
  const userId = session?.user?.id;
  const open = openPositions(team);

  const currentUser = userId ? await getCurrentUser() : null;
  const isViewerMember = !!userId && isTeamMember(team, userId);
  const match =
    currentUser && !isViewerMember
      ? calculateMatch(
          {
            skills: currentUser.skills,
            preferredRoles: currentUser.preferredRoles,
            interests: currentUser.interests,
            availability: currentUser.availability,
          },
          { requiredSkills: team.requiredSkills, requiredRoles: team.requiredRoles }
        )
      : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container-page max-w-[820px] py-10">
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <Badge tone="neutral">{team.projectType}</Badge>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text">
                {team.projectTitle}
              </h1>
              <p className="mt-1 text-[14px] text-muted">{team.name}</p>
            </div>
            <TeamActions
              teamId={team._id.toString()}
              slug={team.slug}
              isOwner={!!userId && isTeamOwner(team, userId)}
              isMember={!!userId && isTeamMember(team, userId) && !isTeamOwner(team, userId)}
              isFull={open <= 0}
              isSignedIn={!!userId}
              currentUserId={userId}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-5 text-[13px] text-muted">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {open > 0 ? `${open} open position${open === 1 ? "" : "s"}` : "Team full"} ·{" "}
              {team.teamSize} max
            </span>
            {team.deadline && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Deadline {new Date(team.deadline).toLocaleDateString()}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              {team.status}
            </span>
          </div>

          <p className="mt-6 max-w-[65ch] whitespace-pre-line text-[14px] leading-relaxed text-text">
            {team.description}
          </p>

          {match && <CompatibilityCard match={match} />}

          {team.requiredRoles.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[13px] font-medium text-muted">Required roles</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {team.requiredRoles.map((r) => (
                  <Badge key={r} tone="accent">
                    {r}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {team.requiredSkills.length > 0 && (
            <section className="mt-6">
              <h2 className="text-[13px] font-medium text-muted">Required skills</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {team.requiredSkills.map((s) => (
                  <SkillBadge key={s}>{s}</SkillBadge>
                ))}
              </div>
            </section>
          )}

          {team.techStack.length > 0 && (
            <section className="mt-6">
              <h2 className="text-[13px] font-medium text-muted">Tech stack</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {team.techStack.map((s) => (
                  <SkillBadge key={s}>{s}</SkillBadge>
                ))}
              </div>
            </section>
          )}

          <section className="mt-8 border-t border-border pt-6">
            <h2 className="text-[13px] font-medium text-muted">Team</h2>
            <div className="mt-3 space-y-2">
              {owner && (
                <Link
                  href={`/developers/${owner.username}`}
                  className="flex items-center gap-2.5 rounded-md p-1.5 hover:bg-surface-hover"
                >
                  <Avatar name={owner.name} src={owner.avatar} size="sm" />
                  <span className="text-[13px] text-text">{owner.name}</span>
                  <Badge tone="accent">Owner</Badge>
                </Link>
              )}
              {members.map((m) => (
                <Link
                  key={m._id.toString()}
                  href={`/developers/${m.username}`}
                  className="flex items-center gap-2.5 rounded-md p-1.5 hover:bg-surface-hover"
                >
                  <Avatar name={m.name} src={m.avatar} size="sm" />
                  <span className="text-[13px] text-text">{m.name}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
